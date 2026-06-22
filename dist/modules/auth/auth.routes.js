"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("./auth.controller.js");
const validate_js_1 = require("../../middleware/validate.js");
const auth_schema_js_1 = require("./auth.schema.js");
const auth_js_1 = require("../../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/register', (0, validate_js_1.validate)(auth_schema_js_1.registerSchema), auth_controller_js_1.authController.register);
router.post('/login', (0, validate_js_1.validate)(auth_schema_js_1.loginSchema), auth_controller_js_1.authController.login);
router.post('/refresh', (0, validate_js_1.validate)(auth_schema_js_1.refreshTokenSchema), auth_controller_js_1.authController.refresh);
router.post('/logout', auth_js_1.authMiddleware, auth_controller_js_1.authController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map