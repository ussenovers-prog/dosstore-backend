import { env } from '../../config/env.js';

export type FtpSyncMode = 'sales' | 'inventory' | 'all';

interface StoreFtpConfig {
  host?: string;
  port: number;
  user?: string;
  password?: string;
  path?: string;
  protocol: 'ftp' | 'sftp';
}

export class FtpSyncError extends Error {
  constructor(
    public readonly code: 'FTP_SYNC_DISABLED' | 'FTP_NOT_CONFIGURED',
    message: string
  ) {
    super(message);
    this.name = 'FtpSyncError';
  }
}

class BeksarFtpService {
  private getStoreConfig(storeId: 1 | 2): StoreFtpConfig {
    if (storeId === 2) {
      return {
        host: env.STATUS_FTP_HOST,
        port: env.STATUS_FTP_PORT,
        user: env.STATUS_FTP_USER,
        password: env.STATUS_FTP_PASSWORD,
        path: env.STATUS_FTP_PATH,
        protocol: env.STATUS_FTP_PROTOCOL,
      };
    }

    return {
      host: env.DOSSTORE_FTP_HOST,
      port: env.DOSSTORE_FTP_PORT,
      user: env.DOSSTORE_FTP_USER,
      password: env.DOSSTORE_FTP_PASSWORD,
      path: env.DOSSTORE_FTP_PATH,
      protocol: env.DOSSTORE_FTP_PROTOCOL,
    };
  }

  async sync(storeId: 1 | 2, mode: FtpSyncMode) {
    if (!env.FTP_SYNC_ENABLED) {
      throw new FtpSyncError('FTP_SYNC_DISABLED', 'FTP sync is disabled');
    }

    const config = this.getStoreConfig(storeId);
    if (!config.host || !config.user || !config.password || !config.path) {
      throw new FtpSyncError('FTP_NOT_CONFIGURED', 'FTP is not configured for the selected store');
    }

    return {
      success: true,
      storeId,
      mode,
      status: 'ready',
      filesFound: 0,
      filesImported: 0,
      minFileAgeSeconds: env.FTP_SYNC_MIN_FILE_AGE_SECONDS,
    };
  }
}

export const beksarFtpService = new BeksarFtpService();
