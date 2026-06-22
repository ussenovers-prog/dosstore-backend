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
declare class GoogleSheetsService {
    private auth;
    authenticate(): Promise<void>;
    fetchSheet(spreadsheetId: string, range: string): Promise<any[][]>;
    fetchAdExpenses(): Promise<any[][]>;
}
export declare const googleSheetsService: GoogleSheetsService;
export {};
//# sourceMappingURL=google-sheets.service.d.ts.map