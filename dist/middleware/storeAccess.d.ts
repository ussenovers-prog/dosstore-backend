import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d.js';
/**
 * Middleware to enforce store access rules:
 * - Owner: can access all stores (no filtering)
 * - Employee: can only access their assigned store
 *
 * For query params: if employee tries to access another store, return 403.
 * If employee doesn't specify store_id, auto-set to their store.
 */
export declare function storeAccessMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
/**
 * Helper to get the effective store_id for a request.
 * For owner: returns store_id from query/params or null (all stores).
 * For employee: always returns their assigned store_id.
 */
export declare function getEffectiveStoreId(user: AuthenticatedRequest['user'], queryStoreId?: string | number | null): number | null;
//# sourceMappingURL=storeAccess.d.ts.map