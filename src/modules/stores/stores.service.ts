import prisma from '../../utils/prisma.js';
import { CreateStoreInput, UpdateStoreInput } from './stores.schema.js';
import { AppError, NotFoundError } from '../../middleware/errorHandler.js';

class StoresService {
  async list() {
    const stores = await prisma.store.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            products: true,
          },
        },
      },
    });

    return { data: stores };
  }

  async getById(id: number) {
    const store = await prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            products: true,
          },
        },
      },
    });

    if (!store) throw new NotFoundError('Store');
    return store;
  }

  async create(input: CreateStoreInput) {
    const existing = await prisma.store.findUnique({ where: { code: input.code } });
    if (existing) throw new AppError('Store code already exists', 409, 'STORE_CODE_EXISTS');

    const store = await prisma.store.create({
      data: input,
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        isActive: true,
        createdAt: true,
      },
    });

    return store;
  }

  async update(id: number, input: UpdateStoreInput) {
    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundError('Store');

    const updated = await prisma.store.update({
      where: { id },
      data: input,
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        isActive: true,
        createdAt: true,
      },
    });

    return updated;
  }

  async deactivate(id: number) {
    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundError('Store');

    await prisma.store.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Store deactivated' };
  }
}

export const storesService = new StoresService();
