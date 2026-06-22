import prisma from '../../utils/prisma.js';
import { ImportSource, ImportStatus } from '@prisma/client';

export interface LogImportParams {
  sourceType: ImportSource;
  storeId?: number;
  fileName: string;
  status: ImportStatus;
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
}

class ImportLogService {
  async log(params: LogImportParams) {
    return prisma.importLog.create({
      data: {
        sourceType: params.sourceType,
        storeId: params.storeId,
        fileName: params.fileName,
        status: params.status,
        recordsProcessed: params.recordsProcessed,
        recordsFailed: params.recordsFailed,
        errorMessage: params.errorMessage,
      },
    });
  }

  async getRecent(limit: number = 50) {
    return prisma.importLog.findMany({
      take: limit,
      orderBy: { importedAt: 'desc' },
      include: {
        store: { select: { id: true, name: true } },
      },
    });
  }

  async getBySource(sourceType: ImportSource, limit: number = 50) {
    return prisma.importLog.findMany({
      where: { sourceType },
      take: limit,
      orderBy: { importedAt: 'desc' },
    });
  }

  async getErrors(limit: number = 50) {
    return prisma.importLog.findMany({
      where: { status: 'error' },
      take: limit,
      orderBy: { importedAt: 'desc' },
      include: {
        store: { select: { id: true, name: true } },
      },
    });
  }
}

export const importLogService = new ImportLogService();
