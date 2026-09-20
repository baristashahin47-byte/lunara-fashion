import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Layers, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Upload,
  ArrowUpDown,
  Search
} from 'lucide-react';
import { Category } from '../../types.js';
import { 
  createCategoryApi, 
  updateCategoryApi, 
  deleteCategoryApi, 
  toggleCategoryApi 
} from '../../lib/api.js';

interface AdminCategoryManagementProps {
  categories: Category[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminCategoryManagement: React.FC<AdminCategoryManagementProps> = ({
  categories,
  onRefresh,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.nameBn && c.nameBn.includes(searchQuery)) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCategory({
      name: '',
      nameBn: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      featured: false,
      isActive: true,
      displayOrder: categories.length + 1
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory({ ...category });
    setModalOpen(true);
  };

  const handleSlugify = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      showToast('Category name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const slug = editingCategory.slug || handleSlugify(editingCategory.name);
      const payload = {
        ...editingCategory,
        slug
      };

      if (editingCategory.id) {
        await updateCategoryApi(editingCategory.id, payload);
        showToast('Category updated successfully');
      } else {
        await createCategoryApi(payload);
        showToast('Category created successfully');
      }

      setModalOpen(false);
      setEditingCategory(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await toggleCategoryApi(category.id);
      showToast(`Category ${category.isActive ? 'disabled' : 'enabled'} successfully`);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle category', 'error');
    }
  };

  const handleConfirmDelete = async (force = false) => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteWarning(null);

    try {
      const res = await deleteCategoryApi(deleteTarget.id, force);
      if (res.success) {
        showToast('Category deleted successfully');
        setDeleteTarget(null);
        onRefresh();
      }
    } catch (err: any) {
      setDeleteWarning(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Image file upload handler (converts to base64)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (typeof uploadEvent.target?.result === 'string') {
        setEditingCategory(prev => prev ? { ...prev, image: uploadEvent.target?.result as string } : null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900">
            Category Management ({categories.length})
          </h2>
          <p className="text-xs text-stone-500">
            Manage product collections, hero images, and storefront visibility
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search category by name or slug..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Category Cards (Mobile First Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const isActive = cat.isActive !== false;
          return (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all shadow-xs ${
                isActive ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50/70'
              }`}
            >
              <div className="relative h-36 bg-stone-100 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? 'bg-emerald-500 text-white' : 'bg-stone-600 text-white'
                  }`}>
                    {isActive ? 'Active' : 'Disabled'}
                  </span>
                  {cat.featured && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-stone-950">
                      Featured
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-sm font-bold">{cat.name}</h3>
                  <p className="text-xs text-amber-300 font-bangla">{cat.nameBn || cat.name}</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Slug: <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] text-stone-800">{cat.slug}</code></span>
                  <span className="font-semibold text-stone-700">{cat.itemCount || 0} products</span>
                </div>

                {cat.description && (
                  <p className="text-xs text-stone-600 line-clamp-2">
                    {cat.description}
                  </p>
                )}

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isActive 
                        ? 'text-stone-600 hover:bg-stone-100' 
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                    title={isActive ? 'Disable Category' : 'Enable Category'}
                  >
                    {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isActive ? 'Disable' : 'Enable'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(cat);
                        setDeleteWarning(null);
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {modalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 font-serif-luxury">
                {editingCategory.id ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingCategory(prev => ({
                      ...prev,
                      name,
                      slug: prev?.id ? prev.slug : handleSlugify(name)
                    }));
                  }}
                  placeholder="e.g. 3 Piece, Abaya, Saree"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Category Name (বাংলা)
                </label>
                <input
                  type="text"
                  value={editingCategory.nameBn || ''}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, nameBn: e.target.value }))}
                  placeholder="e.g. থ্রি-পিস, আবায়া, শাড়ি"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-bangla focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, slug: handleSlugify(e.target.value) }))}
                  placeholder="e.g. three-piece, abaya"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Banner Image URL / Upload
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={editingCategory.image || ''}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50">
                      <Upload className="w-3.5 h-3.5 text-stone-500" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    {editingCategory.image && (
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                        <img src={editingCategory.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description for category banner..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={editingCategory.isActive !== false}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Active & Visible</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={!!editingCategory.featured}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Featured Collection</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCategory.id ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL WITH WARNING */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-stone-900">
                Delete Category "{deleteTarget.name}"?
              </h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to remove this category from the store catalog?
              </p>
            </div>

            {deleteWarning ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <p className="font-semibold">{deleteWarning}</p>
                <p className="text-[11px] text-amber-800">
                  Do you want to force delete this category anyway?
                </p>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(true)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-500"
                  >
                    Force Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleConfirmDelete(false)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isDeleting ? 'Checking...' : 'Delete Category'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
