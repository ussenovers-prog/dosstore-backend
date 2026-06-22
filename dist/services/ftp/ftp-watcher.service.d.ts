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
declare class FTPWatcher {
    private intervalId;
    private isRunning;
    private directories;
    start(): Promise<void>;
    stop(): void;
    private poll;
    private processDirectory;
    private processFile;
}
export declare const ftpWatcher: FTPWatcher;
export {};
//# sourceMappingURL=ftp-watcher.service.d.ts.map