"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseQuerySchema = exports.updateExpenseSchema = exports.createExpenseSchema = void 0;
const zod_1 = require("zod");
exports.createExpenseSchema = zod_1.z.object({
    storeId: zod_1.z.number().int().positive(),
    category: zod_1.z.enum(['salary', 'rent', 'utilities', 'target_ads', 'other']),
    expenseDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    description: zod_1.z.string().optional(),
    isRecurring: zod_1.z.boolean().default(false),
    source: zod_1.z.string().optional(),
    campaignName: zod_1.z.string().optional(),
    channel: zod_1.z.string().optional(),
});
exports.updateExpenseSchema = zod_1.z.object({
    category: zod_1.z.enum(['salary', 'rent', 'utilities', 'target_ads', 'other']).optional(),
    expenseDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    amount: zod_1.z.number().positive().optional(),
    description: zod_1.z.string().optional(),
    isRecurring: zod_1.z.boolean().optional(),
    campaignName: zod_1.z.string().optional(),
    channel: zod_1.z.string().optional(),
});
exports.expenseQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(500).default(50),
    storeId: zod_1.z.coerce.number().int().positive().optional(),
    category: zod_1.z.enum(['salary', 'rent', 'utilities', 'target_ads', 'other']).optional(),
    dateFrom: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dateTo: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    isRecurring: zod_1.z.coerce.boolean().optional(),
    source: zod_1.z.string().optional(),
});
//# sourceMappingURL=expenses.schema.js.map