import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Copy,
  Trash2,
  RefreshCw,
  Edit,
  ExternalLink,
  Sparkles,
  Package,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [syncFilter, setSyncFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Categories for Filter Dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<any[]>('/categories'),
  });

  // Fetch Products
  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, statusFilter, syncFilter, categoryFilter, page }],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search,
        status: statusFilter,
        syncStatus: syncFilter,
        categoryId: categoryFilter,
      });
      return apiFetch<{ items: any[]; total: number; totalPages: number }>(`/products?${params.toString()}`);
    },
  });

  const products = data?.items || [];
  const totalPages = data?.totalPages || 1;

  // Single Product Sync Mutation
  const syncMutation = useMutation({
    mutationFn: (productId: string) => apiFetch(`/sync/products/${productId}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFeedbackMsg({ type: 'success', text: 'Product synchronized successfully with WooCommerce.' });
    },
    onError: (err: any) => {
      setFeedbackMsg({ type: 'error', text: `Sync failed: ${err.message}` });
    },
  });

  // Duplicate Product Mutation
  const duplicateMutation = useMutation({
    mutationFn: (productId: string) => apiFetch(`/products/${productId}/duplicate`, { method: 'POST' }),
    onSuccess: (newProduct: any) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFeedbackMsg({ type: 'success', text: `Duplicated product successfully as '${newProduct.name}'.` });
    },
  });

  // Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: (productId: string) => apiFetch(`/products/${productId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFeedbackMsg({ type: 'success', text: 'Product deleted successfully.' });
    },
  });

  // Bulk Actions Mutation
  const bulkMutation = useMutation({
    mutationFn: ({ action, productIds }: { action: string; productIds: string[] }) =>
      apiFetch('/products/bulk-actions', {
        method: 'POST',
        body: JSON.stringify({ action, productIds }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedIds([]);
      setFeedbackMsg({ type: 'success', text: 'Bulk action completed successfully.' });
    },
  });

  // Export CSV
  const handleExportCsv = async () => {
    try {
      const csvText = await apiFetch<string>('/products/export-csv');
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orivanta-catalogue-${Date.now()}.csv`;
      a.click();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: `Export failed: ${err.message}` });
    }
  };

  // Import CSV
  const handleImportCsv = async () => {
    try {
      await apiFetch('/products/import-csv', {
        method: 'POST',
        body: JSON.stringify({ csvText: importCsvText }),
      });
      setImportModalOpen(false);
      setImportCsvText('');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFeedbackMsg({ type: 'success', text: 'CSV catalogue imported successfully.' });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: `Import failed: ${err.message}` });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6 animate-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink tracking-tight">Product Catalogue</h2>
          <p className="text-xs text-ink-secondary mt-0.5">Manage master product data, dynamic attributes, and retail channels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/products/new')}>
            <Plus className="w-3.5 h-3.5" />
            <span>New Product</span>
          </Button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            feedbackMsg.type === 'success'
              ? 'bg-surface-subtle text-ink border-surface-border-strong'
              : 'bg-danger-subtle text-danger border-danger-border'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-ink-muted hover:text-ink font-bold">
            ×
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-surface-card p-4 rounded-xl border border-surface-border shadow-warm flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Sync Status Filter */}
          <select
            value={syncFilter}
            onChange={(e) => {
              setSyncFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none cursor-pointer"
          >
            <option value="all">All Sync States</option>
            <option value="synced">Synced</option>
            <option value="not_synced">Not Synced</option>
            <option value="failed">Sync Failed</option>
            <option value="syncing">Syncing</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-terracotta-50 border border-terracotta-200 p-3 rounded-xl flex items-center justify-between text-xs text-terracotta-900 animate-enter">
          <span className="font-semibold">{selectedIds.length} product(s) selected</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkMutation.mutate({ action: 'delete', productIds: selectedIds })}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </Button>
          </div>
        </div>
      )}

      {/* Catalogue Table */}
      <div className="bg-surface-card rounded-xl border border-surface-border shadow-warm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-surface-border text-ink-secondary font-semibold uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="p-4 w-8">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={toggleSelectAll}
                    className="rounded border-surface-border text-terracotta-600 focus:ring-terracotta-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">WooCommerce Sync</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-surface-muted/60 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="rounded border-surface-border text-terracotta-600 focus:ring-terracotta-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-muted border border-surface-border overflow-hidden shrink-0 flex items-center justify-center">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-ink-muted font-mono">PIM</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          onClick={() => navigate(`/products/${p.id}`)}
                          className="font-semibold text-ink hover:text-terracotta-600 cursor-pointer truncate"
                        >
                          {p.name}
                        </p>
                        {p.brand && <p className="text-[10px] text-ink-muted">{p.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-medium text-ink-secondary">{p.sku}</td>
                  <td className="p-4 capitalize text-ink-secondary">{p.productType}</td>
                  <td className="p-4 font-medium text-ink">{p.price !== null && p.price !== undefined ? `$${p.price.toFixed(2)}` : '—'}</td>
                  <td className="p-4">
                    <Badge variant={p.status === 'published' ? 'neutral' : 'warning'}>{p.status}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={p.syncStatus === 'synced' ? 'neutral' : p.syncStatus === 'failed' ? 'danger' : 'warning'}>
                        {p.syncStatus}
                      </Badge>
                      {p.wooProductId && (
                        <span className="text-[10px] font-mono text-ink-muted">#{p.wooProductId}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="AI Audit"
                        onClick={() => navigate(`/ai-assistant?productId=${p.id}`)}
                        className="p-1.5 text-terracotta-600 hover:text-terracotta-700 hover:bg-terracotta-50 rounded-lg transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        title="Sync to WooCommerce"
                        onClick={() => syncMutation.mutate(p.id)}
                        disabled={syncMutation.isPending}
                        className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        title="Duplicate"
                        onClick={() => duplicateMutation.mutate(p.id)}
                        className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        title="Edit"
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete '${p.name}'?`)) {
                            deleteMutation.mutate(p.id);
                          }
                        }}
                        className="p-1.5 text-ink-muted hover:text-danger hover:bg-danger-subtle rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-ink-muted">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-terracotta-500" />
                    <p className="font-semibold text-ink text-sm">No products found</p>
                    <p className="text-xs text-ink-secondary mt-1">Try adjusting your filters or create a new product.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-surface-border flex items-center justify-between text-xs text-ink-secondary">
          <span>
            Page {page} of {totalPages} ({data?.total || 0} total products)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* CSV Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Products from CSV"
        description="Paste your CSV content with columns: ID, Name, SKU, Type, Status, Price, Stock, Brand"
      >
        <div className="space-y-4">
          <textarea
            rows={8}
            value={importCsvText}
            onChange={(e) => setImportCsvText(e.target.value)}
            placeholder={`"ID","Name","SKU","Type","Status","Price","Stock","Brand"\n"","Ergonomic Chair","CHAIR-01","simple","draft","249.00","20","Kanso Living"`}
            className="w-full p-3 font-mono text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleImportCsv} disabled={!importCsvText.trim()}>
              Import Products
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
