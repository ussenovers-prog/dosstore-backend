import * as queries from './dashboard.queries.js';
import { DashboardQueryInput, TopProductsQueryInput, AbcAnalysisQueryInput } from './dashboard.schema.js';
import { NO_MOVEMENT_DAYS, LOW_STOCK_THRESHOLD } from '../../config/constants.js';
import { withDashboardCache } from './dashboard.cache.js';

class DashboardService {
  async getKPIs(query: DashboardQueryInput) {
    return withDashboardCache('kpi', query, async () => {
      const filter = {
        storeId: query.storeId,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      };

      const [metrics, inventorySummary] = await Promise.all([
        queries.getFinancialMetrics(filter),
        queries.getInventorySummary(filter),
      ]);

      return {
        ...metrics,
        inventoryValue: inventorySummary.totalValue,
        inventoryItems: inventorySummary.totalItems,
      };
    });
  }

  async getSalesDynamic(query: DashboardQueryInput) {
    return withDashboardCache('sales-dynamic', query, () => queries.getSalesDynamic(query));
  }

  async getDailyFinancials(query: DashboardQueryInput) {
    return withDashboardCache('daily-financials', query, () => queries.getDailyFinancials(query));
  }

  async getStoresComparison(query: DashboardQueryInput) {
    return withDashboardCache('stores-comparison', query, () => queries.getStoresComparison(query));
  }

  async getTopProducts(query: TopProductsQueryInput) {
    return withDashboardCache('top-products', query, () => queries.getTopProducts(query));
  }

  async getAbcAnalysis(query: AbcAnalysisQueryInput) {
    return withDashboardCache('abc-analysis', query, () => queries.getAbcAnalysis(query));
  }

  async getExpenseBreakdown(query: DashboardQueryInput) {
    return withDashboardCache('expense-breakdown', query, () => queries.getExpenseBreakdown(query));
  }

  async getInventorySummary(query: DashboardQueryInput) {
    return withDashboardCache('inventory-summary', query, () => queries.getInventorySummary(query));
  }

  async getNoMovementProducts(query: DashboardQueryInput) {
    return withDashboardCache('no-movement-products', query, () =>
      queries.getNoMovementProducts(query, NO_MOVEMENT_DAYS)
    );
  }

  async getLowStockProducts(query: DashboardQueryInput) {
    return withDashboardCache('low-stock-products', query, () =>
      queries.getLowStockProducts(query, LOW_STOCK_THRESHOLD)
    );
  }

  async getInventoryTurnover(query: DashboardQueryInput) {
    return withDashboardCache('inventory-turnover', query, () => queries.getInventoryTurnover(query));
  }
}

export const dashboardService = new DashboardService();
