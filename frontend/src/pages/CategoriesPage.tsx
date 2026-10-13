import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api/client';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Layers, Plus, Edit, Trash2 } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [wooCategoryId, setWooCategoryId] = useState<string>('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<any[]>('/categories'),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingCat) {
        return apiFetch(`/categories/${editingCat.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        return apiFetch('/categories', { method: 'POST', body: JSON.stringify(payload) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const resetForm = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setParentId('');
    setWooCategoryId('');
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setParentId(cat.parentId || '');
    setWooCategoryId(cat.wooCategoryId ? String(cat.wooCategoryId) : '');
    setModalOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      name,
      description,
      parentId: parentId || null,
      wooCategoryId: wooCategoryId ? parseInt(wooCategoryId, 10) : null,
    });
  };

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink tracking-tight">Product Categories & Taxonomy</h2>
          <p className="text-xs text-ink-secondary mt-0.5">Organize product hierarchy and WooCommerce channel category mappings</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-surface-border text-ink-secondary font-semibold uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="p-4">Category Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Parent Category</th>
                <th className="p-4">WooCommerce Category ID</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {categories.map((cat) => {
                const parent = categories.find((c) => c.id === cat.parentId);
                return (
                  <tr key={cat.id} className="hover:bg-surface-muted/60 transition-colors">
                    <td className="p-4 font-semibold text-ink">
                      {cat.name}
                      {cat.description && <p className="text-[10px] text-ink-muted font-normal mt-0.5">{cat.description}</p>}
                    </td>
                    <td className="p-4 font-mono text-ink-secondary">{cat.slug}</td>
                    <td className="p-4 text-ink-secondary">{parent ? parent.name : '— (Root Level)'}</td>
                    <td className="p-4 font-mono text-ink-secondary">
                      {cat.wooCategoryId ? `#${cat.wooCategoryId}` : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Edit"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => {
                            if (confirm(`Delete category '${cat.name}'?`)) {
                              deleteMutation.mutate(cat.id);
                            }
                          }}
                          className="p-1.5 text-ink-muted hover:text-danger hover:bg-danger-subtle rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-ink-muted">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-terracotta-500" />
                    <p className="font-semibold text-ink text-sm">No categories defined yet</p>
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
        title={editingCat ? 'Edit Category' : 'Create Category'}
        description="Configure taxonomy and external WooCommerce category binding"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Laptops & Computers"
              className="w-full p-2.5 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Parent Category</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full p-2.5 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="">— None (Top Level) —</option>
              {categories
                .filter((c) => !editingCat || c.id !== editingCat.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">WooCommerce Category ID</label>
            <input
              type="number"
              value={wooCategoryId}
              onChange={(e) => setWooCategoryId(e.target.value)}
              placeholder="e.g. 102"
              className="w-full p-2.5 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category overview..."
              className="w-full p-2.5 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-surface-border">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!name.trim()}>
              Save Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
