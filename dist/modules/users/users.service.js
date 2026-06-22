"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const prisma_js_1 = __importDefault(require("../../utils/prisma.js"));
const password_js_1 = require("../../utils/password.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
class UsersService {
    async list(query) {
        const { page, limit, role, storeId, isActive } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (role)
            where.role = role;
        if (storeId)
            where.storeId = storeId;
        if (isActive !== undefined)
            where.isActive = isActive;
        const [users, total] = await Promise.all([
            prisma_js_1.default.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    storeId: true,
                    isActive: true,
                    createdAt: true,
                    store: { select: { id: true, name: true } },
                },
            }),
            prisma_js_1.default.user.count({ where }),
        ]);
        return {
            data: users,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async getById(id) {
        const user = await prisma_js_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                storeId: true,
                isActive: true,
                createdAt: true,
                store: { select: { id: true, name: true } },
            },
        });
        if (!user)
            throw new errorHandler_js_1.NotFoundError('User');
        return user;
    }
    async create(input) {
        const existing = await prisma_js_1.default.user.findUnique({ where: { email: input.email } });
        if (existing)
            throw new errorHandler_js_1.AppError('Email already registered', 409, 'EMAIL_EXISTS');
        if (input.storeId) {
            const store = await prisma_js_1.default.store.findUnique({ where: { id: input.storeId } });
            if (!store)
                throw new errorHandler_js_1.NotFoundError('Store');
        }
        const passwordHash = await (0, password_js_1.hashPassword)(input.password);
        const user = await prisma_js_1.default.user.create({
            data: {
                email: input.email,
                passwordHash,
                fullName: input.fullName,
                role: input.role,
                storeId: input.storeId,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                storeId: true,
                isActive: true,
                createdAt: true,
            },
        });
        return user;
    }
    async update(id, input) {
        const user = await prisma_js_1.default.user.findUnique({ where: { id } });
        if (!user)
            throw new errorHandler_js_1.NotFoundError('User');
        if (input.storeId) {
            const store = await prisma_js_1.default.store.findUnique({ where: { id: input.storeId } });
            if (!store)
                throw new errorHandler_js_1.NotFoundError('Store');
        }
        const updated = await prisma_js_1.default.user.update({
            where: { id },
            data: input,
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                storeId: true,
                isActive: true,
                createdAt: true,
            },
        });
        return updated;
    }
    async deactivate(id) {
        const user = await prisma_js_1.default.user.findUnique({ where: { id } });
        if (!user)
            throw new errorHandler_js_1.NotFoundError('User');
        await prisma_js_1.default.user.update({
            where: { id },
            data: { isActive: false },
        });
        return { message: 'User deactivated' };
    }
}
exports.usersService = new UsersService();
//# sourceMappingURL=users.service.js.map