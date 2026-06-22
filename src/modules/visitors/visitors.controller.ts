import { Response, NextFunction } from 'express';
import { visitorsService } from './visitors.service.js';
import { CreateVisitorInput, UpdateVisitorInput, VisitorQueryInput } from './visitors.schema.js';
import { AuthenticatedRequest } from '../../types/express.d.js';
import { getEffectiveStoreId } from '../../middleware/storeAccess.js';

class VisitorsController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as VisitorQueryInput;
      const storeId = getEffectiveStoreId(req.user, query.storeId);
      if (storeId) query.storeId = storeId;

      const result = await visitorsService.list(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const visitor = await visitorsService.getById(id);

      if (req.user.role === 'employee' && visitor.storeId !== req.user.storeId) {
        res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
        return;
      }

      res.json({ data: visitor });
    } catch (error) {
      next(error);
    }
  }

  async upsert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateVisitorInput;

      if (req.user.role === 'employee') {
        input.storeId = req.user.storeId!;
      }

      const visitor = await visitorsService.upsert(input, req.user.userId);
      res.status(201).json({ data: visitor });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const input = req.body as UpdateVisitorInput;

      if (req.user.role === 'employee') {
        const visitor = await visitorsService.getById(id);
        if (visitor.storeId !== req.user.storeId) {
          res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
          return;
        }
      }

      const visitor = await visitorsService.update(id, input);
      res.json({ data: visitor });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (req.user.role === 'employee') {
        const visitor = await visitorsService.getById(id);
        if (visitor.storeId !== req.user.storeId) {
          res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
          return;
        }
      }

      const result = await visitorsService.delete(id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const visitorsController = new VisitorsController();
