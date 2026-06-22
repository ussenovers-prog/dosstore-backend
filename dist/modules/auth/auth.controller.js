"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_js_1 = require("./auth.service.js");
class AuthController {
    async register(req, res, next) {
        try {
            const input = req.body;
            const result = await auth_service_js_1.authService.register(input);
            res.status(201).json({ data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const input = req.body;
            const result = await auth_service_js_1.authService.login(input);
            res.json({ data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async refresh(req, res, next) {
        try {
            const input = req.body;
            const tokens = await auth_service_js_1.authService.refresh(input.refreshToken);
            res.json({ data: tokens });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res) {
        // JWT is stateless, so logout is handled client-side by removing tokens
        // In production, you might want to maintain a token blacklist
        res.json({ data: { message: 'Logged out successfully' } });
    }
}
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map