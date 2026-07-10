import assert from 'node:assert/strict';
import expensesRoutes from '../src/modules/expenses/expenses.routes.js';
import importsRoutes from '../src/modules/imports/imports.routes.js';
import usersRoutes from '../src/modules/users/users.routes.js';
import beksarRoutes from '../src/modules/beksar/beksar.routes.js';
import { getEffectiveStoreId, storeAccessMiddleware } from '../src/middleware/storeAccess.js';
import { AuthenticatedRequest } from '../src/types/express.d.js';

function routeHasMiddleware(router: any, path: string, method: string, middlewareName: string) {
  return router.stack.some((layer: any) => {
    if (!layer.route || layer.route.path !== path || !layer.route.methods[method]) return false;
    return layer.route.stack.some((routeLayer: any) => routeLayer.handle.name === middlewareName);
  });
}

function routerHasMiddleware(router: any, middlewareName: string) {
  return router.stack.some((layer: any) => layer.handle?.name === middlewareName);
}

function mockResponse() {
  return {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };
}

assert.equal(routerHasMiddleware(usersRoutes, 'requireOwner'), true);
assert.equal(routerHasMiddleware(importsRoutes, 'requireOwner'), true);
assert.equal(routerHasMiddleware(beksarRoutes, 'requireOwner'), true);
assert.equal(routeHasMiddleware(expensesRoutes, '/:id', 'patch', 'requireOwner'), true);
assert.equal(routeHasMiddleware(expensesRoutes, '/:id', 'delete', 'requireOwner'), true);
assert.equal(routeHasMiddleware(expensesRoutes, '/', 'post', 'requireOwner'), false);

const owner = { userId: 1, email: 'owner@example.com', role: 'owner' as const, storeId: null };
const employee = { userId: 2, email: 'status@example.com', role: 'employee' as const, storeId: 2 };
assert.equal(getEffectiveStoreId(owner, undefined), null);
assert.equal(getEffectiveStoreId(owner, '1'), 1);
assert.equal(getEffectiveStoreId(employee, undefined), 2);
assert.equal(getEffectiveStoreId(employee, '1'), 2);

const allowedReq = {
  user: employee,
  query: {},
  params: {},
} as unknown as AuthenticatedRequest;
let nextCalled = false;
storeAccessMiddleware(allowedReq, mockResponse() as any, () => {
  nextCalled = true;
});
assert.equal(nextCalled, true);
assert.equal(allowedReq.query.storeId, '2');

const deniedReq = {
  user: employee,
  query: { storeId: '1' },
  params: {},
} as unknown as AuthenticatedRequest;
const deniedRes = mockResponse();
storeAccessMiddleware(deniedReq, deniedRes as any, () => {});
assert.equal(deniedRes.statusCode, 403);
