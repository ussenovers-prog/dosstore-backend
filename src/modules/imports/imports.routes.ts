import { Router } from 'express';
import prisma from '../../utils/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';
import { storeAccessMiddleware, getEffectiveStoreId } from '../../middleware/storeAccess.js';
import { AuthenticatedRequest } from '../../types/express.d.js';
import { Response, NextFunction } from 'express';

const router = Router();

router.use(authMiddleware);
router.use(storeAccessMiddleware);

/**
 * GET /api/imports
 * Список всех импортов с фильтрацией
 */
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const storeId = getEffectiveStoreId(req.user, req.query.storeId);
    const sourceType = req.query.sourceType as string;
    const status = req.query.status as string;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (sourceType) where.sourceType = sourceType;
    if (status) where.status = status;

    const [imports, total] = await Promise.all([
      prisma.importLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { importedAt: 'desc' },
        include: {
          store: { select: { id: true, name: true } },
        },
      }),
      prisma.importLog.count({ where }),
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
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/imports/stats
 * Статистика импортов
 */
router.get('/stats/summary', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const storeId = getEffectiveStoreId(req.user, req.query.storeId);
    const where: any = {};
    if (storeId) where.storeId = storeId;

    const [total, success, errors, partial] = await Promise.all([
      prisma.importLog.count({ where }),
      prisma.importLog.count({ where: { ...where, status: 'success' } }),
      prisma.importLog.count({ where: { ...where, status: 'error' } }),
      prisma.importLog.count({ where: { ...where, status: 'partial' } }),
    ]);

    const lastImport = await prisma.importLog.findFirst({
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
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/imports/:id
 * Детали конкретного импорта
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const importLog = await prisma.importLog.findUnique({
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
  } catch (error) {
    next(error);
  }
});

export default router;
