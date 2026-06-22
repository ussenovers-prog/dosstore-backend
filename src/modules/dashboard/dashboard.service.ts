import * as queries from './dashboard.queries.js';
import { DashboardQueryInput, TopProductsQueryInput, AbcAnalysisQueryInput } from './dashboard.schema.js';
import { NO_MOVEMENT_DAYS, LOW_STOCK_THRESHOLD } from '../../config/constants.js';

class DashboardService {
  async getKPIs(query: DashboardQueryInput) {
    const filter = {
      storeId: query.storeId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    };

    const [
      revenue,
      grossProfit,
      netProfit,
      avgCheck,
      margin,
      adSpend,
      cac,
      adROI,
      drr,
      visitors,
      buyers,
      conversion,
      inventorySummary,
    ] = await Promise.all([
      queries.getRevenue(filter),
      queries.getGrossProfit(filter),
      queries.getNetProfit(filter),
      queries.getAvgCheck(filter),
      queries.getMargin(filter),
      queries.getAdSpend(filter),
      queries.getCAC(filter),
      queries.getAdROI(filter),
      queries.getDRR(filter),
      queries.getTotalVisitors(filter),
      queries.getTotalBuyers(filter),
      queries.getConversion(filter),
      queries.getInventorySummary(filter),
    ]);

    return {
      revenue,
      grossProfit,
      netProfit,
      avgCheck,
      margin,
      adSpend,
      cac,
      adROI,
      drr,
      visitors,
      buyers,
      conversion,
      inventoryValue: inventorySummary.totalValue,
      inventoryItems: inventorySummary.totalItems,
    };
  }

  async getSalesDynamic(query: DashboardQueryInput) {
    return queries.getSalesDynamic(query);
  }

  async getStoresComparison(query: DashboardQueryInput) {
    return queries.getStoresComparison(query);
  }

  async getTopProducts(query: TopProductsQueryInput) {
    return queries.getTopProducts(query);
  }

  async getAbcAnalysis(query: AbcAnalysisQueryInput) {
    return queries.getAbcAnalysis(query);
  }

  async getExpenseBreakdown(query: DashboardQueryInput) {
    return queries.getExpenseBreakdown(query);
  }

  async getInventorySummary(query: DashboardQueryInput) {
    return queries.getInventorySummary(query);
  }

  async getNoMovementProducts(query: DashboardQueryInput) {
    return queries.getNoMovementProducts(query, NO_MOVEMENT_DAYS);
  }

  async getLowStockProducts(query: DashboardQueryInput) {
    return queries.getLowStockProducts(query, LOW_STOCK_THRESHOLD);
  }

  async getInventoryTurnover(query: DashboardQueryInput) {
    return queries.getInventoryTurnover(query);
  }
}

export const dashboardService = new DashboardService();
