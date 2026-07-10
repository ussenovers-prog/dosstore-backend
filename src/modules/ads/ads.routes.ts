import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../middleware/auth.js';
import { requireEmployeeOrOwner, requireOwner } from '../../middleware/roles.js';
import { AuthenticatedRequest } from '../../types/express.d.js';
import { adsService, DuplicateAdsImportError } from './ads.service.js';
import { AdsImportError } from './ads.parser.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const name = file.originalname.toLowerCase();
    callback(null, name.endsWith('.xls') || name.endsWith('.xlsx'));
  },
});

router.use(authMiddleware);
router.use(requireEmployeeOrOwner);

router.post('/import', requireOwner, upload.single('file'), async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      res.status(400).json({
        error: { code: 'FILE_REQUIRED', message: 'XLS or XLSX file is required' },
      });
      return;
    }

    const result = await adsService.importFile(req.file.originalname, req.file.buffer);
    res.status(201).json({ data: result });
  } catch (error) {
    if (error instanceof DuplicateAdsImportError) {
      res.status(409).json({
        error: { code: 'DUPLICATE_IMPORT', message: error.message },
      });
      return;
    }
    if (error instanceof AdsImportError) {
      res.status(error.statusCode).json({
        error: { code: error.code, message: error.message },
      });
      return;
    }
    next(error);
  }
});

router.post('/sync/google-sheet', requireOwner, async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adsService.syncGoogleSheet();
    res.status(201).json({ data: result });
  } catch (error) {
    if (error instanceof AdsImportError) {
      res.status(error.statusCode).json({
        error: { code: error.code, message: error.message },
      });
      return;
    }
    next(error);
  }
});

router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const storeId = req.user.role === 'employee' ? req.user.storeId : parseStoreId(req.query.storeId);
    res.json(await adsService.list(storeId));
  } catch (error) {
    next(error);
  }
});

router.get('/summary', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const storeId = req.user.role === 'employee' ? req.user.storeId : parseStoreId(req.query.storeId);
    res.json(await adsService.summary(storeId));
  } catch (error) {
    next(error);
  }
});

function parseStoreId(value: unknown) {
  const storeId = Number(value);
  return Number.isInteger(storeId) && storeId > 0 ? storeId : null;
}

export default router;
