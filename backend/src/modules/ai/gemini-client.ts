import { GoogleGenAI } from '@google/genai';
import { agentToolRegistry } from './agent-tools.js';
import type { WorkspaceContext } from '../../types/index.js';

export interface ToolCallTrace {
  toolName: string;
  arguments: any;
  result: any;
  durationMs: number;
  success: boolean;
}

export interface AgentExecutionResult {
  taskType: string;
  model: string;
  summary: string;
  evidence: Record<string, any>;
  suggestedPatch?: Record<string, any>;
  validationNotice?: {
    isReadyForSync: boolean;
    errors: string[];
    warnings: string[];
  };
  checklist?: Array<{
    item: string;
    status: 'pass' | 'fail' | 'warning';
    detail: string;
  }>;
  nextSteps: string[];
  traces: ToolCallTrace[];
  isMockRun: boolean;
}

export class MockGeminiProvider {
  static async runTask(ctx: WorkspaceContext, taskType: string, goal: string, productId?: string, notes?: string): Promise<AgentExecutionResult> {
    const traces: ToolCallTrace[] = [];

    // Simulate agentic reasoning and sequential tool invocation
    if (productId) {
      const startT1 = Date.now();
      const p = await agentToolRegistry.get_product.execute(ctx, { productId });
      traces.push({
        toolName: 'get_product',
        arguments: { productId },
        result: p,
        durationMs: Date.now() - startT1 + 12,
        success: !p.error,
      });

      const startT2 = Date.now();
      const defs = await agentToolRegistry.get_attribute_definitions.execute(ctx, {});
      traces.push({
        toolName: 'get_attribute_definitions',
        arguments: { productType: p.productType },
        result: defs,
        durationMs: Date.now() - startT2 + 8,
        success: true,
      });

      if (taskType === 'audit' || taskType === 'diagnosis') {
        const startT3 = Date.now();
        const val = await agentToolRegistry.validate_product.execute(ctx, { productId });
        traces.push({
          toolName: 'validate_product',
          arguments: { productId },
          result: val,
          durationMs: Date.now() - startT3 + 10,
          success: true,
        });

        const startT4 = Date.now();
        const syncHist = await agentToolRegistry.get_sync_history.execute(ctx, { productId, limit: 3 });
        traces.push({
          toolName: 'get_sync_history',
          arguments: { productId, limit: 3 },
          result: syncHist,
          durationMs: Date.now() - startT4 + 6,
          success: true,
        });

        if (taskType === 'audit') {
          const checklist = [
            { item: 'SKU and Identifiers', status: p.sku ? 'pass' as const : 'fail' as const, detail: `SKU '${p.sku || 'MISSING'}' is valid.` },
            { item: 'Title & Descriptions', status: (p.description && p.description.length > 30) ? 'pass' as const : 'warning' as const, detail: p.description ? 'Description provided.' : 'Description is minimal or missing.' },
            { item: 'Pricing & Valuation', status: p.price ? 'pass' as const : 'fail' as const, detail: p.price ? `Price set to $${p.price.toFixed(2)}` : 'Price is missing.' },
            { item: 'Mandatory Dynamic Attributes', status: val.errors.length === 0 ? 'pass' as const : 'fail' as const, detail: val.errors.length === 0 ? 'All required attributes fulfilled.' : val.errors.join('; ') },
            { item: 'Media Assets', status: (p.images && p.images.length > 0) ? 'pass' as const : 'warning' as const, detail: (p.images && p.images.length > 0) ? `${p.images.length} image(s) attached.` : 'No product images uploaded.' },
          ];

          return {
            taskType,
            model: 'gemini-2.5-flash-simulated',
            summary: `Audit complete for '${p.name}'. ${val.isReadyForSync ? 'Product is fully ready for WooCommerce publishing.' : 'Product requires attention before synchronisation.'}`,
            evidence: { productId: p.id, sku: p.sku, errorsCount: val.errors.length, warningsCount: val.warnings.length },
            checklist,
            nextSteps: val.isReadyForSync
              ? ['Proceed to catalogue publishing', 'Trigger WooCommerce sync in Sync Center']
              : ['Enrich missing attributes using AI Assistant', 'Upload product media asset', 'Set regular price'],
            traces,
            isMockRun: true,
          };
        }

        // Diagnosis
        return {
          taskType,
          model: 'gemini-2.5-flash-simulated',
          summary: `Diagnosed sync status for '${p.name}'. Current sync state is '${p.syncStatus}'.`,
          evidence: {
            productId: p.id,
            syncStatus: p.syncStatus,
            lastSyncError: p.syncError || 'None',
            recentJobs: syncHist,
          },
          validationNotice: val,
          nextSteps: [
            'Review highlighted attribute validation errors',
            'Update product fields in the editor',
            'Click "Sync to WooCommerce" in the UI once validation passes',
          ],
          traces,
          isMockRun: true,
        };
      }

      if (taskType === 'enrichment') {
        const enrichedTitle = notes ? `${p.name} — ${notes.slice(0, 30)}` : p.name;
        const enrichedShortDesc = notes
          ? `Engineered for excellence: ${notes}. Precision-crafted with verified specifications.`
          : p.shortDescription || 'High-performance commercial product crafted with verified premium components.';
        const enrichedDesc = notes
          ? `<p>${p.name} incorporates advanced engineering: ${notes}. Engineered for commercial durability and seamless integration into modern retail workflows.</p>`
          : p.description;

        const proposedPatch: Record<string, any> = {
          name: enrichedTitle,
          shortDescription: enrichedShortDesc,
          description: enrichedDesc,
        };

        const startTDiff = Date.now();
        const diff = await agentToolRegistry.compare_product_changes.execute(ctx, { productId, proposedPatch });
        traces.push({
          toolName: 'compare_product_changes',
          arguments: { productId, proposedPatch },
          result: diff,
          durationMs: Date.now() - startTDiff + 5,
          success: true,
        });

        return {
          taskType,
          model: 'gemini-2.5-flash-simulated',
          summary: `Drafted product enrichment proposal for '${p.name}' using provided notes.`,
          evidence: { productId: p.id, sourceNotes: notes || 'Catalogue analysis' },
          suggestedPatch: proposedPatch,
          nextSteps: [
            'Review proposed field diff in the preview table',
            'Select which fields to accept or reject',
            'Click "Apply Selected Changes" to save (human approval boundary enforced)',
          ],
          traces,
          isMockRun: true,
        };
      }
    }

    // Default Catalogue Query
    const startTQ = Date.now();
    const searchRes = await agentToolRegistry.search_products.execute(ctx, { query: goal, limit: 10 });
    traces.push({
      toolName: 'search_products',
      arguments: { query: goal, limit: 10 },
      result: searchRes,
      durationMs: Date.now() - startTQ + 15,
      success: true,
    });

    return {
      taskType: 'catalogue_query',
      model: 'gemini-2.5-flash-simulated',
      summary: `Found ${searchRes.totalMatches} matching product(s) in workspace catalogue matching '${goal}'.`,
      evidence: searchRes,
      nextSteps: ['Filter results by category or status in Products view', 'Run individual product completeness audits'],
      traces,
      isMockRun: true,
    };
  }
}

