import { Router } from 'express';
import { storesController } from './stores.controller.js';
import { validate } from '../../middleware/validate.js';
import { createStoreSchema, updateStoreSchema } from './stores.schema.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requireOwner } from '../../middleware/roles.js';

const router = Router();

router.use(authMiddleware);

router.get('/', storesController.list);
router.get('/:id', storesController.getById);

// Write operations require owner role
router.post('/', requireOwner, validate(createStoreSchema), storesController.create);
router.patch('/:id', requireOwner, validate(updateStoreSchema), storesController.update);
router.delete('/:id', requireOwner, storesController.deactivate);

export default router;
