import { Request, Response, NextFunction } from 'express';
import { storesService } from './stores.service.js';
import { CreateStoreInput, UpdateStoreInput } from './stores.schema.js';

class StoresController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await storesService.list();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const store = await storesService.getById(id);
      res.json({ data: store });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateStoreInput;
      const store = await storesService.create(input);
      res.status(201).json({ data: store });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const input = req.body as UpdateStoreInput;
      const store = await storesService.update(id, input);
      res.json({ data: store });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await storesService.deactivate(id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const storesController = new StoresController();
