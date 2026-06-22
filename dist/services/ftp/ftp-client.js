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
exports.ftpClient = void 0;
const ftp = __importStar(require("basic-ftp"));
const env_js_1 = require("../config/env.js");
/**
 * FTP Client wrapper — подключение и базовые операции
 *
 * TODO: Реализовать после получения доступа к FTP Beksar
 */
class FTPClient {
    client;
    connected = false;
    constructor() {
        this.client = new ftp.Client();
    }
    async connect() {
        if (!env_js_1.env.FTP_HOST || !env_js_1.env.FTP_USER) {
            console.warn('[FTPClient] FTP credentials not configured, skipping connection');
            return;
        }
        try {
            await this.client.access({
                host: env_js_1.env.FTP_HOST,
                port: env_js_1.env.FTP_PORT,
                user: env_js_1.env.FTP_USER,
                password: env_js_1.env.FTP_PASS,
                secure: false,
            });
            this.connected = true;
            console.log('[FTPClient] Connected to FTP server');
        }
        catch (error) {
            console.error('[FTPClient] Connection failed:', error);
            this.connected = false;
            throw error;
        }
    }
    async disconnect() {
        if (this.connected) {
            this.client.close();
            this.connected = false;
            console.log('[FTPClient] Disconnected from FTP server');
        }
    }
    async listFiles(remotePath) {
        if (!this.connected) {
            await this.connect();
        }
        try {
            return await this.client.list(remotePath);
        }
        catch (error) {
            console.error(`[FTPClient] Failed to list files in ${remotePath}:`, error);
            throw error;
        }
    }
    async downloadFile(remotePath, localPath) {
        if (!this.connected) {
            await this.connect();
        }
        try {
            await this.client.downloadTo(localPath, remotePath);
        }
        catch (error) {
            console.error(`[FTPClient] Failed to download ${remotePath}:`, error);
            throw error;
        }
    }
    async downloadToBuffer(remotePath) {
        if (!this.connected) {
            await this.connect();
        }
        try {
            const { Writable } = require('stream');
            const chunks = [];
            const writable = new Writable({
                write(chunk, encoding, callback) {
                    chunks.push(chunk);
                    callback();
                },
            });
            await this.client.downloadTo(writable, remotePath);
            return Buffer.concat(chunks);
        }
        catch (error) {
            console.error(`[FTPClient] Failed to download ${remotePath}:`, error);
            throw error;
        }
    }
    async moveFile(remotePath, newPath) {
        if (!this.connected) {
            await this.connect();
        }
        try {
            await this.client.rename(remotePath, newPath);
        }
        catch (error) {
            console.error(`[FTPClient] Failed to move ${remotePath} to ${newPath}:`, error);
            throw error;
        }
    }
    isConnected() {
        return this.connected;
    }
}
exports.ftpClient = new FTPClient();
//# sourceMappingURL=ftp-client.js.map