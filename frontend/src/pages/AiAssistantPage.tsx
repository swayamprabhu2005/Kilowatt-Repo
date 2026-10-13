import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  ArrowRight,
  ShieldAlert,
  Terminal,
  Clock,
  Check,
  X,
} from 'lucide-react';

export const AiAssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialProductId = searchParams.get('productId') || '';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeWorkflow, setActiveWorkflow] = useState<'audit' | 'enrichment' | 'diagnosis' | 'query'>('audit');
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId);
  const [notes, setNotes] = useState<string>('');
  const [queryGoal, setQueryGoal] = useState<string>('Which products are in draft status?');
  const [traceModalOpen, setTraceModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Proposed Patch Selection State (for Enrichment Human Approval)
  const [acceptedFields, setAcceptedFields] = useState<Record<string, boolean>>({
    name: true,
    shortDescription: true,
    description: true,
  });

  // Fetch AI Status
  const { data: aiStatus } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => apiFetch<any>('/ai/status'),
  });

  // Fetch Products for Selector Dropdown
  const { data: productsData } = useQuery({
    queryKey: ['products-list-ai'],
    queryFn: () => apiFetch<{ items: any[] }>('/products?limit=50'),
  });
  const products = productsData?.items || [];

  // Agent Run Mutation
  const agentMutation = useMutation({
    mutationFn: (payload: any) => apiFetch<any>('/ai/agent/run', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      setFeedback('Agent completed task and recorded execution traces.');
    },
    onError: (err: any) => {
      setFeedback(`Agent task failed: ${err.message}`);
    },
  });

  // Commit Enrichment Mutation (Human Approval Boundary)
  const commitPatchMutation = useMutation({
    mutationFn: ({ productId, patch }: { productId: string; patch: any }) =>
      apiFetch(`/products/${productId}`, { method: 'PUT', body: JSON.stringify(patch) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFeedback('Proposed changes successfully committed to product catalogue.');
    },
    onError: (err: any) => {
      setFeedback(`Failed to apply changes: ${err.message}`);
    },
  });

  const handleRunAgent = () => {
    setFeedback(null);
    let goal = '';
    let taskType = activeWorkflow;

    if (activeWorkflow === 'audit') {
      goal = 'Audit product completeness, required attributes, descriptions, and sync blockers.';
    } else if (activeWorkflow === 'enrichment') {
      goal = 'Enrich product specifications, titles, and descriptions based on user provided notes.';
    } else if (activeWorkflow === 'diagnosis') {
      goal = 'Diagnose synchronization failure and explain required attribute remediations.';
    } else {
      taskType = 'catalogue_query' as any;
      goal = queryGoal;
    }

    agentMutation.mutate({
      taskType,
      goal,
      productId: selectedProductId || undefined,
      notes: activeWorkflow === 'enrichment' ? notes : undefined,
    });
  };

  const agentResult = agentMutation.data;

  const handleApplySelectedChanges = () => {
    if (!selectedProductId || !agentResult?.suggestedPatch) return;
    const patchToApply: Record<string, any> = {};
    for (const [key, val] of Object.entries(agentResult.suggestedPatch)) {
      if (acceptedFields[key]) {
        patchToApply[key] = val;
      }
    }
    commitPatchMutation.mutate({ productId: selectedProductId, patch: patchToApply });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-ink tracking-tight">AI Product Assistant</h2>
            <Badge variant="terracotta" className="text-[10px] font-mono">
              BOUNDED AGENTIC
            </Badge>
          </div>
          <p className="text-xs text-ink-secondary mt-0.5">
            Gemini-powered reasoning for catalogue audits, attribute enrichment, and channel diagnostics
          </p>
        </div>

        {/* Model status indicator */}
        <div className="flex items-center gap-2">
          <Badge variant={aiStatus?.isConfigured ? 'neutral' : 'warning'}>
            {aiStatus?.isConfigured ? `Gemini Active: ${aiStatus.model}` : 'Offline Mock Provider Active'}
          </Badge>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-surface-subtle border border-surface-border-strong rounded-lg text-xs text-ink flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* Workflow Selector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: 'audit', label: 'Completeness Audit', desc: 'Scan attributes & readiness' },
          { key: 'enrichment', label: 'AI Enrichment', desc: 'Draft descriptions & diffs' },
          { key: 'diagnosis', label: 'Sync Diagnosis', desc: 'Diagnose channel errors' },
          { key: 'query', label: 'Catalogue Query', desc: 'Natural language search' },
        ].map((wf) => (
          <button
            key={wf.key}
            onClick={() => {
              setActiveWorkflow(wf.key as any);
              agentMutation.reset();
            }}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeWorkflow === wf.key
                ? 'bg-gradient-to-br from-terracotta-50 to-amber-50/50 border-terracotta-300 shadow-warm ring-1 ring-terracotta-400'
                : 'bg-surface-card border-surface-border hover:bg-surface-muted text-ink'
            }`}
          >
            <p className="text-xs font-bold text-ink">{wf.label}</p>
            <p className="text-[10px] text-ink-secondary mt-0.5">{wf.desc}</p>
          </button>
        ))}
      </div>

      {/* Configuration & Inputs Card */}
      <Card className="p-5 space-y-4 gradient-border-top">
        {activeWorkflow !== 'query' ? (
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Select Target Product *</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none cursor-pointer"
            >
              <option value="">— Choose a Product to Inspect —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — {p.syncStatus}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Natural Language Catalogue Goal *</label>
            <input
              type="text"
              value={queryGoal}
              onChange={(e) => setQueryGoal(e.target.value)}
              placeholder="e.g. Which products failed synchronisation?"
              className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            />
          </div>
        )}

        {activeWorkflow === 'enrichment' && (
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Raw Specifications or Operator Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Crafted from 40L waterproof Dyneema composite. Ergonomic load lifters, hydration bladder routing, taped seams."
              className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-surface-border">
          <div className="flex items-center gap-2 text-ink-muted text-[11px]">
            <ShieldAlert className="w-4 h-4 text-terracotta-600 shrink-0" />
            <span>Human Approval Boundary Enforced: Agent cannot write to DB or publish externally.</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRunAgent}
            disabled={activeWorkflow !== 'query' && !selectedProductId}
            isLoading={agentMutation.isPending}
          >
            <Sparkles className="w-4 h-4" />
            <span>Execute Agentic Reasoning</span>
          </Button>
        </div>
      </Card>

      {/* Agent Results Display */}
      {agentResult && (
        <div className="space-y-6 animate-enter">
          {/* Executive Summary Card */}
          <Card className="p-5 border-l-4 border-l-terracotta-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">
                Agent Findings & Synthesis
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTraceModalOpen(true)}
              >
                <Terminal className="w-3.5 h-3.5 text-terracotta-600" />
                <span>Inspect Tool Execution Traces ({agentResult.traces.length})</span>
              </Button>
            </div>
            <p className="text-sm font-semibold text-ink">{agentResult.summary}</p>
          </Card>

          {/* Workflow 1: Completeness Audit Checklist */}
          {agentResult.checklist && (
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Product Readiness Audit Checklist</h3>
              <div className="divide-y divide-surface-border">
                {agentResult.checklist.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-ink">{item.item}</p>
                      <p className="text-ink-secondary text-[11px] mt-0.5">{item.detail}</p>
                    </div>
                    <Badge variant={item.status === 'pass' ? 'neutral' : item.status === 'fail' ? 'danger' : 'warning'}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Workflow 2: Proposed Field-Level Diff Preview (Enrichment) */}
          {agentResult.suggestedPatch && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                <div>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Proposed Field Diff & Review</h3>
                  <p className="text-[11px] text-ink-secondary mt-0.5">
                    Review AI-proposed changes. Select fields to accept before applying.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApplySelectedChanges}
                  isLoading={commitPatchMutation.isPending}
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Selected Changes (Commit)</span>
                </Button>
              </div>

              <div className="space-y-3">
                {Object.entries(agentResult.suggestedPatch).map(([field, val]) => (
                  <div key={field} className="p-3 bg-surface rounded-lg border border-surface-border space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 font-semibold text-ink capitalize cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(acceptedFields[field])}
                          onChange={(e) =>
                            setAcceptedFields({ ...acceptedFields, [field]: e.target.checked })
                          }
                          className="rounded text-terracotta-600 focus:ring-terracotta-500"
                        />
                        <span>{field}</span>
                      </label>
                      <Badge variant="terracotta">Proposed Change</Badge>
                    </div>
                    <div className="bg-surface-card p-2 rounded border border-surface-border font-mono text-[11px] text-ink whitespace-pre-wrap">
                      {String(val)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Next Steps Guidance */}
          {agentResult.nextSteps && agentResult.nextSteps.length > 0 && (
            <Card className="p-5 space-y-2 bg-surface-muted">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Recommended Operator Next Steps</h3>
              <ul className="space-y-1.5 text-xs text-ink-secondary">
                {agentResult.nextSteps.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Tool Execution Trace Modal */}
      <Modal
        isOpen={traceModalOpen}
        onClose={() => setTraceModalOpen(false)}
        title="Agentic Tool Execution Trace"
        description="Verifiable log proving server-side read-only tool invocations and timings"
        maxWidth="xl"
      >
        <div className="space-y-3 font-mono text-xs">
          {(agentResult?.traces || []).map((t: any, idx: number) => (
            <div key={idx} className="p-3 bg-surface-muted rounded-xl border border-surface-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-terracotta-700">{t.toolName}()</span>
                <span className="text-[10px] text-ink-muted">{t.durationMs}ms</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted uppercase block">Arguments:</span>
                <pre className="text-[10px] bg-surface-card p-2 rounded border border-surface-border overflow-x-auto text-ink">
                  {JSON.stringify(t.arguments, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted uppercase block">Result:</span>
                <pre className="text-[10px] bg-surface-card p-2 rounded border border-surface-border overflow-x-auto text-ink max-h-36">
                  {JSON.stringify(t.result, null, 2)}
                </pre>
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setTraceModalOpen(false)}>
              Close Trace
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
