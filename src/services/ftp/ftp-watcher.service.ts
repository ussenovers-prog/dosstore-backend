import { ftpClient } from './ftp-client.js';
import { importFactory } from '../import/import-factory.js';
import { importLogService } from '../import/import-log.service.js';
import { env } from '../../config/env.js';
import { ImportSource } from '@prisma/client';
import * as path from 'path';

interface FTPDirectoryConfig {
  remotePath: string;
  sourceType: ImportSource;
  storeCode?: string;
}

/**
 * FTPWatcher — периодический опрос FTP на новые файлы
 *
 * Логика работы:
 * 1. Подключается к FTP
 * 2. Сканирует настроенные директории
 * 3. Для каждого нового файла:
 *    a. Скачивает в буфер
 *    b. Определяет тип → получает нужный ImportService из фабрики
 *    c. Парсит → валидирует → импортирует
 *    d. Логирует результат в import_log
 *    e. Перемещает файл в архивную папку
 * 4. Повторяет по cron-интервалу
 *
 * TODO: Активировать после получения доступа к FTP Beksar
 */
class FTPWatcher {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  private directories: FTPDirectoryConfig[] = [
    {
      remotePath: env.FTP_SALES_PATH,
      sourceType: ImportSource.ftp_beksar_sales,
    },
    {
      remotePath: env.FTP_ARRIVAL_PATH,
      sourceType: ImportSource.ftp_beksar_arrival,
    },
    {
      remotePath: env.FTP_INVENTORY_PATH,
      sourceType: ImportSource.ftp_beksar_inventory,
    },
    {
      remotePath: env.FTP_GROSS_PROFIT_PATH,
      sourceType: ImportSource.ftp_beksar_gross_profit,
    },
  ];

  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('[FTPWatcher] Already running');
      return;
    }

    if (!env.FTP_HOST) {
      console.warn('[FTPWatcher] FTP not configured, watcher disabled');
      return;
    }

    console.log(`[FTPWatcher] Starting with interval ${env.FTP_POLL_INTERVAL_MS}ms`);
    this.isRunning = true;

    // Initial poll
    await this.poll();

    // Schedule recurring polls
    this.intervalId = setInterval(() => this.poll(), env.FTP_POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    ftpClient.disconnect();
    console.log('[FTPWatcher] Stopped');
  }

  private async poll(): Promise<void> {
    console.log('[FTPWatcher] Polling FTP server...');

    try {
      await ftpClient.connect();

      for (const dir of this.directories) {
        await this.processDirectory(dir);
      }
    } catch (error) {
      console.error('[FTPWatcher] Poll error:', error);
    }
  }

  private async processDirectory(dir: FTPDirectoryConfig): Promise<void> {
    try {
      const files = await ftpClient.listFiles(dir.remotePath);

      // Filter XML files only
      const xmlFiles = files.filter(
        (f) => f.name.endsWith('.xml') && f.type === 1 // 1 = file
      );

      if (xmlFiles.length === 0) {
        console.log(`[FTPWatcher] No new files in ${dir.remotePath}`);
        return;
      }

      console.log(`[FTPWatcher] Found ${xmlFiles.length} file(s) in ${dir.remotePath}`);

      for (const file of xmlFiles) {
        await this.processFile(dir, file.name);
      }
    } catch (error) {
      console.error(`[FTPWatcher] Error processing directory ${dir.remotePath}:`, error);
    }
  }

  private async processFile(dir: FTPDirectoryConfig, fileName: string): Promise<void> {
    const remotePath = path.posix.join(dir.remotePath, fileName);
    const archivePath = path.posix.join(env.FTP_ARCHIVE_PATH, fileName);

    try {
      console.log(`[FTPWatcher] Processing file: ${remotePath}`);

      // Download file to buffer
      const buffer = await ftpClient.downloadToBuffer(remotePath);

      // Get import service from factory
      const importService = importFactory.get(dir.sourceType);
      if (!importService) {
        throw new Error(`No import service registered for ${dir.sourceType}`);
      }

      // Parse
      const records = await importService.parse(buffer);

      // Validate
      const validation = importService.validate(records);

      // Import
      const result = await importService.import(validation.valid, {
        sourceType: dir.sourceType,
        storeId: dir.storeCode ? undefined : undefined, // TODO: resolve store from file/path
        fileName,
      });

      console.log(
        `[FTPWatcher] File ${fileName}: ${result.recordsProcessed} processed, ${result.recordsFailed} failed`
      );

      // Archive file
      await ftpClient.moveFile(remotePath, archivePath);
      console.log(`[FTPWatcher] Archived: ${remotePath} → ${archivePath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[FTPWatcher] Error processing ${fileName}:`, errorMessage);

      // Log error
      await importLogService.log({
        sourceType: dir.sourceType,
        fileName,
        status: 'error',
        recordsProcessed: 0,
        recordsFailed: 0,
        errorMessage,
      });

      // Move to error folder (optional)
      try {
        const errorPath = path.posix.join(env.FTP_ARCHIVE_PATH, 'errors', fileName);
        await ftpClient.moveFile(remotePath, errorPath);
      } catch (moveError) {
        console.error(`[FTPWatcher] Failed to move error file:`, moveError);
      }
    }
  }
}

export const ftpWatcher = new FTPWatcher();
