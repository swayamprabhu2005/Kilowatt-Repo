import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  ShieldCheck,
  Lock,
  Unlock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const WooCommercePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [testResult, setTestResult] = useState<any>(null);
  const [storeUrl, setStoreUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [lockMessage, setLockMessage] = useState<string | null>(null);

  const { data: status, isLoading } = useQuery({
    queryKey: ['woo-status'],
    queryFn: () => apiFetch<any>('/integrations/woocommerce/status'),
  });

  useEffect(() => {
    if (status?.storeUrl) {
      setStoreUrl(status.storeUrl);
    }
  }, [status?.storeUrl]);

  const testMutation = useMutation({
    mutationFn: () => apiFetch<any>('/integrations/woocommerce/test', { method: 'POST' }),
    onSuccess: (res) => {
      setTestResult(res);
    },
    onError: (err: any) => {
      setTestResult({ success: false, error: err.message });
    },
  });

  const lockMutation = useMutation({
    mutationFn: (lock: boolean) =>
      apiFetch<any>('/integrations/woocommerce/lock-credentials', {
        method: 'POST',
        body: JSON.stringify({
          storeUrl: storeUrl || status?.storeUrl || 'https://kilowatt-repo.local',
          consumerKey: consumerKey || 'ck_configured_key',
          consumerSecret: consumerSecret || 'cs_configured_secret',
          lock,
        }),
      }),
    onSuccess: (res) => {
      setLockMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ['woo-status'] });
      setTimeout(() => setLockMessage(null), 4000);
    },
    onError: (err: any) => {
      alert('Credential update error: ' + err.message);
    },
  });

  const failureSimulationMutation = useMutation({
    mutationFn: (fail: boolean) => apiFetch('/sync/simulate-failure', { method: 'POST', body: JSON.stringify({ fail }) }),
    onSuccess: () => {
      alert('Simulated failure toggled! Next mock sync operation will fail to demonstrate retry workflows.');
    },
  });

  const isLocked = Boolean(status?.isLocked);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink tracking-tight">WooCommerce Integration Channel</h2>
          <p className="text-xs text-ink-secondary mt-0.5">Manage store connection, API credentials, and sync adapter mode</p>
        </div>
        <div className="flex items-center gap-2">
          {status?.isLive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE WOOCOMMERCE
            </span>
          ) : (
            <Badge variant="terracotta" className="font-mono text-xs">
              DEMO MOCK MODE
            </Badge>
          )}
        </div>
      </div>

      {/* 1. Priority Credential Locking Card */}
      <Card className="gradient-border-top shadow-warm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-terracotta-500" />
              <span>WooCommerce Store Credentials & Locking</span>
            </CardTitle>
            {isLocked ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Credentials Locked & Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Setup Required (Unlocked)
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-ink-secondary leading-relaxed">
            Configure your WooCommerce REST API v3 keys. Once locked, credentials are saved securely in SQLite, protected from client exposure, and applied across catalogue sync operations.
          </p>

          <AnimatePresence>
            {lockMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lockMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">Store URL</label>
              <input
                type="url"
                disabled={isLocked}
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="https://kilowatt-repo.local"
                className="w-full px-3 py-2 bg-surface rounded-lg border border-surface-border text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:opacity-80 disabled:bg-surface-muted"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Consumer Key</label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={isLocked && status?.maskedKey ? status.maskedKey : consumerKey}
                  onChange={(e) => setConsumerKey(e.target.value)}
                  placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-surface rounded-lg border border-surface-border text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:opacity-80 disabled:bg-surface-muted"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Consumer Secret</label>
                <input
                  type="password"
                  disabled={isLocked}
                  value={isLocked ? '••••••••••••••••••••••••' : consumerSecret}
                  onChange={(e) => setConsumerSecret(e.target.value)}
                  placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-surface rounded-lg border border-surface-border text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:opacity-80 disabled:bg-surface-muted"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isLocked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => lockMutation.mutate(false)}
                isLoading={lockMutation.isPending}
              >
                <Unlock className="w-3.5 h-3.5 mr-1.5" />
                <span>Unlock Credentials to Edit</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => lockMutation.mutate(true)}
                isLoading={lockMutation.isPending}
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                <span>Lock & Activate Credentials</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => testMutation.mutate()}
              isLoading={testMutation.isPending}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Verify Connection</span>
            </Button>
          </div>

          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border text-xs mt-3 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-danger-subtle border-danger-border text-danger'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-danger" />}
                <span>{testResult.success ? 'Connection Verified Successfully' : 'Connection Check Failed'}</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-ink-secondary">
                {testResult.storeName} ({testResult.version || testResult.mode}) • Mode: {status?.mode}
              </p>
              {testResult.error && <p className="mt-1 font-mono text-[11px] text-danger">{testResult.error}</p>}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* 2. Connection Parameters Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Store className="w-4 h-4 text-terracotta-500" />
            <span>Store Channel Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-surface rounded-lg border border-surface-border">
              <span className="text-ink-secondary block font-medium">Configured Store URL:</span>
              <a
                href={status?.storeUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-terracotta-600 hover:text-terracotta-700 font-semibold mt-1 flex items-center gap-1 truncate"
              >
                <span>{status?.storeUrl || 'https://kilowatt-repo.local'}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            <div className="p-4 bg-surface rounded-lg border border-surface-border">
              <span className="text-ink-secondary block font-medium">Active Adapter:</span>
              <span className="font-semibold text-ink mt-1 block">
                {status?.isLive ? 'Official WooCommerce REST API v3 (HTTPS)' : 'In-Memory & SQLite Mock Adapter'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => failureSimulationMutation.mutate(true)}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 mr-1.5" />
              <span>Simulate Next Sync Failure (Demo)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Real Store Key Generation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Key className="w-4 h-4 text-terracotta-500" />
            <span>Generating WooCommerce API Keys in WordPress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-ink-secondary space-y-3">
          <p>
            To generate WooCommerce REST keys for your store, open your WordPress dashboard:
          </p>
          <div className="bg-surface p-3 rounded-lg border border-surface-border font-mono text-[11px] text-ink">
            WooCommerce &gt; Settings &gt; Advanced &gt; REST API &gt; Add Key (Read/Write Permissions)
          </div>
          <div className="flex items-center gap-2 text-ink-muted text-[11px] pt-1">
            <ShieldCheck className="w-4 h-4 text-terracotta-600 shrink-0" />
            <span>Keys are stored strictly in the server SQLite database and never exposed in frontend JavaScript bundles.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
