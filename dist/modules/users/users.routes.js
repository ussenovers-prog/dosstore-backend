"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_js_1 = require("./users.controller.js");
const validate_js_1 = require("../../middleware/validate.js");
const users_schema_js_1 = require("./users.schema.js");
const auth_js_1 = require("../../middleware/auth.js");
const roles_js_1 = require("../../middleware/roles.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authMiddleware);
router.use(roles_js_1.requireOwner);
router.get('/', (0, validate_js_1.validate)(users_schema_js_1.userQuerySchema, 'query'), users_controller_js_1.usersController.list);
router.get('/:id', users_controller_js_1.usersController.getById);
router.post('/', (0, validate_js_1.validate)(users_schema_js_1.createUserSchema), users_controller_js_1.usersController.create);
router.patch('/:id', (0, validate_js_1.validate)(users_schema_js_1.updateUserSchema), users_controller_js_1.usersController.update);
router.delete('/:id', users_controller_js_1.usersController.deactivate);
exports.default = router;
//# sourceMappingURL=users.routes.js.map