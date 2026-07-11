import prisma from '../../utils/prisma.js';
import { CreateExpenseInput, UpdateExpenseInput, ExpenseQueryInput } from './expenses.schema.js';
import { NotFoundError } from '../../middleware/errorHandler.js';
import { Prisma } from '@prisma/client';
import { withNestedDisplayStoreName } from '../../utils/storeDisplay.js';

class ExpensesService {
  async list(query: ExpenseQueryInput) {
    const { page, limit, storeId, category, dateFrom, dateTo, isRecurring, source } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {};
    if (storeId) where.storeId = storeId;
    if (category) where.category = category;
    if (isRecurring !== undefined) where.isRecurring = isRecurring;
    if (source) where.source = source;
    if (dateFrom || dateTo) {
      where.expenseDate = {};
      if (dateFrom) where.expenseDate.gte = new Date(`${dateFrom}T00:00:00.000Z`);
      if (dateTo) where.expenseDate.lte = new Date(`${dateTo}T23:59:59.999Z`);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expenseDate: 'desc' },
        include: {
          store: { select: { id: true, name: true } },
          creator: { select: { id: true, fullName: true } },
          editor: { select: { id: true, fullName: true } },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      data: expenses.map(withNestedDisplayStoreName),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: number) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, name: true } },
        creator: { select: { id: true, fullName: true } },
        editor: { select: { id: true, fullName: true } },
      },
    });

    if (!expense) throw new NotFoundError('Expense');
    return withNestedDisplayStoreName(expense);
  }

  async create(input: CreateExpenseInput, userId: number) {
    const store = await prisma.store.findUnique({ where: { id: input.storeId } });
    if (!store) throw new NotFoundError('Store');

    const expense = await prisma.expense.create({
      data: {
        storeId: input.storeId,
        category: input.category,
        expenseDate: new Date(input.expenseDate),
        amount: input.amount,
        description: input.description,
        isRecurring: input.isRecurring,
        source: input.source || 'manual',
        campaignName: input.campaignName,
        channel: input.channel,
        createdBy: userId,
      },
      include: {
        store: { select: { id: true, name: true } },
        creator: { select: { id: true, fullName: true } },
        editor: { select: { id: true, fullName: true } },
      },
    });

    return withNestedDisplayStoreName(expense);
  }

  async update(id: number, input: UpdateExpenseInput, userId: number) {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundError('Expense');

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(input.category && { category: input.category }),
        ...(input.expenseDate && { expenseDate: new Date(input.expenseDate) }),
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isRecurring !== undefined && { isRecurring: input.isRecurring }),
        ...(input.campaignName !== undefined && { campaignName: input.campaignName }),
        ...(input.channel !== undefined && { channel: input.channel }),
        updatedBy: userId,
      },
      include: {
        store: { select: { id: true, name: true } },
        creator: { select: { id: true, fullName: true } },
        editor: { select: { id: true, fullName: true } },
      },
    });

    return withNestedDisplayStoreName(updated);
  }

  async delete(id: number) {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundError('Expense');

    await prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted' };
  }
}

export const expensesService = new ExpensesService();
