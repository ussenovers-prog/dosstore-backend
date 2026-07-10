import { Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service.js';
import { DashboardQueryInput, TopProductsQueryInput, AbcAnalysisQueryInput } from './dashboard.schema.js';
import { AuthenticatedRequest } from '../../types/express.d.js';
import { getEffectiveStoreId } from '../../middleware/storeAccess.js';

class DashboardController {
  async getKPIs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as DashboardQueryInput;
      query.storeId = getEffectiveStoreId(req.user, query.storeId) || undefined;
      const data = await dashboardService.getKPIs(query);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async getSalesDynamic(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as DashboardQueryInput;
      query.storeId = getEffectiveStoreId(req.user, query.storeId) || undefined;
      const data = await dashboardService.getSalesDynamic(query);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async getDailyFinancials(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as DashboardQueryInput;
      query.storeId = getEffectiveStoreId(req.user, query.storeId) || undefined;
      const data = await dashboardService.getDailyFinancials(query);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async getStoresComparison(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as DashboardQueryInput;
      query.storeId = getEffectiveStoreId(req.user, query.storeId) || undefined;
      const data = await dashboardService.getStoresComparison(query);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as TopProductsQueryInput;
      query.storeId = getEffectiveStoreId(req.user, query.storeId) || undefined;
      const data = await dashboardService.getTopProducts(query);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async getAbcAnalysis(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as AbcAnalysisQueryInput;
      query.storeId = getEffectiveStoreId(req.user, query.storeId) || undefined;
      const data = await dashboardService.getAbcAnalysis(query);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async getExpenseBreakdown(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as DashboardQueryInput;
      query.storeId = getEffectiveStoreId(req.user, query.storeId) || undefined;
      const data = await dashboardService.getExpenseBreakdown(query);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async getInventorySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as DashboardQueryInput;
      query.storeId = getEffectiveStoreId(req.user, query.storeId) || undefined;
      const data = await dashboardService.getInventorySummary(query);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async getNoMovementProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as DashboardQueryInput;
      query.storeId = getEffectiveStoreId(req.user, query.storeId) || undefined;
      const data = await dashboardService.getNoMovementProducts(query);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async getLowStockProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as DashboardQueryInput;
      query.storeId = getEffectiveStoreId(req.user, query.storeId) || undefined;
      const data = await dashboardService.getLowStockProducts(query);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryTurnover(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as DashboardQueryInput;
      query.storeId = getEffectiveStoreId(req.user, query.storeId) || undefined;
      const data = await dashboardService.getInventoryTurnover(query);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
