import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/express.d.js';
declare class VisitorsController {
    list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    upsert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const visitorsController: VisitorsController;
export {};
//# sourceMappingURL=visitors.controller.d.ts.map