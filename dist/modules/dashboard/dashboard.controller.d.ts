import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/express.d.js';
declare class DashboardController {
    getKPIs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSalesDynamic(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getStoresComparison(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTopProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getAbcAnalysis(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getExpenseBreakdown(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getInventorySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getNoMovementProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getLowStockProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getInventoryTurnover(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const dashboardController: DashboardController;
export {};
//# sourceMappingURL=dashboard.controller.d.ts.map