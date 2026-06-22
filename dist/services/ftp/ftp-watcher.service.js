"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ftpWatcher = void 0;
const ftp_client_js_1 = require("./ftp-client.js");
const import_factory_js_1 = require("../import/import-factory.js");
const import_log_service_js_1 = require("../import/import-log.service.js");
const env_js_1 = require("../../config/env.js");
const client_1 = require("@prisma/client");
const path = __importStar(require("path"));
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
    intervalId = null;
    isRunning = false;
    directories = [
        {
            remotePath: env_js_1.env.FTP_SALES_PATH,
            sourceType: client_1.ImportSource.ftp_beksar_sales,
        },
        {
            remotePath: env_js_1.env.FTP_ARRIVAL_PATH,
            sourceType: client_1.ImportSource.ftp_beksar_arrival,
        },
        {
            remotePath: env_js_1.env.FTP_INVENTORY_PATH,
            sourceType: client_1.ImportSource.ftp_beksar_inventory,
        },
        {
            remotePath: env_js_1.env.FTP_GROSS_PROFIT_PATH,
            sourceType: client_1.ImportSource.ftp_beksar_gross_profit,
        },
    ];
    async start() {
        if (this.isRunning) {
            console.warn('[FTPWatcher] Already running');
            return;
        }
        if (!env_js_1.env.FTP_HOST) {
            console.warn('[FTPWatcher] FTP not configured, watcher disabled');
            return;
        }
        console.log(`[FTPWatcher] Starting with interval ${env_js_1.env.FTP_POLL_INTERVAL_MS}ms`);
        this.isRunning = true;
        // Initial poll
        await this.poll();
        // Schedule recurring polls
        this.intervalId = setInterval(() => this.poll(), env_js_1.env.FTP_POLL_INTERVAL_MS);
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        ftp_client_js_1.ftpClient.disconnect();
        console.log('[FTPWatcher] Stopped');
    }
    async poll() {
        console.log('[FTPWatcher] Polling FTP server...');
        try {
            await ftp_client_js_1.ftpClient.connect();
            for (const dir of this.directories) {
                await this.processDirectory(dir);
            }
        }
        catch (error) {
            console.error('[FTPWatcher] Poll error:', error);
        }
    }
    async processDirectory(dir) {
        try {
            const files = await ftp_client_js_1.ftpClient.listFiles(dir.remotePath);
            // Filter XML files only
            const xmlFiles = files.filter((f) => f.name.endsWith('.xml') && f.type === 1 // 1 = file
            );
            if (xmlFiles.length === 0) {
                console.log(`[FTPWatcher] No new files in ${dir.remotePath}`);
                return;
            }
            console.log(`[FTPWatcher] Found ${xmlFiles.length} file(s) in ${dir.remotePath}`);
            for (const file of xmlFiles) {
                await this.processFile(dir, file.name);
            }
        }
        catch (error) {
            console.error(`[FTPWatcher] Error processing directory ${dir.remotePath}:`, error);
        }
    }
    async processFile(dir, fileName) {
        const remotePath = path.posix.join(dir.remotePath, fileName);
        const archivePath = path.posix.join(env_js_1.env.FTP_ARCHIVE_PATH, fileName);
        try {
            console.log(`[FTPWatcher] Processing file: ${remotePath}`);
            // Download file to buffer
            const buffer = await ftp_client_js_1.ftpClient.downloadToBuffer(remotePath);
            // Get import service from factory
            const importService = import_factory_js_1.importFactory.get(dir.sourceType);
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
            console.log(`[FTPWatcher] File ${fileName}: ${result.recordsProcessed} processed, ${result.recordsFailed} failed`);
            // Archive file
            await ftp_client_js_1.ftpClient.moveFile(remotePath, archivePath);
            console.log(`[FTPWatcher] Archived: ${remotePath} → ${archivePath}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[FTPWatcher] Error processing ${fileName}:`, errorMessage);
            // Log error
            await import_log_service_js_1.importLogService.log({
                sourceType: dir.sourceType,
                fileName,
                status: 'error',
                recordsProcessed: 0,
                recordsFailed: 0,
                errorMessage,
            });
            // Move to error folder (optional)
            try {
                const errorPath = path.posix.join(env_js_1.env.FTP_ARCHIVE_PATH, 'errors', fileName);
                await ftp_client_js_1.ftpClient.moveFile(remotePath, errorPath);
            }
            catch (moveError) {
                console.error(`[FTPWatcher] Failed to move error file:`, moveError);
            }
        }
    }
}
exports.ftpWatcher = new FTPWatcher();
//# sourceMappingURL=ftp-watcher.service.js.map