import prisma from '../../utils/prisma.js';
import { CreateVisitorInput, UpdateVisitorInput, VisitorQueryInput } from './visitors.schema.js';
import { NotFoundError } from '../../middleware/errorHandler.js';
import { Prisma } from '@prisma/client';

class VisitorsService {
  async list(query: VisitorQueryInput) {
    const { page, limit, storeId, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.VisitorWhereInput = {};
    if (storeId) where.storeId = storeId;
    if (dateFrom || dateTo) {
      where.visitDate = {};
      if (dateFrom) where.visitDate.gte = new Date(dateFrom);
      if (dateTo) where.visitDate.lte = new Date(dateTo);
    }

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { visitDate: 'desc' },
        include: {
          store: { select: { id: true, name: true } },
          enterer: { select: { id: true, fullName: true } },
        },
      }),
      prisma.visitor.count({ where }),
    ]);

    return {
      data: visitors,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: number) {
    const visitor = await prisma.visitor.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, name: true } },
        enterer: { select: { id: true, fullName: true } },
      },
    });

    if (!visitor) throw new NotFoundError('Visitor record');
    return visitor;
  }

  async upsert(input: CreateVisitorInput, userId: number) {
    const store = await prisma.store.findUnique({ where: { id: input.storeId } });
    if (!store) throw new NotFoundError('Store');

    const visitDate = new Date(input.visitDate);

    const visitor = await prisma.visitor.upsert({
      where: {
        storeId_visitDate: {
          storeId: input.storeId,
          visitDate: visitDate,
        },
      },
      update: {
        count: input.count,
        buyersCount: input.buyersCount,
        enteredBy: userId,
      },
      create: {
        storeId: input.storeId,
        visitDate: visitDate,
        count: input.count,
        buyersCount: input.buyersCount,
        enteredBy: userId,
      },
      include: {
        store: { select: { id: true, name: true } },
      },
    });

    return visitor;
  }

  async update(id: number, input: UpdateVisitorInput) {
    const visitor = await prisma.visitor.findUnique({ where: { id } });
    if (!visitor) throw new NotFoundError('Visitor record');

    const updated = await prisma.visitor.update({
      where: { id },
      data: {
        ...(input.count !== undefined && { count: input.count }),
        ...(input.buyersCount !== undefined && { buyersCount: input.buyersCount }),
      },
      include: {
        store: { select: { id: true, name: true } },
      },
    });

    return updated;
  }

  async delete(id: number) {
    const visitor = await prisma.visitor.findUnique({ where: { id } });
    if (!visitor) throw new NotFoundError('Visitor record');

    await prisma.visitor.delete({ where: { id } });
    return { message: 'Visitor record deleted' };
  }
}

export const visitorsService = new VisitorsService();
