import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { AuthenticatedRequest, AuthUser } from '../types/express.d.js';
import prisma from '../utils/prisma.js';

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
      },
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, storeId: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is inactive or no longer exists',
        },
      });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    } as AuthUser;
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        code: 'TOKEN_INVALID',
        message: 'Invalid or expired token',
      },
    });
  }
}
