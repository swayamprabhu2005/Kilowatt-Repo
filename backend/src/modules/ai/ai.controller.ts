import type { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { GeminiAgentService } from './gemini-client.js';
import { ProductService } from '../products/product.service.js';
import { sqlite } from '../../db/index.js';
import type { AuthenticatedRequest } from '../../types/index.js';

const agentRunSchema = z.object({
  taskType: z.enum(['audit', 'enrichment', 'diagnosis', 'catalogue_query']),
  goal: z.string().min(1),
  productId: z.string().optional(),
  notes: z.string().optional(),
});

export class AiController {
  static async runAgent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { taskType, goal, productId, notes } = agentRunSchema.parse(req.body);
      const result = await GeminiAgentService.runAgentTask(req.workspaceCtx!, taskType, goal, productId, notes);

      // Persist AI run audit record
      const runId = `airun_${crypto.randomUUID().slice(0, 8)}`;
      sqlite.prepare(`
        INSERT INTO ai_agent_runs (
          id, workspace_id, user_id, task_type, model, status,
          tool_trace_json, summary, structured_result_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        runId,
        req.workspaceCtx!.workspaceId,
        req.workspaceCtx!.userId,
        taskType,
        result.model,
        'completed',
        JSON.stringify(result.traces),
        result.summary,
        JSON.stringify({ checklist: result.checklist, suggestedPatch: result.suggestedPatch }),
        Date.now()
      );

      res.json({
        success: true,
        data: {
          runId,
          ...result,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static getStatus(req: AuthenticatedRequest, res: Response) {
    const isConfigured = GeminiAgentService.isAiConfigured();
    const model = GeminiAgentService.getModelName();
    res.json({
      success: true,
      data: {
        isConfigured,
        model,
        mode: isConfigured ? 'live_gemini' : 'mock_provider',
        message: isConfigured
          ? `Gemini agent is active using model '${model}'.`
          : 'Gemini is running in offline Mock Mode. Add GEMINI_API_KEY in .env to enable live Google Gen AI calls.',
      },
    });
  }

  static validateEnrichment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { productId, patch } = req.body;
      if (!productId) throw { statusCode: 400, code: 'MISSING_PRODUCT', message: 'productId is required.' };

      const product = ProductService.getById(req.workspaceCtx!, productId);
      const merged = { ...product, ...patch };
      const report = ProductService.validateProduct(req.workspaceCtx!, merged);

      res.json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }
}
