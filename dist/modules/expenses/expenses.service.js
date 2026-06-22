"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expensesService = void 0;
const prisma_js_1 = __importDefault(require("../../utils/prisma.js"));
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
class ExpensesService {
    async list(query) {
        const { page, limit, storeId, category, dateFrom, dateTo, isRecurring, source } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (storeId)
            where.storeId = storeId;
        if (category)
            where.category = category;
        if (isRecurring !== undefined)
            where.isRecurring = isRecurring;
        if (source)
            where.source = source;
        if (dateFrom || dateTo) {
            where.expenseDate = {};
            if (dateFrom)
                where.expenseDate.gte = new Date(dateFrom);
            if (dateTo)
                where.expenseDate.lte = new Date(dateTo);
        }
        const [expenses, total] = await Promise.all([
            prisma_js_1.default.expense.findMany({
                where,
                skip,
                take: limit,
                orderBy: { expenseDate: 'desc' },
                include: {
                    store: { select: { id: true, name: true } },
                    creator: { select: { id: true, fullName: true } },
                },
            }),
            prisma_js_1.default.expense.count({ where }),
        ]);
        return {
            data: expenses,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async getById(id) {
        const expense = await prisma_js_1.default.expense.findUnique({
            where: { id },
            include: {
                store: { select: { id: true, name: true } },
                creator: { select: { id: true, fullName: true } },
            },
        });
        if (!expense)
            throw new errorHandler_js_1.NotFoundError('Expense');
        return expense;
    }
    async create(input, userId) {
        const store = await prisma_js_1.default.store.findUnique({ where: { id: input.storeId } });
        if (!store)
            throw new errorHandler_js_1.NotFoundError('Store');
        const expense = await prisma_js_1.default.expense.create({
            data: {
                storeId: input.storeId,
                category: input.category,
                expenseDate: new Date(input.expenseDate),
                amount: input.amount,
                description: input.description,
                isRecurring: input.isRecurring,
                source: input.source || 'manual',
                campaignName: input.campaignName,
                channel: input.channel,
                createdBy: userId,
            },
            include: {
                store: { select: { id: true, name: true } },
            },
        });
        return expense;
    }
    async update(id, input) {
        const expense = await prisma_js_1.default.expense.findUnique({ where: { id } });
        if (!expense)
            throw new errorHandler_js_1.NotFoundError('Expense');
        const updated = await prisma_js_1.default.expense.update({
            where: { id },
            data: {
                ...(input.category && { category: input.category }),
                ...(input.expenseDate && { expenseDate: new Date(input.expenseDate) }),
                ...(input.amount !== undefined && { amount: input.amount }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.isRecurring !== undefined && { isRecurring: input.isRecurring }),
                ...(input.campaignName !== undefined && { campaignName: input.campaignName }),
                ...(input.channel !== undefined && { channel: input.channel }),
            },
            include: {
                store: { select: { id: true, name: true } },
            },
        });
        return updated;
    }
    async delete(id) {
        const expense = await prisma_js_1.default.expense.findUnique({ where: { id } });
        if (!expense)
            throw new errorHandler_js_1.NotFoundError('Expense');
        await prisma_js_1.default.expense.delete({ where: { id } });
        return { message: 'Expense deleted' };
    }
}
exports.expensesService = new ExpensesService();
//# sourceMappingURL=expenses.service.js.map