import { Router } from 'express';
import { AuthController } from './modules/auth/auth.controller.js';
import { ProductController } from './modules/products/product.controller.js';
import { AttributeController } from './modules/attributes/attribute.controller.js';
import { CategoryController } from './modules/categories/category.controller.js';
import { VariantController } from './modules/variants/variant.controller.js';
import { SyncController } from './modules/sync/sync.controller.js';
import { DashboardController } from './modules/dashboard/dashboard.controller.js';
import { ActivityController } from './modules/activity/activity.controller.js';
import { AiController } from './modules/ai/ai.controller.js';
import { authenticateSession } from './middleware/auth.js';
import { enforceWorkspaceContext } from './middleware/tenant.js';

export const apiRouter = Router();

// Public Health & Auth Routes
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Orivanta PIM API',
    version: '1.0.0',
  });
});

apiRouter.post('/auth/login', AuthController.login);
apiRouter.post('/auth/logout', AuthController.logout);

// Protected Routes (Session Authentication + Application-Layer Tenant Guard)
const protectedApi = Router();
protectedApi.use(authenticateSession);
protectedApi.use(enforceWorkspaceContext);

// User & Workspace
protectedApi.get('/auth/me', AuthController.me);
protectedApi.post('/auth/switch-workspace', AuthController.switchWorkspace);

// Dashboard & Activity
protectedApi.get('/dashboard/summary', DashboardController.getSummary);
protectedApi.get('/activity', ActivityController.list);

// Products
protectedApi.get('/products', ProductController.list);
protectedApi.post('/products', ProductController.create);
protectedApi.post('/products/bulk-actions', ProductController.bulkAction);
protectedApi.get('/products/export-csv', ProductController.exportCsv);
protectedApi.post('/products/import-csv', ProductController.importCsv);
protectedApi.get('/products/:id', ProductController.getById);
protectedApi.put('/products/:id', ProductController.update);
protectedApi.delete('/products/:id', ProductController.delete);
protectedApi.post('/products/:id/duplicate', ProductController.duplicate);
protectedApi.get('/products/:id/validate', ProductController.validate);

// Variants
protectedApi.get('/products/:productId/variants', VariantController.listByProduct);
protectedApi.post('/products/:productId/variants', VariantController.create);
protectedApi.put('/variants/:id', VariantController.update);
protectedApi.delete('/variants/:id', VariantController.delete);

// Categories
protectedApi.get('/categories', CategoryController.list);
protectedApi.post('/categories', CategoryController.create);
protectedApi.get('/categories/:id', CategoryController.getById);
protectedApi.put('/categories/:id', CategoryController.update);
protectedApi.delete('/categories/:id', CategoryController.delete);

// Attributes
protectedApi.get('/attributes', AttributeController.list);
protectedApi.post('/attributes', AttributeController.create);
protectedApi.get('/attributes/:id', AttributeController.getById);
protectedApi.put('/attributes/:id', AttributeController.update);
protectedApi.delete('/attributes/:id', AttributeController.delete);

// WooCommerce Integration & Synchronisation
protectedApi.get('/integrations/woocommerce/status', SyncController.getStatus);
protectedApi.post('/integrations/woocommerce/test', SyncController.testConnection);
protectedApi.post('/sync/simulate-failure', SyncController.simulateFailure);
protectedApi.post('/sync/products/:id', SyncController.syncProduct);
protectedApi.post('/sync/bulk', SyncController.syncBulk);
protectedApi.get('/sync/jobs', SyncController.listJobs);
protectedApi.get('/sync/jobs/:id', SyncController.getJobById);
protectedApi.post('/sync/jobs/:id/retry', SyncController.retryJob);

// Gemini-Powered Agentic AI
protectedApi.get('/ai/status', AiController.getStatus);
protectedApi.post('/ai/agent/run', AiController.runAgent);
protectedApi.post('/ai/enrichment/validate', AiController.validateEnrichment);

apiRouter.use(protectedApi);
