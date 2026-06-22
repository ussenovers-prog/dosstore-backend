"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const queries = __importStar(require("./dashboard.queries.js"));
const constants_js_1 = require("../../config/constants.js");
class DashboardService {
    async getKPIs(query) {
        const filter = {
            storeId: query.storeId,
            dateFrom: query.dateFrom,
            dateTo: query.dateTo,
        };
        const [revenue, grossProfit, netProfit, avgCheck, margin, adSpend, cac, adROI, drr, visitors, buyers, conversion, inventorySummary,] = await Promise.all([
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
    async getSalesDynamic(query) {
        return queries.getSalesDynamic(query);
    }
    async getStoresComparison(query) {
        return queries.getStoresComparison(query);
    }
    async getTopProducts(query) {
        return queries.getTopProducts(query);
    }
    async getAbcAnalysis(query) {
        return queries.getAbcAnalysis(query);
    }
    async getExpenseBreakdown(query) {
        return queries.getExpenseBreakdown(query);
    }
    async getInventorySummary(query) {
        return queries.getInventorySummary(query);
    }
    async getNoMovementProducts(query) {
        return queries.getNoMovementProducts(query, constants_js_1.NO_MOVEMENT_DAYS);
    }
    async getLowStockProducts(query) {
        return queries.getLowStockProducts(query, constants_js_1.LOW_STOCK_THRESHOLD);
    }
    async getInventoryTurnover(query) {
        return queries.getInventoryTurnover(query);
    }
}
exports.dashboardService = new DashboardService();
//# sourceMappingURL=dashboard.service.js.map