import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d.js';

type Role = 'owner' | 'employee';

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Required role: ${roles.join(' or ')}`,
        },
      });
      return;
    }

    next();
  };
}

export function requireOwner(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireRole('owner')(req, res, next);
}

export function requireEmployeeOrOwner(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  requireRole('owner', 'employee')(req, res, next);
}
