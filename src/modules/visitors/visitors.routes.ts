import { Router } from 'express';
import { visitorsController } from './visitors.controller.js';
import { validate } from '../../middleware/validate.js';
import { createVisitorSchema, updateVisitorSchema, visitorQuerySchema } from './visitors.schema.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requireEmployeeOrOwner } from '../../middleware/roles.js';
import { storeAccessMiddleware } from '../../middleware/storeAccess.js';

const router = Router();

router.use(authMiddleware);
router.use(storeAccessMiddleware);
router.use(requireEmployeeOrOwner);

router.get('/', validate(visitorQuerySchema, 'query'), visitorsController.list);
router.get('/:id', visitorsController.getById);
router.post('/', validate(createVisitorSchema), visitorsController.upsert);
router.patch('/:id', validate(updateVisitorSchema), visitorsController.update);
router.delete('/:id', visitorsController.delete);

export default router;
