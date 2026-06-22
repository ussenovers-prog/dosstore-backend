import { google } from 'googleapis';
import { env } from '../../config/env.js';

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
  private auth: any = null;

  async authenticate(): Promise<void> {
    if (!env.GOOGLE_SHEETS_CREDENTIALS_PATH) {
      console.warn('[GoogleSheets] Credentials path not configured');
      return;
    }

    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: env.GOOGLE_SHEETS_CREDENTIALS_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      this.auth = auth;
      console.log('[GoogleSheets] Authenticated successfully');
    } catch (error) {
      console.error('[GoogleSheets] Authentication failed:', error);
      throw error;
    }
  }

  async fetchSheet(spreadsheetId: string, range: string): Promise<any[][]> {
    if (!this.auth) {
      await this.authenticate();
    }

    if (!this.auth) {
      throw new Error('Google Sheets not authenticated');
    }

    const sheets = google.sheets({ version: 'v4', auth: this.auth });

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return response.data.values || [];
    } catch (error) {
      console.error('[GoogleSheets] Failed to fetch sheet:', error);
      throw error;
    }
  }

  async fetchAdExpenses(): Promise<any[][]> {
    if (!env.GOOGLE_SHEETS_AD_SPREADSHEET_ID) {
      console.warn('[GoogleSheets] Spreadsheet ID not configured');
      return [];
    }

    return this.fetchSheet(env.GOOGLE_SHEETS_AD_SPREADSHEET_ID, env.GOOGLE_SHEETS_AD_RANGE);
  }
}

export const googleSheetsService = new GoogleSheetsService();
