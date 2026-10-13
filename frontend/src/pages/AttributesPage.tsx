import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { SlidersHorizontal, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';

export const AttributesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dataType, setDataType] = useState<'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date'>('text');
  const [isRequired, setIsRequired] = useState(false);
  const [isFilterable, setIsFilterable] = useState(true);
  const [isVariantParam, setIsVariantParam] = useState(false);
  const [optionsStr, setOptionsStr] = useState('');

  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ['attributes'],
    queryFn: () => apiFetch<any[]>('/attributes'),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingAttr) {
        return apiFetch(`/attributes/${editingAttr.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        return apiFetch('/attributes', { method: 'POST', body: JSON.stringify(payload) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      setModalOpen(false);
      resetForm();
      setFeedback({ type: 'success', text: 'Attribute definition saved successfully.' });
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', text: err.message || 'Failed to save attribute definition.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/attributes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      setFeedback({ type: 'success', text: 'Attribute definition deleted.' });
    },
  });

  const resetForm = () => {
    setEditingAttr(null);
    setCode('');
    setName('');
    setDescription('');
    setDataType('text');
    setIsRequired(false);
    setIsFilterable(true);
    setIsVariantParam(false);
    setOptionsStr('');
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (attr: any) => {
    setEditingAttr(attr);
    setCode(attr.code);
    setName(attr.name);
    setDescription(attr.description || '');
    setDataType(attr.dataType);
    setIsRequired(attr.isRequired);
    setIsFilterable(attr.isFilterable);
    setIsVariantParam(attr.isVariantParam);
    setOptionsStr((attr.options || []).join(', '));
    setModalOpen(true);
  };

  const handleSave = () => {
    const options = optionsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    saveMutation.mutate({
      code,
      name,
      description,
      dataType,
      isRequired,
      isFilterable,
      isVariantParam,
      options,
    });
  };

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink tracking-tight">Dynamic Attribute Definitions</h2>
          <p className="text-xs text-ink-secondary mt-0.5">Define structured specifications and variant parameters for products</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          <span>New Attribute</span>
        </Button>
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

      {/* Attributes Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-surface-border text-ink-secondary font-semibold uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Code</th>
                <th className="p-4">Data Type</th>
                <th className="p-4">Flags</th>
                <th className="p-4">Allowed Options</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {attributes.map((attr) => (
                <tr key={attr.id} className="hover:bg-surface-muted/60 transition-colors">
                  <td className="p-4 font-semibold text-ink">
                    {attr.name}
                    {attr.description && <p className="text-[10px] text-ink-muted font-normal mt-0.5">{attr.description}</p>}
                  </td>
                  <td className="p-4 font-mono text-ink-secondary">{attr.code}</td>
                  <td className="p-4 capitalize">
                    <Badge variant="neutral">{attr.dataType}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {attr.isRequired && <Badge variant="warning">Required</Badge>}
                      {attr.isVariantParam && <Badge variant="terracotta">Variant Param</Badge>}
                      {attr.isFilterable && <Badge variant="neutral">Filterable</Badge>}
                    </div>
                  </td>
                  <td className="p-4 text-ink-secondary">
                    {attr.options && attr.options.length > 0 ? (
                      <span className="truncate block max-w-xs">{attr.options.join(', ')}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Edit"
                        onClick={() => openEditModal(attr)}
                        className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => {
                          if (confirm(`Delete attribute '${attr.name}'?`)) {
                            deleteMutation.mutate(attr.id);
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
              {!isLoading && attributes.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-ink-muted">
                    <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 opacity-40 text-terracotta-500" />
                    <p className="font-semibold text-ink text-sm">No attribute definitions found</p>
                    <p className="text-xs text-ink-secondary mt-1">Create dynamic attributes for your product models.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAttr ? 'Edit Attribute Definition' : 'New Dynamic Attribute'}
        description="Machine-readable code cannot be modified after creation."
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Display Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. RAM Capacity (GB)"
              className="w-full p-2.5 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Machine Code *</label>
            <input
              type="text"
              required
              disabled={Boolean(editingAttr)}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. ram_gb"
              className="w-full p-2.5 font-mono text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Data Type</label>
            <select
              disabled={Boolean(editingAttr)}
              value={dataType}
              onChange={(e) => setDataType(e.target.value as any)}
              className="w-full p-2.5 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none disabled:opacity-60"
            >
              <option value="text">Text (String)</option>
              <option value="number">Number (Float/Integer)</option>
              <option value="boolean">Boolean (True/False)</option>
              <option value="select">Single Select (Enumeration)</option>
              <option value="multiselect">Multi-Select</option>
              <option value="date">Date (YYYY-MM-DD)</option>
            </select>
          </div>

          {(dataType === 'select' || dataType === 'multiselect') && (
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">Allowed Options (Comma-separated)</label>
              <input
                type="text"
                value={optionsStr}
                onChange={(e) => setOptionsStr(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
                className="w-full p-2.5 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Description / Help Text</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Helper text for catalog operators"
              className="w-full p-2.5 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-surface-border">
            <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="rounded text-terracotta-600 focus:ring-terracotta-500"
              />
              <span>Mandatory for Catalogue Publishing</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={isVariantParam}
                onChange={(e) => setIsVariantParam(e.target.checked)}
                className="rounded text-terracotta-600 focus:ring-terracotta-500"
              />
              <span>Eligible as Variant Parameter (e.g. Size, Color)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={isFilterable}
                onChange={(e) => setIsFilterable(e.target.checked)}
                className="rounded text-terracotta-600 focus:ring-terracotta-500"
              />
              <span>Filterable in Catalogue Table</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-surface-border">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!name.trim() || !code.trim()}>
              Save Attribute
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
