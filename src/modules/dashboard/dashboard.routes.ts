import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { validate } from '../../middleware/validate.js';
import { dashboardQuerySchema, topProductsQuerySchema, abcAnalysisQuerySchema } from './dashboard.schema.js';
import { authMiddleware } from '../../middleware/auth.js';
import { storeAccessMiddleware } from '../../middleware/storeAccess.js';

const router = Router();

router.use(authMiddleware);
router.use(storeAccessMiddleware);

router.get('/kpi', validate(dashboardQuerySchema, 'query'), dashboardController.getKPIs);
router.get('/sales-dynamic', validate(dashboardQuerySchema, 'query'), dashboardController.getSalesDynamic);
router.get('/stores-comparison', validate(dashboardQuerySchema, 'query'), dashboardController.getStoresComparison);
router.get('/top-products', validate(topProductsQuerySchema, 'query'), dashboardController.getTopProducts);
router.get('/abc-analysis', validate(abcAnalysisQuerySchema, 'query'), dashboardController.getAbcAnalysis);
router.get('/expense-breakdown', validate(dashboardQuerySchema, 'query'), dashboardController.getExpenseBreakdown);
router.get('/inventory-summary', validate(dashboardQuerySchema, 'query'), dashboardController.getInventorySummary);
router.get('/no-movement-products', validate(dashboardQuerySchema, 'query'), dashboardController.getNoMovementProducts);
router.get('/low-stock-products', validate(dashboardQuerySchema, 'query'), dashboardController.getLowStockProducts);
router.get('/inventory-turnover', validate(dashboardQuerySchema, 'query'), dashboardController.getInventoryTurnover);

export default router;
