import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  Percent,
  DollarSign
} from 'lucide-react';
import { Coupon } from '../../types.js';
import { formatBDT } from '../../lib/utils.js';
import { saveCouponApi, deleteCouponApi } from '../../lib/api.js';

interface AdminCouponManagementProps {
  coupons: Coupon[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminCouponManagement: React.FC<AdminCouponManagementProps> = ({
  coupons,
  onRefresh,
  showToast
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingCoupon({
      code: '',
      type: 'PERCENTAGE',
      discount: 10,
      minOrder: 1500,
      maxDiscount: 500,
      isActive: true,
      description: 'Promotional discount on women fashion',
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10)
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon({
      ...c,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : ''
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      await saveCouponApi({ isActive: !c.isActive }, c.id);
      showToast(`Coupon ${c.code} is now ${!c.isActive ? 'Active' : 'Disabled'}`);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update coupon', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteCouponApi(id);
      showToast('Coupon deleted successfully');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon?.code) {
      showToast('Coupon code is required', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveCouponApi({
        ...editingCoupon,
        code: editingCoupon.code.toUpperCase().trim(),
        discount: Number(editingCoupon.discount),
        minOrder: Number(editingCoupon.minOrder || 0),
        maxDiscount: editingCoupon.maxDiscount ? Number(editingCoupon.maxDiscount) : undefined
      }, editingCoupon.id);

      showToast(editingCoupon.id ? 'Coupon updated' : 'Coupon created');
      setModalOpen(false);
      setEditingCoupon(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900">
            Coupon & Discount Management ({coupons.length})
          </h2>
          <p className="text-xs text-stone-500">
            Configure promotional promo codes, cart thresholds and maximum discount ceilings
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons List (Mobile-first responsive cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
              c.isActive ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg tracking-wider">
                  {c.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                }`}>
                  {c.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div>
                <p className="text-base font-bold text-stone-900">
                  {c.type === 'PERCENTAGE' ? `${c.discount}% OFF` : `৳${c.discount} Flat Discount`}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{c.description || 'Promotional coupon'}</p>
              </div>

              <div className="pt-2 text-xs text-stone-600 space-y-1">
                <p>• Min Order: <strong>{formatBDT(c.minOrder)}</strong></p>
                {c.maxDiscount && (
                  <p>• Max Discount Cap: <strong>{formatBDT(c.maxDiscount)}</strong></p>
                )}
                <p>• Times Redeemed: <strong>{c.timesUsed || 0} times</strong></p>
                {c.expiresAt && (
                  <p className="text-[11px] text-stone-400">
                    Expires: {new Date(c.expiresAt).toLocaleDateString('en-GB')}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => handleToggleActive(c)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
                  c.isActive ? 'text-stone-600 hover:bg-stone-100' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {c.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{c.isActive ? 'Disable' : 'Enable'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                  title="Edit Coupon"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 font-serif-luxury">
                {editingCoupon.id ? 'Edit Coupon' : 'Create Coupon'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code || ''}
                  onChange={(e) => setEditingCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. EID2026, LUNARA10"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={editingCoupon.type || 'PERCENTAGE'}
                    onChange={(e) => setEditingCoupon(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingCoupon.discount ?? ''}
                    onChange={(e) => setEditingCoupon(prev => ({ ...prev, discount: Number(e.target.value) }))}
                    placeholder={editingCoupon.type === 'PERCENTAGE' ? '10' : '200'}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Minimum Order (৳) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingCoupon.minOrder ?? ''}
                    onChange={(e) => setEditingCoupon(prev => ({ ...prev, minOrder: Number(e.target.value) }))}
                    placeholder="1500"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Max Discount Cap (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingCoupon.maxDiscount ?? ''}
                    onChange={(e) => setEditingCoupon(prev => ({ ...prev, maxDiscount: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Optional max cap"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editingCoupon.expiry || ''}
                  onChange={(e) => setEditingCoupon(prev => ({ ...prev, expiry: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCoupon.isActive !== false}
                    onChange={(e) => setEditingCoupon(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Activate Coupon Immediately</span>
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
                  {saving ? 'Saving...' : editingCoupon.id ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
