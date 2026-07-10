import { Router } from 'express';
import { expensesController } from './expenses.controller.js';
import { validate } from '../../middleware/validate.js';
import { createExpenseSchema, updateExpenseSchema, expenseQuerySchema } from './expenses.schema.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requireEmployeeOrOwner, requireOwner } from '../../middleware/roles.js';
import { storeAccessMiddleware } from '../../middleware/storeAccess.js';

const router = Router();

router.use(authMiddleware);
router.use(storeAccessMiddleware);
router.use(requireEmployeeOrOwner);

router.get('/', validate(expenseQuerySchema, 'query'), expensesController.list);
router.get('/:id', expensesController.getById);
router.post('/', validate(createExpenseSchema), expensesController.create);
router.patch('/:id', requireOwner, validate(updateExpenseSchema), expensesController.update);
router.delete('/:id', requireOwner, expensesController.delete);

export default router;
