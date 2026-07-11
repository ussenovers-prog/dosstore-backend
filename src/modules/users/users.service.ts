import prisma from '../../utils/prisma.js';
import { hashPassword } from '../../utils/password.js';
import { CreateUserInput, ResetPasswordInput, UpdateUserInput, UserQueryInput } from './users.schema.js';
import { AppError, NotFoundError } from '../../middleware/errorHandler.js';
import { withNestedDisplayStoreName } from '../../utils/storeDisplay.js';

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
      data: users.map(withNestedDisplayStoreName),
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
    return withNestedDisplayStoreName(user);
  }

  async create(input: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');

    if (input.storeId) {
      const store = await prisma.store.findUnique({ where: { id: input.storeId } });
      if (!store) throw new NotFoundError('Store');
    }
    if (input.role === 'employee' && !input.storeId) {
      throw new AppError('Employee must be assigned to a store', 400, 'STORE_REQUIRED');
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
    const nextRole = input.role ?? user.role;
    const nextStoreId = input.storeId === undefined ? user.storeId : input.storeId;

    if (input.storeId) {
      const store = await prisma.store.findUnique({ where: { id: input.storeId } });
      if (!store) throw new NotFoundError('Store');
    }
    if (nextRole === 'employee' && !nextStoreId) {
      throw new AppError('Employee must be assigned to a store', 400, 'STORE_REQUIRED');
    }
    if (user.role === 'owner' && input.role === 'employee') {
      await this.assertAnotherActiveOwner(id);
    }
    if (user.role === 'owner' && input.isActive === false) {
      await this.assertAnotherActiveOwner(id);
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
    if (user.role === 'owner') {
      await this.assertAnotherActiveOwner(id);
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated' };
  }

  async resetPassword(id: number, input: ResetPasswordInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User');

    const passwordHash = await hashPassword(input.password);
    const updated = await prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        storeId: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  private async assertAnotherActiveOwner(userId: number) {
    const ownerCount = await prisma.user.count({
      where: {
        id: { not: userId },
        role: 'owner',
        isActive: true,
      },
    });
    if (ownerCount === 0) {
      throw new AppError('At least one active owner is required', 400, 'LAST_OWNER');
    }
  }
}

export const usersService = new UsersService();
