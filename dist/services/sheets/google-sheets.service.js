"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleSheetsService = void 0;
const googleapis_1 = require("googleapis");
const env_js_1 = require("../../config/env.js");
/**
 * GoogleSheetsService — чтение данных из Google Sheets
 *
 * TODO: Реализовать после настройки Google Service Account
 *
 * Шаги для подключения:
 * 1. Создать Service Account в Google Cloud Console
 * 2. Скачать credentials.json
 * 3. Предоставить доступ к таблице (email service account → Reader)
 * 4. Заполнить env: GOOGLE_SHEETS_CREDENTIALS_PATH, GOOGLE_SHEETS_AD_SPREADSHEET_ID
 */
class GoogleSheetsService {
    auth = null;
    async authenticate() {
        if (!env_js_1.env.GOOGLE_SHEETS_CREDENTIALS_PATH) {
            console.warn('[GoogleSheets] Credentials path not configured');
            return;
        }
        try {
            const auth = new googleapis_1.google.auth.GoogleAuth({
                keyFile: env_js_1.env.GOOGLE_SHEETS_CREDENTIALS_PATH,
                scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
            });
            this.auth = auth;
            console.log('[GoogleSheets] Authenticated successfully');
        }
        catch (error) {
            console.error('[GoogleSheets] Authentication failed:', error);
            throw error;
        }
    }
    async fetchSheet(spreadsheetId, range) {
        if (!this.auth) {
            await this.authenticate();
        }
        if (!this.auth) {
            throw new Error('Google Sheets not authenticated');
        }
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth: this.auth });
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });
            return response.data.values || [];
        }
        catch (error) {
            console.error('[GoogleSheets] Failed to fetch sheet:', error);
            throw error;
        }
    }
    async fetchAdExpenses() {
        if (!env_js_1.env.GOOGLE_SHEETS_AD_SPREADSHEET_ID) {
            console.warn('[GoogleSheets] Spreadsheet ID not configured');
            return [];
        }
        return this.fetchSheet(env_js_1.env.GOOGLE_SHEETS_AD_SPREADSHEET_ID, env_js_1.env.GOOGLE_SHEETS_AD_RANGE);
    }
}
exports.googleSheetsService = new GoogleSheetsService();
//# sourceMappingURL=google-sheets.service.js.map