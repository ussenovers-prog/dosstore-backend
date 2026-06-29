import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/express.d.js';
import { STATUS_STORE_ID } from './beksar.parser.js';
import { beksarService, DuplicateImportError } from './beksar.service.js';
import { beksarFtpService, FtpSyncError } from './beksar.ftp.service.js';
import { z } from 'zod';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const lowerName = file.originalname.toLowerCase();
    if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx')) {
      cb(null, true);
      return;
    }

    cb(new Error('Only XLS and XLSX files are allowed'));
  },
});

router.use(authMiddleware);

const ftpSyncSchema = z.object({
  storeId: z.coerce.number().int().refine((value): value is 1 | 2 => value === 1 || value === 2, {
    message: 'storeId must be 1 or 2',
  }),
  mode: z.enum(['sales', 'inventory', 'all']),
});

router.post('/ftp/sync', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const parsed = ftpSyncSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const result = await beksarFtpService.sync(parsed.data.storeId, parsed.data.mode);
    res.json(result);
  } catch (error) {
    if (error instanceof FtpSyncError) {
      res.status(error.code === 'FTP_SYNC_DISABLED' ? 503 : 400).json({
        success: false,
        code: error.code,
      });
      return;
    }

    next(error);
  }
});

router.post('/analyze', upload.single('file'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: { code: 'FILE_REQUIRED', message: 'File is required' } });
      return;
    }

    const result = await beksarService.analyzeFile(req.file.originalname, req.file.buffer, {
      type: parseAutoType(req.body.type),
      storeId: parseStoreId(req.body.storeId),
    });

    res.json({ data: result });
  } catch (error) {
    handleImportError(error, res, next);
  }
});

router.post('/import/sales', upload.single('file'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const guard = validateStatusUpload(req);
    if (guard) {
      res.status(guard.status).json({ error: { code: guard.code, message: guard.message } });
      return;
    }

    const result = await beksarService.importStatusSales(req.file!.originalname, req.file!.buffer);
    res.json({ data: result });
  } catch (error) {
    handleImportError(error, res, next);
  }
});

router.post('/import/inventory', upload.single('file'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const guard = validateStatusUpload(req);
    if (guard) {
      res.status(guard.status).json({ error: { code: guard.code, message: guard.message } });
      return;
    }

    const result = await beksarService.importStatusInventory(req.file!.originalname, req.file!.buffer);
    res.json({ data: result });
  } catch (error) {
    handleImportError(error, res, next);
  }
});

router.post('/import/auto', upload.single('file'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: { code: 'FILE_REQUIRED', message: 'File is required' } });
      return;
    }

    const type = parseAutoType(req.body.type);
    const storeId = parseStoreId(req.body.storeId);

    if (type !== 'sales' && type !== 'inventory') {
      res.status(400).json({ error: { code: 'TYPE_REQUIRED', message: 'Choose sales or inventory import type' } });
      return;
    }

    if (!storeId) {
      res.status(400).json({ error: { code: 'STORE_REQUIRED', message: 'Choose Status or Dosstore' } });
      return;
    }

    if (storeId !== STATUS_STORE_ID) {
      res.status(400).json({ error: { code: 'DOSSTORE_NOT_CONFIGURED', message: 'Dosstore import not configured yet' } });
      return;
    }

    const guard = validateStatusUpload(req);
    if (guard) {
      res.status(guard.status).json({ error: { code: guard.code, message: guard.message } });
      return;
    }

    const result = type === 'sales'
      ? await beksarService.importStatusSales(req.file.originalname, req.file.buffer)
      : await beksarService.importStatusInventory(req.file.originalname, req.file.buffer);

    res.json({ data: result });
  } catch (error) {
    handleImportError(error, res, next);
  }
});

router.use((error: unknown, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  handleImportError(error, res, next);
});

function validateStatusUpload(req: AuthenticatedRequest) {
  if (!req.file) {
    return { status: 400, code: 'FILE_REQUIRED', message: 'File is required' };
  }

  const requestedStoreId = Number(req.body.storeId ?? STATUS_STORE_ID);
  if (requestedStoreId !== STATUS_STORE_ID) {
    return { status: 400, code: 'STATUS_ONLY', message: 'Beksar Stage 1 supports Status only' };
  }

  if (req.user.role === 'employee' && req.user.storeId !== STATUS_STORE_ID) {
    return { status: 403, code: 'FORBIDDEN_STORE', message: 'Access denied to Status imports' };
  }

  return null;
}

function parseAutoType(value: unknown) {
  return value === 'sales' || value === 'inventory' ? value : undefined;
}

function parseStoreId(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function handleImportError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof DuplicateImportError) {
    res.status(409).json({ error: { code: 'DUPLICATE_IMPORT', message: error.message } });
    return;
  }

  if (error instanceof multer.MulterError) {
    res.status(400).json({ error: { code: error.code, message: error.message } });
    return;
  }

  if (error instanceof Error && error.message.includes('Only XLS')) {
    res.status(400).json({ error: { code: 'INVALID_FILE_TYPE', message: error.message } });
    return;
  }

  next(error);
}

export default router;
