import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/express.d.js';
declare class ExpensesController {
    list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const expensesController: ExpensesController;
export {};
//# sourceMappingURL=expenses.controller.d.ts.map