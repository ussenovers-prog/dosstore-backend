"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const prisma_js_1 = __importDefault(require("../../utils/prisma.js"));
const password_js_1 = require("../../utils/password.js");
const jwt_js_1 = require("../../utils/jwt.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
class AuthService {
    async register(input) {
        const existingUser = await prisma_js_1.default.user.findUnique({
            where: { email: input.email },
        });
        if (existingUser) {
            throw new errorHandler_js_1.AppError('Email already registered', 409, 'EMAIL_EXISTS');
        }
        // Only owner can create owner accounts
        if (input.role === 'owner') {
            const ownerCount = await prisma_js_1.default.user.count({
                where: { role: 'owner' },
            });
            if (ownerCount > 0) {
                throw new errorHandler_js_1.AppError('Only one owner is allowed', 403, 'OWNER_EXISTS');
            }
        }
        // Validate store exists if storeId provided
        if (input.storeId) {
            const store = await prisma_js_1.default.store.findUnique({
                where: { id: input.storeId },
            });
            if (!store) {
                throw new errorHandler_js_1.AppError('Store not found', 404, 'STORE_NOT_FOUND');
            }
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
        });
        const tokens = this.generateTokens(user);
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                storeId: user.storeId,
            },
            tokens,
        };
    }
    async login(input) {
        const user = await prisma_js_1.default.user.findUnique({
            where: { email: input.email },
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        if (!user.isActive) {
            throw new errorHandler_js_1.AppError('Account is deactivated', 403, 'ACCOUNT_INACTIVE');
        }
        const isValidPassword = await (0, password_js_1.comparePassword)(input.password, user.passwordHash);
        if (!isValidPassword) {
            throw new errorHandler_js_1.AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        const tokens = this.generateTokens(user);
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                storeId: user.storeId,
            },
            tokens,
        };
    }
    async refresh(refreshToken) {
        try {
            const payload = (0, jwt_js_1.verifyToken)(refreshToken);
            const user = await prisma_js_1.default.user.findUnique({
                where: { id: payload.userId },
            });
            if (!user || !user.isActive) {
                throw new errorHandler_js_1.AppError('User not found or inactive', 401, 'INVALID_TOKEN');
            }
            return this.generateTokens(user);
        }
        catch (error) {
            throw new errorHandler_js_1.AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
        }
    }
    generateTokens(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            storeId: user.storeId,
        };
        return {
            accessToken: (0, jwt_js_1.signAccessToken)(payload),
            refreshToken: (0, jwt_js_1.signRefreshToken)(payload),
        };
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map