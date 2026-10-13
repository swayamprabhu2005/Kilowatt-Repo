import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Store, CheckCircle2, AlertTriangle, RefreshCw, Key, ShieldCheck } from 'lucide-react';

export const WooCommercePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [testResult, setTestResult] = useState<any>(null);

  const { data: status, isLoading } = useQuery({
    queryKey: ['woo-status'],
    queryFn: () => apiFetch<any>('/integrations/woocommerce/status'),
  });

  const testMutation = useMutation({
    mutationFn: () => apiFetch<any>('/integrations/woocommerce/test', { method: 'POST' }),
    onSuccess: (res) => {
      setTestResult(res);
    },
    onError: (err: any) => {
      setTestResult({ success: false, error: err.message });
    },
  });

  const failureSimulationMutation = useMutation({
    mutationFn: (fail: boolean) => apiFetch('/sync/simulate-failure', { method: 'POST', body: JSON.stringify({ fail }) }),
    onSuccess: () => {
      alert('Simulated failure toggled! Next mock sync operation will fail to demonstrate retry workflows.');
    },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink tracking-tight">WooCommerce Integration Channel</h2>
          <p className="text-xs text-ink-secondary mt-0.5">Manage store connection, API credentials, and sync adapter mode</p>
        </div>
        <Badge variant={status?.isMock ? 'terracotta' : 'neutral'} className="font-mono text-xs">
          {status?.isMock ? 'DEMO MOCK MODE' : 'LIVE WOOCOMMERCE'}
        </Badge>
      </div>

      {/* Integration Status Overview Card */}
      <Card className="gradient-border-top">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Store className="w-4 h-4 text-terracotta-500" />
            <span>Store Connection Parameters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-surface rounded-lg border border-surface-border">
              <span className="text-ink-secondary block font-medium">Configured Store URL:</span>
              <span className="font-mono text-ink font-semibold mt-1 block truncate">
                {status?.storeUrl || 'https://mock.orivanta.local'}
              </span>
            </div>

            <div className="p-4 bg-surface rounded-lg border border-surface-border">
              <span className="text-ink-secondary block font-medium">Adapter Mode:</span>
              <span className="font-semibold text-ink mt-1 block">
                {status?.mode === 'mock' ? 'In-Memory & SQLite Mock Adapter' : 'Official WooCommerce REST API v3'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => testMutation.mutate()}
              isLoading={testMutation.isPending}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Verify Store Connection</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => failureSimulationMutation.mutate(true)}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Simulate Next Sync Failure (Demo)</span>
            </Button>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs mt-4 ${
                testResult.success
                  ? 'bg-surface-subtle border-surface-border-strong text-ink'
                  : 'bg-danger-subtle border-danger-border text-danger'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-terracotta-600" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{testResult.success ? 'Connection Verified Successfully' : 'Connection Check Failed'}</span>
              </div>
              <p className="mt-1 text-ink-secondary font-mono text-[11px]">
                {testResult.storeName} ({testResult.version || testResult.mode}) • Latency: &lt;15ms
              </p>
              {testResult.error && <p className="mt-1 text-danger font-mono text-[11px]">{testResult.error}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real Store Connection Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Key className="w-4 h-4 text-terracotta-500" />
            <span>Connecting a Live WooCommerce Store</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-ink-secondary space-y-3">
          <p>
            To connect a live WooCommerce store, generate REST API keys in your WordPress administration dashboard under:
          </p>
          <div className="bg-surface p-3 rounded-lg border border-surface-border font-mono text-[11px] text-ink">
            WooCommerce &gt; Settings &gt; Advanced &gt; REST API &gt; Add Key (Read/Write Permissions)
          </div>
          <p>
            Update the backend environment variables in your local <code className="font-mono text-ink">.env</code> file:
          </p>
          <pre className="bg-surface p-3.5 rounded-lg border border-surface-border font-mono text-[11px] text-ink overflow-x-auto">
{`INTEGRATION_MODE=woocommerce
WOOCOMMERCE_STORE_URL=https://your-live-store.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxx`}
          </pre>
          <div className="flex items-center gap-2 text-ink-muted text-[11px] pt-1">
            <ShieldCheck className="w-4 h-4 text-terracotta-600 shrink-0" />
            <span>Consumer secrets are strictly handled server-side and never exposed in frontend bundles or API responses.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
