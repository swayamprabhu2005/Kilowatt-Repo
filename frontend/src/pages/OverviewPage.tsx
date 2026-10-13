import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  RefreshCw,
  Plus,
  ArrowRight,
  Sparkles,
  Store,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiFetch<any>('/dashboard/summary'),
    refetchInterval: 10000,
  });

  const { data: wooStatus } = useQuery({
    queryKey: ['woo-status'],
    queryFn: () => apiFetch<any>('/integrations/woocommerce/status'),
  });

  const metrics = data?.metrics || {
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    needsAttentionProducts: 0,
    syncedProducts: 0,
    syncFailedProducts: 0,
  };

  const statCards = [
    { title: 'Total Products', value: metrics.totalProducts, icon: Package, desc: 'Catalogue items' },
    { title: 'Published', value: metrics.publishedProducts, icon: CheckCircle2, desc: 'Live in catalogue' },
    { title: 'Drafts', value: metrics.draftProducts, icon: FileEdit, desc: 'In development' },
    { title: 'Needs Attention', value: metrics.needsAttentionProducts, icon: AlertTriangle, desc: 'Missing specs or failed sync', alert: metrics.needsAttentionProducts > 0 },
    { title: 'Synced with Store', value: metrics.syncedProducts, icon: RefreshCw, desc: 'WooCommerce synchronized' },
    { title: 'Failed Syncs', value: metrics.syncFailedProducts, icon: AlertTriangle, desc: 'Requires retry', alert: metrics.syncFailedProducts > 0 },
  ];

  return (
    <div className="space-y-8 animate-enter">
      {/* Priority Credential Locking Banner for New Workspaces in Live Mode */}
      {wooStatus?.isNewWorkspace && !wooStatus?.isLocked && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-terracotta-50 via-amber-50/50 to-surface-card border-2 border-terracotta-300 shadow-warm-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 text-white flex items-center justify-center shrink-0 shadow-warm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ink">Step 1: Lock WooCommerce Store Credentials</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Store Mode
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5 max-w-xl">
                Your workspace is live! Configure and securely lock your store URL and REST API keys to activate bi-directional catalogue synchronisation.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/woocommerce')}
            className="shrink-0 shadow-warm"
          >
            <span>Lock Credentials →</span>
          </Button>
        </motion.div>
      )}

      {/* Welcome Hero Banner with Subtle Warm Radial Gradient */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-terracotta-50/80 via-[#FDF5F0] to-amber-50/40 border border-terracotta-200/70 shadow-warm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-terracotta-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-terracotta-500 text-white tracking-wide uppercase shadow-warm-sm">
                Live Catalogue Hub
              </span>
              <span className="text-xs text-ink-secondary">Production-Grade Architecture</span>
            </div>
            <h2 className="text-xl font-bold text-ink tracking-tight">Orivanta PIM Control Center</h2>
            <p className="text-xs text-ink-secondary mt-1 max-w-xl">
              Centralized product specifications, dynamic attributes, variant permutations, and reliable WooCommerce channel synchronisation.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Button variant="outline" size="sm" onClick={() => navigate('/ai-assistant')} className="bg-surface-card/80">
              <Sparkles className="w-4 h-4 text-terracotta-500" />
              <span>AI Audit Assistant</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/products/new')}>
              <Plus className="w-4 h-4" />
              <span>New Product</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="h-full"
          >
            <Card className="h-full p-4 bg-surface-card border-surface-border shadow-warm hover:shadow-warm-md transition-shadow relative overflow-hidden gradient-border-top">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-ink-secondary">{stat.title}</span>
                <stat.icon className={`w-4 h-4 ${stat.alert ? 'text-amber-600' : 'text-terracotta-500'}`} />
              </div>
              <p className="text-2xl font-bold text-ink">{isLoading ? '...' : stat.value}</p>
              <p className="text-[10px] text-ink-muted mt-1">{stat.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Two Column Section: Recent Products & Recent Syncs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Product Updates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3.5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-terracotta-500" />
              <span>Recent Product Updates</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-surface-border">
              {(data?.recentProducts || []).map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="p-4 flex items-center justify-between hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-semibold text-ink truncate">{p.name}</p>
                    <p className="text-[10px] text-ink-muted font-mono mt-0.5">SKU: {p.sku}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={p.syncStatus === 'synced' ? 'neutral' : p.syncStatus === 'failed' ? 'danger' : 'warning'}>
                      {p.syncStatus}
                    </Badge>
                    <span className="text-xs font-medium text-ink">{p.price ? `$${p.price.toFixed(2)}` : '—'}</span>
                  </div>
                </div>
              ))}
              {(!data?.recentProducts || data.recentProducts.length === 0) && (
                <div className="p-8 text-center text-xs text-ink-muted">No products found.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Synchronization History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3.5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Store className="w-4 h-4 text-terracotta-500" />
              <span>Recent WooCommerce Sync Activity</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/sync')}>
              <span>Sync Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-surface-border">
              {(data?.recentSyncs || []).map((j: any) => (
                <div key={j.id} className="p-4 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-semibold text-ink truncate">{j.product_name || 'Catalogue Batch'}</p>
                    <p className="text-[10px] text-ink-muted mt-0.5">
                      Operation: <span className="uppercase font-mono">{j.operation_type}</span> • {new Date(j.created_at).toLocaleTimeString()}
                    </p>
                    {j.error_message && (
                      <p className="text-[10px] text-danger mt-1 line-clamp-1">{j.error_message}</p>
                    )}
                  </div>
                  <Badge variant={j.status === 'synced' ? 'neutral' : j.status === 'failed' ? 'danger' : 'warning'}>
                    {j.status}
                  </Badge>
                </div>
              ))}
              {(!data?.recentSyncs || data.recentSyncs.length === 0) && (
                <div className="p-8 text-center text-xs text-ink-muted">No recent sync activity.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
