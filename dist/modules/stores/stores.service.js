"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storesService = void 0;
const prisma_js_1 = __importDefault(require("../../utils/prisma.js"));
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
class StoresService {
    async list() {
        const stores = await prisma_js_1.default.store.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                code: true,
                address: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        users: true,
                        products: true,
                    },
                },
            },
        });
        return { data: stores };
    }
    async getById(id) {
        const store = await prisma_js_1.default.store.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                code: true,
                address: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        users: true,
                        products: true,
                    },
                },
            },
        });
        if (!store)
            throw new errorHandler_js_1.NotFoundError('Store');
        return store;
    }
    async create(input) {
        const existing = await prisma_js_1.default.store.findUnique({ where: { code: input.code } });
        if (existing)
            throw new errorHandler_js_1.AppError('Store code already exists', 409, 'STORE_CODE_EXISTS');
        const store = await prisma_js_1.default.store.create({
            data: input,
            select: {
                id: true,
                name: true,
                code: true,
                address: true,
                isActive: true,
                createdAt: true,
            },
        });
        return store;
    }
    async update(id, input) {
        const store = await prisma_js_1.default.store.findUnique({ where: { id } });
        if (!store)
            throw new errorHandler_js_1.NotFoundError('Store');
        const updated = await prisma_js_1.default.store.update({
            where: { id },
            data: input,
            select: {
                id: true,
                name: true,
                code: true,
                address: true,
                isActive: true,
                createdAt: true,
            },
        });
        return updated;
    }
    async deactivate(id) {
        const store = await prisma_js_1.default.store.findUnique({ where: { id } });
        if (!store)
            throw new errorHandler_js_1.NotFoundError('Store');
        await prisma_js_1.default.store.update({
            where: { id },
            data: { isActive: false },
        });
        return { message: 'Store deactivated' };
    }
}
exports.storesService = new StoresService();
//# sourceMappingURL=stores.service.js.map