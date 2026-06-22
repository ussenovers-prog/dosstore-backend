import { IImportService } from './interfaces/import-service.interface.js';
import { ImportSource } from '@prisma/client';
/**
 * ImportFactory — фабрика для получения нужного ImportService по типу источника
 *
 * Расширяемая архитектура: для добавления нового типа импорта
 * нужно создать новый класс, реализующий IImportService,
 * и зарегистрировать его здесь.
 */
declare class ImportFactory {
    private handlers;
    constructor();
    register(source: ImportSource, service: IImportService): void;
    get(source: ImportSource): IImportService | undefined;
    has(source: ImportSource): boolean;
    getSupportedSources(): ImportSource[];
}
export declare const importFactory: ImportFactory;
export {};
//# sourceMappingURL=import-factory.d.ts.map