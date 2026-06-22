"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userQuerySchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    fullName: zod_1.z.string().min(2, 'Full name is required'),
    role: zod_1.z.enum(['owner', 'employee']).default('employee'),
    storeId: zod_1.z.number().int().positive().optional(),
});
exports.updateUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).optional(),
    role: zod_1.z.enum(['owner', 'employee']).optional(),
    storeId: zod_1.z.number().int().positive().nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.userQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(500).default(50),
    role: zod_1.z.enum(['owner', 'employee']).optional(),
    storeId: zod_1.z.coerce.number().int().positive().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
});
//# sourceMappingURL=users.schema.js.map