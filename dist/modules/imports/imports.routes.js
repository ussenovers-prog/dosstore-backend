"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_js_1 = __importDefault(require("../../utils/prisma.js"));
const auth_js_1 = require("../../middleware/auth.js");
const storeAccess_js_1 = require("../../middleware/storeAccess.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authMiddleware);
router.use(storeAccess_js_1.storeAccessMiddleware);
/**
 * GET /api/imports
 * Список всех импортов с фильтрацией
 */
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, req.query.storeId);
        const sourceType = req.query.sourceType;
        const status = req.query.status;
        const where = {};
        if (storeId)
            where.storeId = storeId;
        if (sourceType)
            where.sourceType = sourceType;
        if (status)
            where.status = status;
        const [imports, total] = await Promise.all([
            prisma_js_1.default.importLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { importedAt: 'desc' },
                include: {
                    store: { select: { id: true, name: true } },
                },
            }),
            prisma_js_1.default.importLog.count({ where }),
        ]);
        res.json({
            data: imports,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/imports/:id
 * Детали конкретного импорта
 */
router.get('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const importLog = await prisma_js_1.default.importLog.findUnique({
            where: { id },
            include: {
                store: { select: { id: true, name: true } },
            },
        });
        if (!importLog) {
            res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Import not found' } });
            return;
        }
        // Проверка доступа для employee
        if (req.user.role === 'employee' && importLog.storeId !== req.user.storeId) {
            res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
            return;
        }
        res.json({ data: importLog });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/imports/stats
 * Статистика импортов
 */
router.get('/stats/summary', async (req, res, next) => {
    try {
        const storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, req.query.storeId);
        const where = {};
        if (storeId)
            where.storeId = storeId;
        const [total, success, errors, partial] = await Promise.all([
            prisma_js_1.default.importLog.count({ where }),
            prisma_js_1.default.importLog.count({ where: { ...where, status: 'success' } }),
            prisma_js_1.default.importLog.count({ where: { ...where, status: 'error' } }),
            prisma_js_1.default.importLog.count({ where: { ...where, status: 'partial' } }),
        ]);
        const lastImport = await prisma_js_1.default.importLog.findFirst({
            where,
            orderBy: { importedAt: 'desc' },
        });
        res.json({
            data: {
                total,
                success,
                errors,
                partial,
                lastImportAt: lastImport?.importedAt || null,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=imports.routes.js.map