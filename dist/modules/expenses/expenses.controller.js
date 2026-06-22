"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expensesController = void 0;
const expenses_service_js_1 = require("./expenses.service.js");
const storeAccess_js_1 = require("../../middleware/storeAccess.js");
class ExpensesController {
    async list(req, res, next) {
        try {
            const query = req.query;
            const storeId = (0, storeAccess_js_1.getEffectiveStoreId)(req.user, query.storeId);
            if (storeId)
                query.storeId = storeId;
            const result = await expenses_service_js_1.expensesService.list(query);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const expense = await expenses_service_js_1.expensesService.getById(id);
            // Employee can only see their store's expenses
            if (req.user.role === 'employee' && expense.storeId !== req.user.storeId) {
                res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
                return;
            }
            res.json({ data: expense });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const input = req.body;
            // Employee can only create expenses for their store
            if (req.user.role === 'employee') {
                input.storeId = req.user.storeId;
            }
            const expense = await expenses_service_js_1.expensesService.create(input, req.user.userId);
            res.status(201).json({ data: expense });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const input = req.body;
            // Check ownership for employees
            if (req.user.role === 'employee') {
                const expense = await expenses_service_js_1.expensesService.getById(id);
                if (expense.storeId !== req.user.storeId) {
                    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
                    return;
                }
            }
            const expense = await expenses_service_js_1.expensesService.update(id, input);
            res.json({ data: expense });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            // Check ownership for employees
            if (req.user.role === 'employee') {
                const expense = await expenses_service_js_1.expensesService.getById(id);
                if (expense.storeId !== req.user.storeId) {
                    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
                    return;
                }
            }
            const result = await expenses_service_js_1.expensesService.delete(id);
            res.json({ data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.expensesController = new ExpensesController();
//# sourceMappingURL=expenses.controller.js.map