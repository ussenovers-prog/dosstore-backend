"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importLogService = void 0;
const prisma_js_1 = __importDefault(require("../../utils/prisma.js"));
class ImportLogService {
    async log(params) {
        return prisma_js_1.default.importLog.create({
            data: {
                sourceType: params.sourceType,
                storeId: params.storeId,
                fileName: params.fileName,
                status: params.status,
                recordsProcessed: params.recordsProcessed,
                recordsFailed: params.recordsFailed,
                errorMessage: params.errorMessage,
            },
        });
    }
    async getRecent(limit = 50) {
        return prisma_js_1.default.importLog.findMany({
            take: limit,
            orderBy: { importedAt: 'desc' },
            include: {
                store: { select: { id: true, name: true } },
            },
        });
    }
    async getBySource(sourceType, limit = 50) {
        return prisma_js_1.default.importLog.findMany({
            where: { sourceType },
            take: limit,
            orderBy: { importedAt: 'desc' },
        });
    }
    async getErrors(limit = 50) {
        return prisma_js_1.default.importLog.findMany({
            where: { status: 'error' },
            take: limit,
            orderBy: { importedAt: 'desc' },
            include: {
                store: { select: { id: true, name: true } },
            },
        });
    }
}
exports.importLogService = new ImportLogService();
//# sourceMappingURL=import-log.service.js.map