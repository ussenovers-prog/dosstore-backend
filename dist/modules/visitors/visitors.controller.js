"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitorsController = void 0;
const visitors_service_js_1 = require("./visitors.service.js");
const storeAccess_js_1 = require("../../middleware/storeAccess.js");
class VisitorsController {
    async list(req, res, next) {
        try {
            const query = req.query;
            const storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId);
            if (storeId)
                query.storeId = storeId;
            const result = await visitors_service_js_1.visitorsService.list(query);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const visitor = await visitors_service_js_1.visitorsService.getById(id);
            if (req.user.role === 'employee' && visitor.storeId !== req.user.storeId) {
                res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
                return;
            }
            res.json({ data: visitor });
        }
        catch (error) {
            next(error);
        }
    }
    async upsert(req, res, next) {
        try {
            const input = req.body;
            if (req.user.role === 'employee') {
                input.storeId = req.user.storeId;
            }
            const visitor = await visitors_service_js_1.visitorsService.upsert(input, req.user.userId);
            res.status(201).json({ data: visitor });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const input = req.body;
            if (req.user.role === 'employee') {
                const visitor = await visitors_service_js_1.visitorsService.getById(id);
                if (visitor.storeId !== req.user.storeId) {
                    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
                    return;
                }
            }
            const visitor = await visitors_service_js_1.visitorsService.update(id, input);
            res.json({ data: visitor });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (req.user.role === 'employee') {
                const visitor = await visitors_service_js_1.visitorsService.getById(id);
                if (visitor.storeId !== req.user.storeId) {
                    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
                    return;
                }
            }
            const result = await visitors_service_js_1.visitorsService.delete(id);
            res.json({ data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.visitorsController = new VisitorsController();
//# sourceMappingURL=visitors.controller.js.map