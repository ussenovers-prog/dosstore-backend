import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d.js';

/**
 * Middleware to enforce store access rules:
 * - Owner: can access all stores (no filtering)
 * - Employee: can only access their assigned store
 *
 * For query params: if employee tries to access another store, return 403.
 * If employee doesn't specify storeId, auto-set to their store.
 */
export function storeAccessMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
    return;
  }

  // Owner has full access
  if (req.user.role === 'owner') {
    next();
    return;
  }

  // Employee access control
  const employeeStoreId = req.user.storeId;

  if (!employeeStoreId) {
    res.status(403).json({
      error: {
        code: 'NO_STORE_ASSIGNED',
        message: 'Employee has no store assigned',
      },
    });
    return;
  }

  // Check query params
  const queryStoreId = req.query.storeId
    ? parseInt(req.query.storeId as string, 10)
    : null;

  if (queryStoreId && queryStoreId !== employeeStoreId) {
    res.status(403).json({
      error: {
        code: 'FORBIDDEN_STORE',
        message: 'Access denied to this store',
      },
    });
    return;
  }

  // Check route params
  const paramStoreId = req.params.storeId
    ? parseInt(req.params.storeId, 10)
    : null;

  if (paramStoreId && paramStoreId !== employeeStoreId) {
    res.status(403).json({
      error: {
        code: 'FORBIDDEN_STORE',
        message: 'Access denied to this store',
      },
    });
    return;
  }

  // Auto-set storeId in query/body for employees
  if (req.query) {
    req.query.storeId = String(employeeStoreId);
  }

  next();
}

/**
 * Helper to get the effective storeId for a request.
 * For owner: returns storeId from query/params or null (all stores).
 * For employee: always returns their assigned storeId.
 */
export function getEffectiveStoreId(
  user: AuthenticatedRequest['user'],
  queryStoreId?: string | number | null
): number | null {
  if (user.role === 'employee') {
    return user.storeId;
  }

  if (queryStoreId) {
    return typeof queryStoreId === 'string'
      ? parseInt(queryStoreId, 10)
      : queryStoreId;
  }

  return null;
}
