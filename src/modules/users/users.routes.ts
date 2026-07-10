import { Router } from 'express';
import { usersController } from './users.controller.js';
import { validate } from '../../middleware/validate.js';
import { createUserSchema, resetPasswordSchema, updateUserSchema, userQuerySchema } from './users.schema.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requireOwner } from '../../middleware/roles.js';

const router = Router();

router.use(authMiddleware);
router.use(requireOwner);

router.get('/', validate(userQuerySchema, 'query'), usersController.list);
router.get('/:id', usersController.getById);
router.post('/', validate(createUserSchema), usersController.create);
router.patch('/:id', validate(updateUserSchema), usersController.update);
router.post('/:id/reset-password', validate(resetPasswordSchema), usersController.resetPassword);
router.delete('/:id', usersController.deactivate);

export default router;
