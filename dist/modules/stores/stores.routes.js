"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stores_controller_js_1 = require("./stores.controller.js");
const validate_js_1 = require("../../middleware/validate.js");
const stores_schema_js_1 = require("./stores.schema.js");
const auth_js_1 = require("../../middleware/auth.js");
const roles_js_1 = require("../../middleware/roles.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authMiddleware);
router.get('/', stores_controller_js_1.storesController.list);
router.get('/:id', stores_controller_js_1.storesController.getById);
// Write operations require owner role
router.post('/', roles_js_1.requireOwner, (0, validate_js_1.validate)(stores_schema_js_1.createStoreSchema), stores_controller_js_1.storesController.create);
router.patch('/:id', roles_js_1.requireOwner, (0, validate_js_1.validate)(stores_schema_js_1.updateStoreSchema), stores_controller_js_1.storesController.update);
router.delete('/:id', roles_js_1.requireOwner, stores_controller_js_1.storesController.deactivate);
exports.default = router;
//# sourceMappingURL=stores.routes.js.map