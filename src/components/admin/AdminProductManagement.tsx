import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Upload, 
  X, 
  AlertTriangle, 
  Star, 
  Tag, 
  Image as ImageIcon,
  Check,
  ArrowUp,
  ArrowDown,
  Filter,
  Package
} from 'lucide-react';
import { Product, Category } from '../../types.js';
import { formatBDT } from '../../lib/utils.js';
import { 
  saveProductApi, 
  deleteProductApi, 
  duplicateProductApi 
} from '../../lib/api.js';

interface AdminProductManagementProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminProductManagement: React.FC<AdminProductManagementProps> = ({
  products,
  categories,
  onRefresh,
  showToast
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

  // Edit / Add modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

  // New tag/size/color temporary inputs
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newColorInput, setNewColorInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.nameBn && p.nameBn.includes(search)) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || 
      p.categoryId === categoryFilter || 
      p.categorySlug === categoryFilter;

    const matchesStock = 
      stockFilter === 'ALL' ? true :
      stockFilter === 'OUT' ? p.stock === 0 :
      stockFilter === 'LOW' ? p.stock > 0 && p.stock <= 5 :
      p.stock > 5;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleOpenAdd = () => {
    setEditingProduct({
      name: '',
      nameBn: '',
      slug: '',
      sku: `LN-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: categories[0]?.id || '',
      categorySlug: categories[0]?.slug || '',
      categoryName: categories[0]?.name || '',
      price: 2500,
      salePrice: undefined,
      stock: 15,
      description: '',
      descriptionBn: '',
      fabric: 'Pure Cotton / Lawn',
      details: ['Authentic Dhaka Craftsmanship', 'Dry clean or gentle hand wash'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Navy Blue', 'Maroon'],
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80'
      ],
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      isTrending: false,
      isOnSale: false,
      tags: ['New', 'Collection 2026']
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setModalOpen(true);
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const duplicated = await duplicateProductApi(product.id);
      showToast(`Duplicated "${product.name}" as "${duplicated.name}"`);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to duplicate product', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProductApi(productToDelete.id);
      showToast(`Product "${productToDelete.name}" deleted successfully.`);
      setProductToDelete(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.sku) {
      showToast('Name and SKU are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const cat = categories.find(c => c.id === editingProduct.categoryId || c.slug === editingProduct.categorySlug);
      const payload = {
        ...editingProduct,
        categoryName: cat?.name || editingProduct.categoryName || 'Fashion',
        categorySlug: cat?.slug || editingProduct.categorySlug || 'fashion',
        categoryId: cat?.id || editingProduct.categoryId,
        price: Number(editingProduct.price),
        salePrice: editingProduct.salePrice ? Number(editingProduct.salePrice) : undefined,
        stock: Number(editingProduct.stock || 0)
      };

      await saveProductApi(payload, editingProduct.id);
      showToast(editingProduct.id ? 'Product updated successfully' : 'Product created successfully');
      setModalOpen(false);
      setEditingProduct(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Image Upload helper (supports device camera or gallery file picker)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (typeof uploadEvent.target?.result === 'string') {
          const base64 = uploadEvent.target.result;
          setEditingProduct(prev => prev ? {
            ...prev,
            images: [...(prev.images || []), base64]
          } : null);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setEditingProduct(prev => prev ? {
      ...prev,
      images: [...(prev.images || []), imageUrlInput.trim()]
    } : null);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setEditingProduct(prev => {
      if (!prev || !prev.images) return prev;
      const imgs = [...prev.images];
      imgs.splice(index, 1);
      return { ...prev, images: imgs };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setEditingProduct(prev => {
      if (!prev || !prev.images || index === 0) return prev;
      const imgs = [...prev.images];
      const selected = imgs.splice(index, 1)[0];
      imgs.unshift(selected);
      return { ...prev, images: imgs };
    });
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setEditingProduct(prev => {
      if (!prev || !prev.images) return prev;
      const imgs = [...prev.images];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= imgs.length) return prev;
      const temp = imgs[index];
      imgs[index] = imgs[targetIndex];
      imgs[targetIndex] = temp;
      return { ...prev, images: imgs };
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900">
            Product Management ({products.length})
          </h2>
          <p className="text-xs text-stone-500">
            Create, duplicate, manage pricing, stock, images & sales tags
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, SKU, category..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN">In Stock (&gt;5)</option>
            <option value="LOW">Low Stock (1-5)</option>
            <option value="OUT">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Product List (Responsive Cards for mobile, clean rows for desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const isOutOfStock = p.stock === 0;
          const isLowStock = p.stock > 0 && p.stock <= 5;

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-amber-300 transition-colors"
            >
              <div>
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                    {p.isNewArrival && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-stone-900 text-white">NEW</span>
                    )}
                    {p.isBestSeller && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-stone-950">BEST SELLER</span>
                    )}
                    {p.isOnSale && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white">SALE</span>
                    )}
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                      isOutOfStock ? 'bg-red-600 text-white' :
                      isLowStock ? 'bg-amber-500 text-stone-950' :
                      'bg-emerald-600 text-white'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low: ${p.stock}` : `Stock: ${p.stock}`}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-mono">{p.sku}</span>
                    <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{p.categoryName}</span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 line-clamp-1">{p.name}</h3>

                  <div className="flex items-baseline gap-2">
                    {p.salePrice ? (
                      <>
                        <span className="text-sm font-bold text-stone-900">{formatBDT(p.salePrice)}</span>
                        <span className="text-xs text-stone-400 line-through">{formatBDT(p.price)}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-stone-900">{formatBDT(p.price)}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.sizes?.map((sz, i) => (
                      <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Controls */}
              <div className="p-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between gap-1">
                <button
                  onClick={() => handleDuplicate(p)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-white hover:text-stone-900 border border-transparent hover:border-stone-200 transition-colors flex items-center gap-1"
                  title="Duplicate Product"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Duplicate</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-stone-600 hover:text-amber-600 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-colors"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setProductToDelete(p)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {modalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 font-serif-luxury">
                {editingProduct.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Product Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Product Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Meher Swiss Lawn Embroidered 3-Piece"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Product Title (বাংলা)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.nameBn || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, nameBn: e.target.value }))}
                    placeholder="e.g. মেহের সুইস লন এমব্রয়ডারি থ্রি-পিস"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-bangla focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SKU & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.categoryId || ''}
                    onChange={(e) => {
                      const selected = categories.find(c => c.id === e.target.value);
                      if (selected) {
                        setEditingProduct(prev => ({
                          ...prev,
                          categoryId: selected.id,
                          categorySlug: selected.slug,
                          categoryName: selected.name
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, Sale Price, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Regular Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Sale / Discount Price (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.salePrice ?? ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, salePrice: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Optional discount price"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Inventory Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.stock ?? ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Status Labels */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Product Badges & Visibility
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 text-xs cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isNewArrival}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, isNewArrival: e.target.checked }))}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 text-xs cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isBestSeller}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, isBestSeller: e.target.checked }))}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 text-xs cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isTrending}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, isTrending: e.target.checked }))}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Trending</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 text-xs cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isFeatured}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Featured</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 text-xs cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isOnSale}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, isOnSale: e.target.checked }))}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>On Sale</span>
                  </label>
                </div>
              </div>

              {/* IMAGE MANAGEMENT (MULTIPLE IMAGES, PREVIEWS, REORDER, PRIMARY) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Product Images ({editingProduct.images?.length || 0})
                </label>
                <div className="space-y-3">
                  {/* Upload Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>Upload Photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1 flex items-center gap-2 min-w-[240px]">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="Or paste image URL..."
                        className="flex-1 px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3 py-2 bg-stone-800 text-white rounded-xl text-xs font-semibold hover:bg-stone-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Images Preview Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {editingProduct.images?.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl border border-stone-200 overflow-hidden bg-stone-100 aspect-square"
                      >
                        <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                        
                        {/* Primary Badge */}
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-amber-500 text-stone-950 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            Primary
                          </span>
                        )}

                        {/* Image Actions Overlay */}
                        <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 text-white">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 bg-red-600 rounded hover:bg-red-500 text-white"
                              title="Delete Image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="px-1.5 py-0.5 bg-amber-500 text-stone-950 rounded font-semibold"
                              >
                                Set Primary
                              </button>
                            )}

                            <div className="flex items-center gap-1 ml-auto">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, 'up')}
                                  className="p-1 bg-stone-800 rounded hover:bg-stone-700"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                              )}
                              {idx < (editingProduct.images?.length || 0) - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, 'down')}
                                  className="p-1 bg-stone-800 rounded hover:bg-stone-700"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sizes, Colors, Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sizes */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Sizes</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {editingProduct.sizes?.map((s, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-100 text-xs text-stone-700">
                        {s}
                        <button
                          type="button"
                          onClick={() => {
                            const arr = [...(editingProduct.sizes || [])];
                            arr.splice(idx, 1);
                            setEditingProduct(prev => ({ ...prev, sizes: arr }));
                          }}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSizeInput}
                      onChange={(e) => setNewSizeInput(e.target.value)}
                      placeholder="e.g. 38, 40, Free Size"
                      className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSizeInput.trim()) {
                          setEditingProduct(prev => ({
                            ...prev,
                            sizes: [...(prev?.sizes || []), newSizeInput.trim()]
                          }));
                          setNewSizeInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-xs font-semibold rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Colors</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {editingProduct.colors?.map((c, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-100 text-xs text-stone-700">
                        {c}
                        <button
                          type="button"
                          onClick={() => {
                            const arr = [...(editingProduct.colors || [])];
                            arr.splice(idx, 1);
                            setEditingProduct(prev => ({ ...prev, colors: arr }));
                          }}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newColorInput}
                      onChange={(e) => setNewColorInput(e.target.value)}
                      placeholder="e.g. Royal Blue, Crimson"
                      className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newColorInput.trim()) {
                          setEditingProduct(prev => ({
                            ...prev,
                            colors: [...(prev?.colors || []), newColorInput.trim()]
                          }));
                          setNewColorInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-xs font-semibold rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed dress description, embroidery, neckline, dupatta length..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
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
                  {saving ? 'Saving...' : editingProduct.id ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFIED PRODUCT DELETE CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-stone-900">
                Delete Product?
              </h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                <img
                  src={productToDelete.images?.[0] || ''}
                  alt={productToDelete.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate">{productToDelete.name}</p>
                <p className="text-[11px] text-stone-500">{productToDelete.sku} • {formatBDT(productToDelete.price)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
