import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d.js';
type Role = 'owner' | 'employee';
export declare function requireRole(...roles: Role[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare function requireOwner(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export declare function requireEmployeeOrOwner(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export {};
//# sourceMappingURL=roles.d.ts.map