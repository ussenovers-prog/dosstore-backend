"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoreSchema = exports.createStoreSchema = void 0;
const zod_1 = require("zod");
exports.createStoreSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Store name is required').max(100),
    code: zod_1.z.string().min(1, 'Store code is required').max(20),
    address: zod_1.z.string().optional(),
});
exports.updateStoreSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    address: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=stores.schema.js.map