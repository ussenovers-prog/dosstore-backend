"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeAccessMiddleware = storeAccessMiddleware;
exports.getEffectiveStoreId = getEffectiveStoreId;
/**
 * Middleware to enforce store access rules:
 * - Owner: can access all stores (no filtering)
 * - Employee: can only access their assigned store
 *
 * For query params: if employee tries to access another store, return 403.
 * If employee doesn't specify store_id, auto-set to their store.
 */
function storeAccessMiddleware(req, res, next) {
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
    const queryStoreId = req.query.store_id
        ? parseInt(req.query.store_id, 10)
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
    // Auto-set store_id in query/body for employees
    if (req.query) {
        req.query.store_id = String(employeeStoreId);
    }
    next();
}
/**
 * Helper to get the effective store_id for a request.
 * For owner: returns store_id from query/params or null (all stores).
 * For employee: always returns their assigned store_id.
 */
function getEffectiveStoreId(user, queryStoreId) {
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
//# sourceMappingURL=storeAccess.js.map