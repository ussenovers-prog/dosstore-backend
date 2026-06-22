"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_js_1 = require("../utils/jwt.js");
function authMiddleware(req, res, next) {
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
        const payload = (0, jwt_js_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({
            error: {
                code: 'TOKEN_INVALID',
                message: 'Invalid or expired token',
            },
        });
    }
}
//# sourceMappingURL=auth.js.map