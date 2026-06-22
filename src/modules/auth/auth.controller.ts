import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { RegisterInput, LoginInput, RefreshTokenInput } from './auth.schema.js';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as RegisterInput;
      const result = await authService.register(input);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as LoginInput;
      const result = await authService.login(input);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as RefreshTokenInput;
      const tokens = await authService.refresh(input.refreshToken);
      res.json({ data: tokens });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    // JWT is stateless, so logout is handled client-side by removing tokens
    // In production, you might want to maintain a token blacklist
    res.json({ data: { message: 'Logged out successfully' } });
  }
}

export const authController = new AuthController();
