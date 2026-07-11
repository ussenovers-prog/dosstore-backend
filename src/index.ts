import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import storesRoutes from './modules/stores/stores.routes.js';
import expensesRoutes from './modules/expenses/expenses.routes.js';
import visitorsRoutes from './modules/visitors/visitors.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import importsRoutes from './modules/imports/imports.routes.js';
import beksarRoutes from './modules/beksar/beksar.routes.js';
import systemRoutes from './modules/system/system.routes.js';
import adsRoutes from './modules/ads/ads.routes.js';
import { adsScheduler } from './modules/ads/ads.scheduler.js';
import { keepAliveService } from './services/keep-alive.service.js';

// Import services (optional background tasks)
// import { ftpWatcher } from './services/ftp/ftp-watcher.service.js';

const app = express();

// ============================================================
// Middleware
// ============================================================

app.use(helmet({
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
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ============================================================
// Health Check
// ============================================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// API Routes
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/visitors', visitorsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/imports', importsRoutes);
app.use('/api/beksar', beksarRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/ads', adsRoutes);

// ============================================================
// Static Frontend (SPA)
// ============================================================

app.use(express.static(PUBLIC_DIR));

// SPA catch-all: serve index.html for any non-API route
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  }
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ============================================================
// Error Handler
// ============================================================

app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  ERS GROUP API                                            ║
║  Server running on http://0.0.0.0:${env.PORT}                ║
║  Environment: ${env.NODE_ENV.padEnd(42)}║
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
  console.log('  POST   /api/beksar/import/sales');
  console.log('  POST   /api/beksar/import/inventory');
  console.log('');
  console.log('  GET    /api/system/health');
  console.log('');

  // Start FTP watcher (if configured)
  // if (env.FTP_HOST) {
  //   ftpWatcher.start().catch(console.error);
  // }

  adsScheduler.start();
  keepAliveService.start();
});

// ============================================================
// Graceful Shutdown
// ============================================================

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  // ftpWatcher.stop();
  adsScheduler.stop();
  keepAliveService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  // ftpWatcher.stop();
  adsScheduler.stop();
  keepAliveService.stop();
  process.exit(0);
});
