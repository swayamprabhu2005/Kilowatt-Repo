import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { RefreshCw, RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const SyncCenterPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['sync-jobs'],
    queryFn: () => apiFetch<any[]>('/sync/jobs?limit=50'),
    refetchInterval: 5000, // Poll every 5s for live job state updates
  });

  const retryMutation = useMutation({
    mutationFn: (jobId: string) => apiFetch(`/sync/jobs/${jobId}/retry`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-jobs'] });
      setFeedback('Sync job retry initiated successfully.');
    },
    onError: (err: any) => {
      setFeedback(`Retry failed: ${err.message}`);
    },
  });

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink tracking-tight">Synchronization Center</h2>
          <p className="text-xs text-ink-secondary mt-0.5">Real-time job queue, idempotency tracking, and failure recovery</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Queue</span>
          </Button>
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

      {/* Sync Jobs Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-surface-border text-ink-secondary font-semibold uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="p-4">Job ID</th>
                <th className="p-4">Target Product</th>
                <th className="p-4">Operation</th>
                <th className="p-4">Status</th>
                <th className="p-4">External Woo ID</th>
                <th className="p-4">Attempts</th>
                <th className="p-4">Started</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-muted/60 transition-colors">
                  <td className="p-4 font-mono font-medium text-ink-secondary">{job.id}</td>
                  <td className="p-4 font-semibold text-ink">
                    {job.productName || 'Catalogue Batch'}
                    {job.productSku && <span className="font-mono text-[10px] text-ink-muted ml-1.5">({job.productSku})</span>}
                  </td>
                  <td className="p-4 uppercase font-mono text-[11px] text-ink-secondary">{job.operationType}</td>
                  <td className="p-4">
                    <Badge variant={job.status === 'synced' ? 'neutral' : job.status === 'failed' ? 'danger' : 'warning'}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="p-4 font-mono text-ink-secondary">
                    {job.wooId ? `#${job.wooId}` : '—'}
                  </td>
                  <td className="p-4 text-ink-secondary">{job.attemptCount}</td>
                  <td className="p-4 text-ink-muted">
                    {job.startedAt ? new Date(job.startedAt).toLocaleTimeString() : new Date(job.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {job.errorMessage && (
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="px-2 py-1 text-[11px] font-medium text-danger hover:bg-danger-subtle rounded transition-colors"
                        >
                          View Error
                        </button>
                      )}
                      {job.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryMutation.mutate(job.id)}
                          isLoading={retryMutation.isPending}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && jobs.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-ink-muted">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-terracotta-500" />
                    <p className="font-semibold text-ink text-sm">No sync jobs recorded</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Error Details Modal */}
      <Modal
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        title="Synchronization Diagnostic Log"
        description={`Job ID: ${selectedJob?.id} • Product: ${selectedJob?.productName || 'N/A'}`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-danger-subtle border border-danger-border rounded-xl">
            <div className="flex items-center gap-2 text-danger font-semibold text-xs mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{selectedJob?.errorCode || 'SYNC_ERROR'}</span>
            </div>
            <p className="text-xs font-mono text-ink mt-2 whitespace-pre-wrap">{selectedJob?.errorMessage}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-surface rounded-lg border border-surface-border">
              <span className="text-ink-secondary block font-medium">Integration Mode:</span>
              <span className="font-mono text-ink mt-0.5 block uppercase">{selectedJob?.integrationMode}</span>
            </div>
            <div className="p-3 bg-surface rounded-lg border border-surface-border">
              <span className="text-ink-secondary block font-medium">Attempt Count:</span>
              <span className="font-mono text-ink mt-0.5 block">{selectedJob?.attemptCount} attempt(s)</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
            <Button variant="secondary" size="sm" onClick={() => setSelectedJob(null)}>
              Close
            </Button>
            {selectedJob?.status === 'failed' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  retryMutation.mutate(selectedJob.id);
                  setSelectedJob(null);
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Job Now</span>
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
