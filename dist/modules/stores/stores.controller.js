"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storesController = void 0;
const stores_service_js_1 = require("./stores.service.js");
class StoresController {
    async list(req, res, next) {
        try {
            const result = await stores_service_js_1.storesService.list();
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const store = await stores_service_js_1.storesService.getById(id);
            res.json({ data: store });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const input = req.body;
            const store = await stores_service_js_1.storesService.create(input);
            res.status(201).json({ data: store });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const input = req.body;
            const store = await stores_service_js_1.storesService.update(id, input);
            res.json({ data: store });
        }
        catch (error) {
            next(error);
        }
    }
    async deactivate(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await stores_service_js_1.storesService.deactivate(id);
            res.json({ data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.storesController = new StoresController();
//# sourceMappingURL=stores.controller.js.map