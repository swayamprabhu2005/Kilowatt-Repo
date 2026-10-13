import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import {
  Save,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

export const ProductEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'basic' | 'description' | 'categories' | 'attributes' | 'variants' | 'media' | 'sync'>('basic');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    name: '',
    sku: '',
    slug: '',
    productType: 'simple',
    status: 'draft',
    brand: '',
    shortDescription: '',
    description: '',
    price: '',
    stockQuantity: '',
    attributes: {},
    images: [],
    categoryIds: [],
  });

  // Fetch Product if editing
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiFetch<any>(`/products/${id}`),
    enabled: !isNew,
  });

  // Fetch Attribute Definitions
  const { data: attributeDefs = [] } = useQuery({
    queryKey: ['attributes'],
    queryFn: () => apiFetch<any[]>('/attributes'),
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<any[]>('/categories'),
  });

  // Fetch Variants if variable product
  const { data: variants = [], refetch: refetchVariants } = useQuery({
    queryKey: ['variants', id],
    queryFn: () => apiFetch<any[]>(`/products/${id}/variants`),
    enabled: !isNew && formData.productType === 'variable',
  });

  // Populate form on load
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        slug: product.slug || '',
        productType: product.productType || 'simple',
        status: product.status || 'draft',
        brand: product.brand || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        price: product.price !== null && product.price !== undefined ? product.price : '',
        stockQuantity: product.stockQuantity !== null && product.stockQuantity !== undefined ? product.stockQuantity : '',
        attributes: product.attributes || {},
        images: product.images || [],
        categoryIds: product.categoryIds || [],
      });
    }
  }, [product]);

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        price: data.price === '' ? null : parseFloat(data.price),
        stockQuantity: data.stockQuantity === '' ? null : parseInt(data.stockQuantity, 10),
      };
      if (isNew) {
        return apiFetch<any>('/products', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        return apiFetch<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      }
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFeedback({ type: 'success', text: 'Product saved successfully.' });
      if (isNew) {
        navigate(`/products/${saved.id}`);
      }
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', text: err.message || 'Failed to save product.' });
    },
  });

  // Sync Mutation
  const syncMutation = useMutation({
    mutationFn: () => apiFetch<any>(`/sync/products/${id}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      setFeedback({ type: 'success', text: 'Product synced successfully with WooCommerce.' });
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', text: `Sync failed: ${err.message}` });
    },
  });

  // Variant Creation State
  const [newVariantModal, setNewVariantModal] = useState(false);
  const [newVariantSku, setNewVariantSku] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantStock, setNewVariantStock] = useState('');
  const [newVariantCombination, setNewVariantCombination] = useState<Record<string, string>>({});

  const createVariantMutation = useMutation({
    mutationFn: (variantData: any) =>
      apiFetch(`/products/${id}/variants`, { method: 'POST', body: JSON.stringify(variantData) }),
    onSuccess: () => {
      refetchVariants();
      setNewVariantModal(false);
      setNewVariantSku('');
      setNewVariantCombination({});
      setFeedback({ type: 'success', text: 'Variant created successfully.' });
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', text: `Failed to create variant: ${err.message}` });
    },
  });

  // Attribute input change helper
  const handleAttributeChange = (code: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [code]: value,
      },
    }));
  };

  if (productLoading) {
    return <div className="p-8 text-center text-xs text-ink-muted">Loading product editor...</div>;
  }

  const tabs = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'description', label: 'Descriptions' },
    { key: 'categories', label: 'Categories' },
    { key: 'attributes', label: 'Dynamic Attributes' },
    ...(formData.productType === 'variable' ? [{ key: 'variants', label: 'Variants' }] : []),
    { key: 'media', label: 'Media' },
    ...(!isNew ? [{ key: 'sync', label: 'Sync Status' }] : []),
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-enter">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-ink tracking-tight">
              {isNew ? 'Create New Product' : formData.name || 'Edit Product'}
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5 font-mono">
              {isNew ? 'New Catalogue Record' : `SKU: ${formData.sku || 'N/A'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/ai-assistant?productId=${id}`)}
            >
              <Sparkles className="w-4 h-4 text-terracotta-500" />
              <span>AI Audit & Enrich</span>
            </Button>
          )}
          {!isNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncMutation.mutate()}
              isLoading={syncMutation.isPending}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync to Store</span>
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => saveMutation.mutate(formData)}
            isLoading={saveMutation.isPending}
          >
            <Save className="w-4 h-4" />
            <span>Save Product</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-surface-subtle text-ink border-surface-border-strong'
              : 'bg-danger-subtle text-danger border-danger-border'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-surface-border overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-terracotta-500 text-terracotta-600 bg-surface-card'
                : 'border-transparent text-ink-secondary hover:text-ink hover:bg-surface-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Basic Info */}
      {activeTab === 'basic' && (
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                placeholder="e.g. Organic Pima Cotton T-Shirt"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1">SKU (Stock Keeping Unit) *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full p-2.5 bg-surface font-mono text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                placeholder="e.g. APP-PIMA-01"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1">Product Type</label>
              <select
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none"
              >
                <option value="simple">Simple Product</option>
                <option value="variable">Variable Product (with Variants)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1">Regular Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1">Stock Quantity</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                placeholder="100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1">Brand / Manufacturer</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                placeholder="e.g. Atelier Orivanta"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Descriptions */}
      {activeTab === 'description' && (
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Short Description (Summary)</label>
            <textarea
              rows={3}
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              placeholder="High-level value proposition and key highlights..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Full Product Description</label>
            <textarea
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              placeholder="Comprehensive details, fabrication, engineering specs, care instructions..."
            />
          </div>
        </Card>
      )}

      {/* Tab 3: Categories */}
      {activeTab === 'categories' && (
        <Card className="p-6 space-y-4">
          <label className="text-xs font-semibold text-ink block mb-2">Assign Categories</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((c) => {
              const isChecked = formData.categoryIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-terracotta-50 border-terracotta-300 text-terracotta-900'
                      : 'bg-surface border-surface-border text-ink hover:bg-surface-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const next = isChecked
                        ? formData.categoryIds.filter((id: string) => id !== c.id)
                        : [...formData.categoryIds, c.id];
                      setFormData({ ...formData, categoryIds: next });
                    }}
                    className="rounded text-terracotta-600 focus:ring-terracotta-500"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{c.name}</p>
                    {c.wooCategoryId && (
                      <p className="text-[10px] text-ink-muted">Woo ID: {c.wooCategoryId}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tab 4: Dynamic Attributes */}
      {activeTab === 'attributes' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <div>
              <h3 className="text-sm font-semibold text-ink">Dynamic Product Specifications</h3>
              <p className="text-xs text-ink-secondary">Rendered dynamically from active workspace attribute definitions</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/attributes')}>
              Manage Definitions
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {attributeDefs.map((def) => {
              const val = formData.attributes[def.code] ?? '';

              return (
                <div key={def.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-ink">
                      {def.name} {def.isRequired && <span className="text-danger">*</span>}
                    </label>
                    <span className="text-[10px] font-mono text-ink-muted capitalize">{def.dataType}</span>
                  </div>

                  {def.dataType === 'text' && (
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleAttributeChange(def.code, e.target.value)}
                      className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                      placeholder={`Enter ${def.name}...`}
                    />
                  )}

                  {def.dataType === 'number' && (
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleAttributeChange(def.code, e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                      placeholder="0"
                    />
                  )}

                  {def.dataType === 'boolean' && (
                    <div className="flex items-center gap-3 pt-1">
                      <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => handleAttributeChange(def.code, e.target.checked)}
                          className="rounded text-terracotta-600 focus:ring-terracotta-500"
                        />
                        <span>Enabled / Supported</span>
                      </label>
                    </div>
                  )}

                  {def.dataType === 'select' && (
                    <select
                      value={val}
                      onChange={(e) => handleAttributeChange(def.code, e.target.value)}
                      className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none cursor-pointer"
                    >
                      <option value="">— Select an Option —</option>
                      {(def.options || []).map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {def.dataType === 'date' && (
                    <input
                      type="date"
                      value={val}
                      onChange={(e) => handleAttributeChange(def.code, e.target.value)}
                      className="w-full p-2.5 bg-surface text-xs rounded-lg border border-surface-border focus:outline-none"
                    />
                  )}

                  {def.description && <p className="text-[10px] text-ink-muted">{def.description}</p>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tab 5: Variants */}
      {activeTab === 'variants' && formData.productType === 'variable' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <div>
              <h3 className="text-sm font-semibold text-ink">Product Variation Matrix</h3>
              <p className="text-xs text-ink-secondary">Combinations of variant attributes (e.g. Size, Color)</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setNewVariantModal(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </Button>
          </div>

          <div className="divide-y divide-surface-border">
            {variants.map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono font-semibold text-ink">{v.sku}</p>
                  <p className="text-[11px] text-ink-secondary mt-0.5">
                    {Object.entries(v.attributeCombination || {})
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(' • ')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-ink">
                    {v.priceOverride ? `$${v.priceOverride.toFixed(2)}` : 'Base Price'}
                  </span>
                  <Badge variant={v.syncStatus === 'synced' ? 'neutral' : 'warning'}>
                    {v.syncStatus}
                  </Badge>
                </div>
              </div>
            ))}
            {variants.length === 0 && (
              <div className="p-8 text-center text-xs text-ink-muted">
                No variants configured yet. Click "Add Variant" to create combinations.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tab 6: Media */}
      {activeTab === 'media' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">Product Media Assets</h3>
              <p className="text-xs text-ink-secondary">Validated high-resolution image URLs for WooCommerce synchronization</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = prompt('Enter image URL:');
                if (url) {
                  setFormData((prev: any) => ({
                    ...prev,
                    images: [...prev.images, { url, alt: prev.name }],
                  }));
                }
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image URL</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
            {formData.images.map((img: any, idx: number) => (
              <div key={idx} className="relative group rounded-xl border border-surface-border overflow-hidden bg-surface-muted aspect-square">
                <img src={img.url} alt={img.alt || 'Product'} className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setFormData((prev: any) => ({
                      ...prev,
                      images: prev.images.filter((_: any, i: number) => i !== idx),
                    }));
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-danger text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {formData.images.length === 0 && (
              <div className="col-span-full p-8 text-center border-2 border-dashed border-surface-border rounded-xl text-xs text-ink-muted">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-terracotta-500" />
                <p>No images added yet. Click "Add Image URL" above.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tab 7: Sync Status */}
      {activeTab === 'sync' && !isNew && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div>
              <h3 className="text-sm font-semibold text-ink">Channel Synchronization State</h3>
              <p className="text-xs text-ink-secondary">Live WooCommerce mapping and telemetry</p>
            </div>
            <Badge variant={product?.syncStatus === 'synced' ? 'neutral' : product?.syncStatus === 'failed' ? 'danger' : 'warning'}>
              {product?.syncStatus?.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-surface rounded-lg border border-surface-border">
              <span className="text-ink-secondary block">WooCommerce External Product ID:</span>
              <span className="font-mono font-bold text-ink mt-0.5 block">
                {product?.wooProductId ? `#${product.wooProductId}` : 'Not assigned (Unsynced)'}
              </span>
            </div>

            <div className="p-3 bg-surface rounded-lg border border-surface-border">
              <span className="text-ink-secondary block">Last Successful Sync:</span>
              <span className="font-medium text-ink mt-0.5 block">
                {product?.lastSyncAt ? new Date(product.lastSyncAt).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>

          {product?.syncError && (
            <div className="p-3.5 bg-danger-subtle border border-danger-border rounded-lg text-xs text-danger flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Last Synchronization Error:</p>
                <p className="mt-0.5 font-mono text-[11px]">{product.syncError}</p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => syncMutation.mutate()}
              isLoading={syncMutation.isPending}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Trigger Synchronisation Now</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Add Variant Modal */}
      <Modal
        isOpen={newVariantModal}
        onClose={() => setNewVariantModal(false)}
        title="Add Product Variant"
        description="Configure combination of variant attributes and price override"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Variant SKU *</label>
            <input
              type="text"
              required
              value={newVariantSku}
              onChange={(e) => setNewVariantSku(e.target.value)}
              placeholder="e.g. APP-PIMA-BLK-XL"
              className="w-full p-2.5 font-mono text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">Price Override ($)</label>
              <input
                type="number"
                step="0.01"
                value={newVariantPrice}
                onChange={(e) => setNewVariantPrice(e.target.value)}
                placeholder="Optional"
                className="w-full p-2.5 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1">Stock Quantity</label>
              <input
                type="number"
                value={newVariantStock}
                onChange={(e) => setNewVariantStock(e.target.value)}
                placeholder="25"
                className="w-full p-2.5 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              />
            </div>
          </div>

          {/* Variant Attribute Selectors */}
          <div className="space-y-2 pt-2 border-t border-surface-border">
            <span className="text-xs font-semibold text-ink block">Variant Attribute Permutation:</span>
            {attributeDefs
              .filter((d) => d.isVariantParam)
              .map((d) => (
                <div key={d.code} className="flex items-center justify-between text-xs">
                  <span className="text-ink font-medium">{d.name}:</span>
                  <select
                    value={newVariantCombination[d.code] || ''}
                    onChange={(e) =>
                      setNewVariantCombination({ ...newVariantCombination, [d.code]: e.target.value })
                    }
                    className="p-1.5 bg-surface text-xs rounded border border-surface-border"
                  >
                    <option value="">Select</option>
                    {(d.options || []).map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-surface-border">
            <Button variant="secondary" size="sm" onClick={() => setNewVariantModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!newVariantSku.trim()}
              isLoading={createVariantMutation.isPending}
              onClick={() =>
                createVariantMutation.mutate({
                  sku: newVariantSku,
                  attributeCombination: newVariantCombination,
                  priceOverride: newVariantPrice ? parseFloat(newVariantPrice) : null,
                  stockQuantity: newVariantStock ? parseInt(newVariantStock, 10) : null,
                })
              }
            >
              Create Variant
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
