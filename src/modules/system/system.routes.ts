import { Router, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requireOwner } from '../../middleware/roles.js';
import { AuthenticatedRequest } from '../../types/express.d.js';
import { withDisplayStoreName } from '../../utils/storeDisplay.js';

const router = Router();

const STATUS_SALES_SOURCE = 'beksar_status_sales';
const STATUS_INVENTORY_SOURCE = 'beksar_status_inventory';
const STATUS_SOURCE_TYPES = [STATUS_SALES_SOURCE, STATUS_INVENTORY_SOURCE];
const DOSSTORE_SALES_SOURCE = 'ftp_beksar_sales';
const DOSSTORE_INVENTORY_SOURCE = 'ftp_beksar_inventory';

router.use(authMiddleware);
router.use(requireOwner);

router.get('/health', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const checkedAt = new Date().toISOString();
    const health: SystemHealthResponse = {
      backend: {
        status: 'ok',
        checkedAt,
      },
      database: {
        status: 'ok',
        checkedAt,
      },
      statusStore: null,
      statusData: {
        salesCount: null,
        inventoryCount: null,
        latestInventorySnapshotDate: null,
      },
      dosstoreStore: null,
      dosstoreData: {
        salesCount: null,
        inventoryCount: null,
        latestInventorySnapshotDate: null,
      },
      imports: {
        lastStatusSalesImport: null,
        lastStatusInventoryImport: null,
        lastDosstoreSalesImport: null,
        lastDosstoreInventoryImport: null,
      },
      duplicateProtection: {
        status: 'enabled',
        fileHashGuard: true,
        guardedSourceTypes: STATUS_SOURCE_TYPES,
        protectedImports: 0,
        message: 'Duplicate Status files are rejected by file hash, and sales/inventory rows are protected by unique upserts.',
      },
    };

    try {
      await prisma.$queryRaw(Prisma.sql`SELECT 1`);
    } catch (error) {
      health.database.status = 'error';
      health.database.message = error instanceof Error ? error.message : 'Database check failed';
      res.json({ data: health });
      return;
    }

    const statusStore = await prisma.store.findFirst({
      where: {
        OR: [{ code: 'status' }, { name: 'Status' }],
      },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
      },
    });

    if (!statusStore) {
      health.statusData.message = 'Status store was not found';
      res.json({ data: health });
      return;
    }

    health.statusStore = withDisplayStoreName(statusStore);

    const latestSnapshot = await prisma.inventory.findFirst({
      where: { storeId: statusStore.id },
      orderBy: { snapshotDate: 'desc' },
      select: { snapshotDate: true },
    });

    const [salesCount, inventoryCount, lastStatusSalesImport, lastStatusInventoryImport, protectedImports] =
      await Promise.all([
        prisma.sale.count({ where: { storeId: statusStore.id } }),
        latestSnapshot
          ? prisma.inventory.count({
              where: {
                storeId: statusStore.id,
                snapshotDate: latestSnapshot.snapshotDate,
              },
            })
          : Promise.resolve(0),
        prisma.importLog.findFirst({
          where: { storeId: statusStore.id, sourceType: STATUS_SALES_SOURCE },
          orderBy: { importedAt: 'desc' },
          select: importLogSelect,
        }),
        prisma.importLog.findFirst({
          where: { storeId: statusStore.id, sourceType: STATUS_INVENTORY_SOURCE },
          orderBy: { importedAt: 'desc' },
          select: importLogSelect,
        }),
        prisma.importLog.count({
          where: {
            storeId: statusStore.id,
            sourceType: { in: STATUS_SOURCE_TYPES },
            fileHash: { not: null },
            status: { in: ['success', 'partial'] },
          },
        }),
      ]);

    health.statusData = {
      salesCount,
      inventoryCount,
      latestInventorySnapshotDate: latestSnapshot?.snapshotDate ?? null,
    };
    health.imports = {
      lastStatusSalesImport,
      lastStatusInventoryImport,
      lastDosstoreSalesImport: null,
      lastDosstoreInventoryImport: null,
    };
    health.duplicateProtection.protectedImports = protectedImports;

    const dosstoreStore = await prisma.store.findFirst({
      where: {
        OR: [{ code: 'dosstore' }, { name: 'Dosstore' }, { name: 'Store 1' }, { id: 1 }],
      },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
      },
    });

    if (dosstoreStore) {
      health.dosstoreStore = withDisplayStoreName(dosstoreStore);

      const latestDosstoreSnapshot = await prisma.inventory.findFirst({
        where: { storeId: dosstoreStore.id },
        orderBy: { snapshotDate: 'desc' },
        select: { snapshotDate: true },
      });

      const [dosstoreSalesCount, dosstoreInventoryCount, lastDosstoreSalesImport, lastDosstoreInventoryImport] =
        await Promise.all([
          prisma.sale.count({ where: { storeId: dosstoreStore.id } }),
          latestDosstoreSnapshot
            ? prisma.inventory.count({
                where: {
                  storeId: dosstoreStore.id,
                  snapshotDate: latestDosstoreSnapshot.snapshotDate,
                },
              })
            : Promise.resolve(0),
          prisma.importLog.findFirst({
            where: { storeId: dosstoreStore.id, sourceType: DOSSTORE_SALES_SOURCE },
            orderBy: { importedAt: 'desc' },
            select: importLogSelect,
          }),
          prisma.importLog.findFirst({
            where: { storeId: dosstoreStore.id, sourceType: DOSSTORE_INVENTORY_SOURCE },
            orderBy: { importedAt: 'desc' },
            select: importLogSelect,
          }),
        ]);

      health.dosstoreData = {
        salesCount: dosstoreSalesCount,
        inventoryCount: dosstoreInventoryCount,
        latestInventorySnapshotDate: latestDosstoreSnapshot?.snapshotDate ?? null,
      };
      health.imports.lastDosstoreSalesImport = lastDosstoreSalesImport;
      health.imports.lastDosstoreInventoryImport = lastDosstoreInventoryImport;
    } else {
      health.dosstoreData.message = 'Dosstore store was not found';
    }

    res.json({ data: health });
  } catch (error) {
    next(error);
  }
});

