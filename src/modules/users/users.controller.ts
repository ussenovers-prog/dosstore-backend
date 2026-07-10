import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';
import { CreateUserInput, ResetPasswordInput, UpdateUserInput, UserQueryInput } from './users.schema.js';

class UsersController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as UserQueryInput;
      const result = await usersService.list(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await usersService.getById(id);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateUserInput;
      const user = await usersService.create(input);
      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const input = req.body as UpdateUserInput;
      const user = await usersService.update(id, input);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await usersService.deactivate(id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const input = req.body as ResetPasswordInput;
      const user = await usersService.resetPassword(id, input);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
