"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abcAnalysisQuerySchema = exports.topProductsQuerySchema = exports.dashboardQuerySchema = void 0;
const zod_1 = require("zod");
exports.dashboardQuerySchema = zod_1.z.object({
    storeId: zod_1.z.coerce.number().int().positive().optional(),
    dateFrom: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dateTo: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    granularity: zod_1.z.enum(['day', 'week', 'month']).default('day'),
});
exports.topProductsQuerySchema = zod_1.z.object({
    storeId: zod_1.z.coerce.number().int().positive().optional(),
    dateFrom: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dateTo: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
exports.abcAnalysisQuerySchema = zod_1.z.object({
    storeId: zod_1.z.coerce.number().int().positive().optional(),
    dateFrom: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dateTo: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
//# sourceMappingURL=dashboard.schema.js.map