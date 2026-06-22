import * as ftp from 'basic-ftp';
import { env } from '../config/env.js';

export interface FTPConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  secure?: boolean;
}

/**
 * FTP Client wrapper — подключение и базовые операции
 *
 * TODO: Реализовать после получения доступа к FTP Beksar
 */
class FTPClient {
  private client: ftp.Client;
  private connected: boolean = false;

  constructor() {
    this.client = new ftp.Client();
  }

  async connect(): Promise<void> {
    if (!env.FTP_HOST || !env.FTP_USER) {
      console.warn('[FTPClient] FTP credentials not configured, skipping connection');
      return;
    }

    try {
      await this.client.access({
        host: env.FTP_HOST,
        port: env.FTP_PORT,
        user: env.FTP_USER,
        password: env.FTP_PASS,
        secure: false,
      });
      this.connected = true;
      console.log('[FTPClient] Connected to FTP server');
    } catch (error) {
      console.error('[FTPClient] Connection failed:', error);
      this.connected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      this.client.close();
      this.connected = false;
      console.log('[FTPClient] Disconnected from FTP server');
    }
  }

  async listFiles(remotePath: string): Promise<ftp.FileInfo[]> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      return await this.client.list(remotePath);
    } catch (error) {
      console.error(`[FTPClient] Failed to list files in ${remotePath}:`, error);
      throw error;
    }
  }

  async downloadFile(remotePath: string, localPath: string): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      await this.client.downloadTo(localPath, remotePath);
    } catch (error) {
      console.error(`[FTPClient] Failed to download ${remotePath}:`, error);
      throw error;
    }
  }

  async downloadToBuffer(remotePath: string): Promise<Buffer> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const { Writable } = require('stream');
      const chunks: Buffer[] = [];

      const writable = new Writable({
        write(chunk: Buffer, encoding: string, callback: Function) {
          chunks.push(chunk);
          callback();
        },
      });

      await this.client.downloadTo(writable, remotePath);
      return Buffer.concat(chunks);
    } catch (error) {
      console.error(`[FTPClient] Failed to download ${remotePath}:`, error);
      throw error;
    }
  }

  async moveFile(remotePath: string, newPath: string): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      await this.client.rename(remotePath, newPath);
    } catch (error) {
      console.error(`[FTPClient] Failed to move ${remotePath} to ${newPath}:`, error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const ftpClient = new FTPClient();
