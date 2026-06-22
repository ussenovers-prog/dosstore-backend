"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const users_service_js_1 = require("./users.service.js");
class UsersController {
    async list(req, res, next) {
        try {
            const query = req.query;
            const result = await users_service_js_1.usersService.list(query);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const user = await users_service_js_1.usersService.getById(id);
            res.json({ data: user });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const input = req.body;
            const user = await users_service_js_1.usersService.create(input);
            res.status(201).json({ data: user });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const input = req.body;
            const user = await users_service_js_1.usersService.update(id, input);
            res.json({ data: user });
        }
        catch (error) {
            next(error);
        }
    }
    async deactivate(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await users_service_js_1.usersService.deactivate(id);
            res.json({ data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.usersController = new UsersController();
//# sourceMappingURL=users.controller.js.map