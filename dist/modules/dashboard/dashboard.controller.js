"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const dashboard_service_js_1 = require("./dashboard.service.js");
const storeAccess_js_1 = require("../../middleware/storeAccess.js");
class DashboardController {
    async getKPIs(req, res, next) {
        try {
            const query = req.query;
            query.storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId) || undefined;
            const data = await dashboard_service_js_1.dashboardService.getKPIs(query);
            res.json({ data });
        }
        catch (error) {
            next(error);
        }
    }
    async getSalesDynamic(req, res, next) {
        try {
            const query = req.query;
            query.storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId) || undefined;
            const data = await dashboard_service_js_1.dashboardService.getSalesDynamic(query);
            res.json({ data });
        }
        catch (error) {
            next(error);
        }
    }
    async getStoresComparison(req, res, next) {
        try {
            const query = req.query;
            query.storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId) || undefined;
            const data = await dashboard_service_js_1.dashboardService.getStoresComparison(query);
            res.json({ data });
        }
        catch (error) {
            next(error);
        }
    }
    async getTopProducts(req, res, next) {
        try {
            const query = req.query;
            query.storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId) || undefined;
            const data = await dashboard_service_js_1.dashboardService.getTopProducts(query);
            res.json({ data });
        }
        catch (error) {
            next(error);
        }
    }
    async getAbcAnalysis(req, res, next) {
        try {
            const query = req.query;
            query.storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId) || undefined;
            const data = await dashboard_service_js_1.dashboardService.getAbcAnalysis(query);
            res.json({ data });
        }
        catch (error) {
            next(error);
        }
    }
    async getExpenseBreakdown(req, res, next) {
        try {
            const query = req.query;
            query.storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId) || undefined;
            const data = await dashboard_service_js_1.dashboardService.getExpenseBreakdown(query);
            res.json({ data });
        }
        catch (error) {
            next(error);
        }
    }
    async getInventorySummary(req, res, next) {
        try {
            const query = req.query;
            query.storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId) || undefined;
            const data = await dashboard_service_js_1.dashboardService.getInventorySummary(query);
            res.json({ data });
        }
        catch (error) {
            next(error);
        }
    }
    async getNoMovementProducts(req, res, next) {
        try {
            const query = req.query;
            query.storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId) || undefined;
            const data = await dashboard_service_js_1.dashboardService.getNoMovementProducts(query);
            res.json({ data });
        }
        catch (error) {
            next(error);
        }
    }
    async getLowStockProducts(req, res, next) {
        try {
            const query = req.query;
            query.storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId) || undefined;
            const data = await dashboard_service_js_1.dashboardService.getLowStockProducts(query);
            res.json({ data });
        }
        catch (error) {
            next(error);
        }
    }
    async getInventoryTurnover(req, res, next) {
        try {
            const query = req.query;
            query.storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId) || undefined;
            const data = await dashboard_service_js_1.dashboardService.getInventoryTurnover(query);
            res.json({ data });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.dashboardController = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map