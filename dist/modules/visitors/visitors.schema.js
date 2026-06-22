"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitorQuerySchema = exports.updateVisitorSchema = exports.createVisitorSchema = void 0;
const zod_1 = require("zod");
exports.createVisitorSchema = zod_1.z.object({
    storeId: zod_1.z.number().int().positive(),
    visitDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    count: zod_1.z.number().int().min(0, 'Visitors count must be >= 0'),
    buyersCount: zod_1.z.number().int().min(0).default(0),
});
exports.updateVisitorSchema = zod_1.z.object({
    count: zod_1.z.number().int().min(0).optional(),
    buyersCount: zod_1.z.number().int().min(0).optional(),
});
exports.visitorQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(500).default(50),
    storeId: zod_1.z.coerce.number().int().positive().optional(),
    dateFrom: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dateTo: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
//# sourceMappingURL=visitors.schema.js.map