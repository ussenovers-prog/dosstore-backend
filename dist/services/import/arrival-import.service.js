"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrivalImportService = void 0;
const prisma_js_1 = __importDefault(require("../../../utils/prisma.js"));
/**
 * ArrivalImportService — парсит Arrival.xml из Beksar POS
 *
 * TODO: Реализовать парсинг XML после получения примера структуры
 */
class ArrivalImportService {
    async parse(buffer) {
        console.warn('[ArrivalImportService] parse() not implemented yet');
        return [];
    }
    validate(records) {
        const valid = [];
        const errors = [];
        for (const record of records) {
            valid.push(record);
        }
        return { valid, errors };
    }
    async import(records, meta) {
        try {
            // TODO: Implement database import
            // 1. Upsert products
            // 2. Insert arrival records
            await prisma_js_1.default.importLog.create({
                data: {
                    sourceType: meta.sourceType,
                    storeId: meta.storeId,
                    fileName: meta.fileName,
                    status: 'success',
                    recordsProcessed: records.length,
                    recordsFailed: 0,
                },
            });
            return {
                success: true,
                recordsProcessed: records.length,
                recordsFailed: 0,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await prisma_js_1.default.importLog.create({
                data: {
                    sourceType: meta.sourceType,
                    storeId: meta.storeId,
                    fileName: meta.fileName,
                    status: 'error',
                    recordsProcessed: 0,
                    recordsFailed: records.length,
                    errorMessage,
                },
            });
            return {
                success: false,
                recordsProcessed: 0,
                recordsFailed: records.length,
                errorMessage,
            };
        }
    }
}
exports.arrivalImportService = new ArrivalImportService();
//# sourceMappingURL=arrival-import.service.js.map