export class GeminiAgentService {
  static isAiConfigured(): boolean {
    return process.env.AI_ENABLED === 'true' && Boolean(process.env.GEMINI_API_KEY);
  }

  static getModelName(): string {
    return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  static async runAgentTask(
    ctx: WorkspaceContext,
    taskType: 'audit' | 'enrichment' | 'diagnosis' | 'catalogue_query',
    goal: string,
    productId?: string,
    notes?: string
  ): Promise<AgentExecutionResult> {
    if (!this.isAiConfigured()) {
      return MockGeminiProvider.runTask(ctx, taskType, goal, productId, notes);
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY!;
      const ai = new GoogleGenAI({ apiKey });
      const modelName = this.getModelName();
      const traces: ToolCallTrace[] = [];

      // Execute initial tool gathering before model synthesis
      let productData: any = null;
      let defsData: any = null;

      if (productId) {
        const t1Start = Date.now();
        productData = await agentToolRegistry.get_product.execute(ctx, { productId });
        traces.push({
          toolName: 'get_product',
          arguments: { productId },
          result: productData,
          durationMs: Date.now() - t1Start,
          success: !productData.error,
        });

        const t2Start = Date.now();
        defsData = await agentToolRegistry.get_attribute_definitions.execute(ctx, {});
        traces.push({
          toolName: 'get_attribute_definitions',
          arguments: {},
          result: defsData,
          durationMs: Date.now() - t2Start,
          success: true,
        });
      }

      const prompt = `
You are the Orivanta PIM AI Assistant. Analyze the following product data and fulfill the user task.
Task: ${taskType}
Goal: ${goal}
${productId ? `Product: ${JSON.stringify(productData)}` : ''}
${defsData ? `Attribute Definitions: ${JSON.stringify(defsData)}` : ''}
${notes ? `User Provided Notes: ${notes}` : ''}

Respond in strict JSON with fields:
- summary: string
- evidence: object
- suggestedPatch: optional object with proposed field changes (e.g. name, shortDescription, description)
- checklist: optional array of { item: string, status: "pass"|"fail"|"warning", detail: string }
- nextSteps: array of strings
`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');

      return {
        taskType,
        model: modelName,
        summary: parsed.summary || 'Task completed successfully by Gemini.',
        evidence: parsed.evidence || { productData },
        suggestedPatch: parsed.suggestedPatch,
        checklist: parsed.checklist,
        nextSteps: parsed.nextSteps || ['Review suggestions in UI'],
        traces,
        isMockRun: false,
      };
    } catch (err: any) {
      console.warn('[Gemini Agent Fallback] Live Gemini call encountered error, falling back to mock provider:', err.message);
      return MockGeminiProvider.runTask(ctx, taskType, goal, productId, notes);
    }
  }
}
