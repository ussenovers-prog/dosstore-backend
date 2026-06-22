import { ImportSource, ImportStatus } from '@prisma/client';
export interface LogImportParams {
    sourceType: ImportSource;
    storeId?: number;
    fileName: string;
    status: ImportStatus;
    recordsProcessed: number;
    recordsFailed: number;
    errorMessage?: string;
}
declare class ImportLogService {
    log(params: LogImportParams): Promise<{
        status: string;
        storeId: number | null;
        id: number;
        sourceType: string;
        fileName: string;
        recordsProcessed: number;
        recordsFailed: number;
        errorMessage: string | null;
        importedAt: Date;
    }>;
    getRecent(limit?: number): Promise<({
        store: {
            id: number;
            name: string;
        } | null;
    } & {
        status: string;
        storeId: number | null;
        id: number;
        sourceType: string;
        fileName: string;
        recordsProcessed: number;
        recordsFailed: number;
        errorMessage: string | null;
        importedAt: Date;
    })[]>;
    getBySource(sourceType: ImportSource, limit?: number): Promise<{
        status: string;
        storeId: number | null;
        id: number;
        sourceType: string;
        fileName: string;
        recordsProcessed: number;
        recordsFailed: number;
        errorMessage: string | null;
        importedAt: Date;
    }[]>;
    getErrors(limit?: number): Promise<({
        store: {
            id: number;
            name: string;
        } | null;
    } & {
        status: string;
        storeId: number | null;
        id: number;
        sourceType: string;
        fileName: string;
        recordsProcessed: number;
        recordsFailed: number;
        errorMessage: string | null;
        importedAt: Date;
    })[]>;
}
export declare const importLogService: ImportLogService;
export {};
//# sourceMappingURL=import-log.service.d.ts.map