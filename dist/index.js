"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const env_js_1 = require("./config/env.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const PUBLIC_DIR = path_1.default.resolve(__dirname, '..', 'public');
// Import routes
const auth_routes_js_1 = __importDefault(require("./modules/auth/auth.routes.js"));
const users_routes_js_1 = __importDefault(require("./modules/users/users.routes.js"));
const stores_routes_js_1 = __importDefault(require("./modules/stores/stores.routes.js"));
const expenses_routes_js_1 = __importDefault(require("./modules/expenses/expenses.routes.js"));
const visitors_routes_js_1 = __importDefault(require("./modules/visitors/visitors.routes.js"));
const dashboard_routes_js_1 = __importDefault(require("./modules/dashboard/dashboard.routes.js"));
const imports_routes_js_1 = __importDefault(require("./modules/imports/imports.routes.js"));
// Import services (optional background tasks)
// import { ftpWatcher } from './services/ftp/ftp-watcher.service.js';
const app = (0, express_1.default)();
// ============================================================
// Middleware
// ============================================================
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
        },
    },
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// ============================================================
// Health Check
// ============================================================
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/users', users_routes_js_1.default);
app.use('/api/stores', stores_routes_js_1.default);
app.use('/api/expenses', expenses_routes_js_1.default);
app.use('/api/visitors', visitors_routes_js_1.default);
app.use('/api/dashboard', dashboard_routes_js_1.default);
app.use('/api/imports', imports_routes_js_1.default);
// ============================================================
// Static Frontend (SPA)
// ============================================================
app.use(express_1.default.static(PUBLIC_DIR));
// SPA catch-all: serve index.html for any non-API route
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Route not found' },
        });
    }
    res.sendFile(path_1.default.join(PUBLIC_DIR, 'index.html'));
});
// ============================================================
// Error Handler
// ============================================================
app.use(errorHandler_js_1.errorHandler);
// ============================================================
// Start Server
// ============================================================
app.listen(env_js_1.env.PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Clothing Store Analytics API                             ║
║  Server running on http://localhost:${env_js_1.env.PORT}              ║
║  Environment: ${env_js_1.env.NODE_ENV.padEnd(42)}║
╚═══════════════════════════════════════════════════════════╝
  `);
    console.log('📡 API Endpoints:');
    console.log('  POST   /api/auth/register');
    console.log('  POST   /api/auth/login');
    console.log('  POST   /api/auth/refresh');
    console.log('  POST   /api/auth/logout');
    console.log('');
    console.log('  GET    /api/users');
    console.log('  GET    /api/users/:id');
    console.log('  POST   /api/users');
    console.log('  PATCH  /api/users/:id');
    console.log('  DELETE /api/users/:id');
    console.log('');
    console.log('  GET    /api/stores');
    console.log('  GET    /api/stores/:id');
    console.log('  POST   /api/stores');
    console.log('  PATCH  /api/stores/:id');
    console.log('  DELETE /api/stores/:id');
    console.log('');
    console.log('  GET    /api/expenses');
    console.log('  GET    /api/expenses/:id');
    console.log('  POST   /api/expenses');
    console.log('  PATCH  /api/expenses/:id');
    console.log('  DELETE /api/expenses/:id');
    console.log('');
    console.log('  GET    /api/visitors');
    console.log('  GET    /api/visitors/:id');
    console.log('  POST   /api/visitors');
    console.log('  PATCH  /api/visitors/:id');
    console.log('  DELETE /api/visitors/:id');
    console.log('');
    console.log('  GET    /api/dashboard/kpi');
    console.log('  GET    /api/dashboard/sales-dynamic');
    console.log('  GET    /api/dashboard/stores-comparison');
    console.log('  GET    /api/dashboard/top-products');
    console.log('  GET    /api/dashboard/abc-analysis');
    console.log('  GET    /api/dashboard/expense-breakdown');
    console.log('  GET    /api/dashboard/inventory-summary');
    console.log('  GET    /api/dashboard/no-movement-products');
    console.log('  GET    /api/dashboard/low-stock-products');
    console.log('  GET    /api/dashboard/inventory-turnover');
    console.log('');
    console.log('  GET    /api/imports');
    console.log('  GET    /api/imports/:id');
    console.log('  GET    /api/imports/stats/summary');
    console.log('');
    // Start FTP watcher (if configured)
    // if (env.FTP_HOST) {
    //   ftpWatcher.start().catch(console.error);
    // }
});
// ============================================================
// Graceful Shutdown
// ============================================================
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    // ftpWatcher.stop();
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    // ftpWatcher.stop();
    process.exit(0);
});
//# sourceMappingURL=index.js.map