const importLogSelect = {
  id: true,
  sourceType: true,
  fileName: true,
  status: true,
  recordsProcessed: true,
  recordsFailed: true,
  importedAt: true,
} as const;

type HealthStatus = 'ok' | 'error';

interface SystemHealthResponse {
  backend: {
    status: HealthStatus;
    checkedAt: string;
  };
  database: {
    status: HealthStatus;
    checkedAt: string;
    message?: string;
  };
  statusStore: {
    id: number;
    name: string;
    code: string;
    isActive: boolean;
  } | null;
  statusData: {
    salesCount: number | null;
    inventoryCount: number | null;
    latestInventorySnapshotDate: Date | null;
    message?: string;
  };
  dosstoreStore: {
    id: number;
    name: string;
    code: string;
    isActive: boolean;
  } | null;
  dosstoreData: {
    salesCount: number | null;
    inventoryCount: number | null;
    latestInventorySnapshotDate: Date | null;
    message?: string;
  };
  imports: {
    lastStatusSalesImport: ImportLogSummary | null;
    lastStatusInventoryImport: ImportLogSummary | null;
    lastDosstoreSalesImport: ImportLogSummary | null;
    lastDosstoreInventoryImport: ImportLogSummary | null;
  };
  duplicateProtection: {
    status: 'enabled';
    fileHashGuard: boolean;
    guardedSourceTypes: string[];
    protectedImports: number;
    message: string;
  };
}

type ImportLogSummary = {
  id: number;
  sourceType: string;
  fileName: string;
  status: string;
  recordsProcessed: number;
  recordsFailed: number;
  importedAt: Date;
};

export default router;
