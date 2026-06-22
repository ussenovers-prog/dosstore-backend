import * as ftp from 'basic-ftp';
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
declare class FTPClient {
    private client;
    private connected;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    listFiles(remotePath: string): Promise<ftp.FileInfo[]>;
    downloadFile(remotePath: string, localPath: string): Promise<void>;
    downloadToBuffer(remotePath: string): Promise<Buffer>;
    moveFile(remotePath: string, newPath: string): Promise<void>;
    isConnected(): boolean;
}
export declare const ftpClient: FTPClient;
export {};
//# sourceMappingURL=ftp-client.d.ts.map