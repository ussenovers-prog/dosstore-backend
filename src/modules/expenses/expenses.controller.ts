import { Response, NextFunction } from 'express';
import { expensesService } from './expenses.service.js';
import { CreateExpenseInput, UpdateExpenseInput, ExpenseQueryInput } from './expenses.schema.js';
import { AuthenticatedRequest } from '../../types/express.d.js';
import { getEffectiveStoreId } from '../../middleware/storeAccess.js';

class ExpensesController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ExpenseQueryInput;
      const storeId = getEffectiveStoreId(req.user, query.storeId);
      if (storeId) query.storeId = storeId;

      const result = await expensesService.list(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const expense = await expensesService.getById(id);

      // Employee can only see their store's expenses
      if (req.user.role === 'employee' && expense.storeId !== req.user.storeId) {
        res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
        return;
      }

      res.json({ data: expense });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateExpenseInput;

      // Employee can only create expenses for their store
      if (req.user.role === 'employee') {
        input.storeId = req.user.storeId!;
      }

      const expense = await expensesService.create(input, req.user.userId);
      res.status(201).json({ data: expense });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const input = req.body as UpdateExpenseInput;

      const expense = await expensesService.update(id, input, req.user.userId);
      res.json({ data: expense });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      const result = await expensesService.delete(id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const expensesController = new ExpensesController();
