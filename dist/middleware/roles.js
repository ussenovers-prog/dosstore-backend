"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.requireOwner = requireOwner;
exports.requireEmployeeOrOwner = requireEmployeeOrOwner;
function requireRole(...roles) {
    return (req, res, next) => {
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
function requireOwner(req, res, next) {
    requireRole('owner')(req, res, next);
}
function requireEmployeeOrOwner(req, res, next) {
    requireRole('owner', 'employee')(req, res, next);
}
//# sourceMappingURL=roles.js.map