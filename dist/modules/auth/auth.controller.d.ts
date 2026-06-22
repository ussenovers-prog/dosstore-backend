import { Request, Response, NextFunction } from 'express';
declare class AuthController {
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
export {};
//# sourceMappingURL=auth.controller.d.ts.map