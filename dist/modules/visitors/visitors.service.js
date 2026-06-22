"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitorsService = void 0;
const prisma_js_1 = __importDefault(require("../../utils/prisma.js"));
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
class VisitorsService {
    async list(query) {
        const { page, limit, storeId, dateFrom, dateTo } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (storeId)
            where.storeId = storeId;
        if (dateFrom || dateTo) {
            where.visitDate = {};
            if (dateFrom)
                where.visitDate.gte = new Date(dateFrom);
            if (dateTo)
                where.visitDate.lte = new Date(dateTo);
        }
        const [visitors, total] = await Promise.all([
            prisma_js_1.default.visitor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { visitDate: 'desc' },
                include: {
                    store: { select: { id: true, name: true } },
                    enterer: { select: { id: true, fullName: true } },
                },
            }),
            prisma_js_1.default.visitor.count({ where }),
        ]);
        return {
            data: visitors,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async getById(id) {
        const visitor = await prisma_js_1.default.visitor.findUnique({
            where: { id },
            include: {
                store: { select: { id: true, name: true } },
                enterer: { select: { id: true, fullName: true } },
            },
        });
        if (!visitor)
            throw new errorHandler_js_1.NotFoundError('Visitor record');
        return visitor;
    }
    async upsert(input, userId) {
        const store = await prisma_js_1.default.store.findUnique({ where: { id: input.storeId } });
        if (!store)
            throw new errorHandler_js_1.NotFoundError('Store');
        const visitDate = new Date(input.visitDate);
        const visitor = await prisma_js_1.default.visitor.upsert({
            where: {
                storeId_visitDate: {
                    storeId: input.storeId,
                    visitDate: visitDate,
                },
            },
            update: {
                count: input.count,
                buyersCount: input.buyersCount,
                enteredBy: userId,
            },
            create: {
                storeId: input.storeId,
                visitDate: visitDate,
                count: input.count,
                buyersCount: input.buyersCount,
                enteredBy: userId,
            },
            include: {
                store: { select: { id: true, name: true } },
            },
        });
        return visitor;
    }
    async update(id, input) {
        const visitor = await prisma_js_1.default.visitor.findUnique({ where: { id } });
        if (!visitor)
            throw new errorHandler_js_1.NotFoundError('Visitor record');
        const updated = await prisma_js_1.default.visitor.update({
            where: { id },
            data: {
                ...(input.count !== undefined && { count: input.count }),
                ...(input.buyersCount !== undefined && { buyersCount: input.buyersCount }),
            },
            include: {
                store: { select: { id: true, name: true } },
            },
        });
        return updated;
    }
    async delete(id) {
        const visitor = await prisma_js_1.default.visitor.findUnique({ where: { id } });
        if (!visitor)
            throw new errorHandler_js_1.NotFoundError('Visitor record');
        await prisma_js_1.default.visitor.delete({ where: { id } });
        return { message: 'Visitor record deleted' };
    }
}
exports.visitorsService = new VisitorsService();
//# sourceMappingURL=visitors.service.js.map