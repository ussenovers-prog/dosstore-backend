import prisma from '../../utils/prisma.js';
import { hashPassword } from '../../utils/password.js';
import { CreateUserInput, UpdateUserInput, UserQueryInput } from './users.schema.js';
import { AppError, NotFoundError } from '../../middleware/errorHandler.js';

class UsersService {
  async list(query: UserQueryInput) {
    const { page, limit, role, storeId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (storeId) where.storeId = storeId;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: number) {
    const user = await prisma.user.findUnique({
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

    if (!user) throw new NotFoundError('User');
    return user;
  }

  async create(input: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');

    if (input.storeId) {
      const store = await prisma.store.findUnique({ where: { id: input.storeId } });
      if (!store) throw new NotFoundError('Store');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
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

  async update(id: number, input: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User');

    if (input.storeId) {
      const store = await prisma.store.findUnique({ where: { id: input.storeId } });
      if (!store) throw new NotFoundError('Store');
    }

    const updated = await prisma.user.update({
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

  async deactivate(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User');

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated' };
  }
}

export const usersService = new UsersService();
