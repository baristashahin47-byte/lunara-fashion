import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Store, 
  Truck, 
  Share2, 
  Upload, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';
import { StoreSettings } from '../../types.js';
import { updateStoreSettingsApi } from '../../lib/api.js';

interface AdminStoreSettingsProps {
  settings: StoreSettings;
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminStoreSettings: React.FC<AdminStoreSettingsProps> = ({
  settings: initialSettings,
  onRefresh,
  showToast
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...initialSettings });
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (typeof uploadEvent.target?.result === 'string') {
        setFormData(prev => ({ ...prev, logo: uploadEvent.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStoreSettingsApi({
        ...formData,
        deliveryCharges: {
          dhakaCity: Number(formData.deliveryCharges?.dhakaCity || 70),
          subDhaka: Number(formData.deliveryCharges?.subDhaka || 100),
          outsideDhaka: Number(formData.deliveryCharges?.outsideDhaka || 130)
        },
        lowStockThreshold: Number(formData.lowStockThreshold || 5)
      });
      showToast('Store settings saved successfully');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            <span>Store Configuration & Settings</span>
          </h2>
          <p className="text-xs text-stone-500">
            Manage brand profile, delivery logistics rates, customer support & social links
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Store Profile */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Store className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900">Brand Profile & Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Brand Name (English) *</label>
              <input
                type="text"
                required
                value={formData.brandName || ''}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Tagline (English)</label>
              <input
                type="text"
                value={formData.brandTagline || ''}
                onChange={(e) => setFormData({ ...formData, brandTagline: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700">Store Logo URL / Device Upload</label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="url"
                value={formData.logo || ''}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://..."
                className="w-full sm:flex-1 px-3 py-2 text-xs border border-stone-200 rounded-xl"
              />
              <label className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50">
                <Upload className="w-3.5 h-3.5 text-stone-500" />
                <span>Upload Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Customer Support Phone</label>
              <input
                type="text"
                value={formData.supportPhone || ''}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Official Support Email</label>
              <input
                type="email"
                value={formData.supportEmail || ''}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Showroom Address (Dhaka)</label>
            <input
              type="text"
              value={formData.showroomAddress || ''}
              onChange={(e) => setFormData({ ...formData, showroomAddress: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
            />
          </div>
        </div>

        {/* Delivery Logistics & Thresholds */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Truck className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900">Delivery Logistics & Rates</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Dhaka City Charge (৳)</label>
              <input
                type="number"
                value={formData.deliveryCharges?.dhakaCity ?? 70}
                onChange={(e) => setFormData({
                  ...formData,
                  deliveryCharges: { ...formData.deliveryCharges, dhakaCity: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Sub-Dhaka Charge (৳)</label>
              <input
                type="number"
                value={formData.deliveryCharges?.subDhaka ?? 100}
                onChange={(e) => setFormData({
                  ...formData,
                  deliveryCharges: { ...formData.deliveryCharges, subDhaka: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Outside Dhaka Charge (৳)</label>
              <input
                type="number"
                value={formData.deliveryCharges?.outsideDhaka ?? 130}
                onChange={(e) => setFormData({
                  ...formData,
                  deliveryCharges: { ...formData.deliveryCharges, outsideDhaka: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Low Stock Warning Threshold (Quantity)</label>
            <input
              type="number"
              value={formData.lowStockThreshold ?? 5}
              onChange={(e) => setFormData({
                ...formData,
                lowStockThreshold: Number(e.target.value)
              })}
              className="w-full sm:w-1/3 px-3 py-2 text-xs border border-stone-200 rounded-xl"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Share2 className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900">Social Media Handles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Facebook Page URL</label>
              <input
                type="text"
                value={formData.socialLinks?.facebook || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                })}
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Instagram Handle</label>
              <input
                type="text"
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                })}
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">WhatsApp Hotline</label>
              <input
                type="text"
                value={formData.socialLinks?.whatsapp || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, whatsapp: e.target.value }
                })}
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">YouTube Channel</label>
              <input
                type="text"
                value={formData.socialLinks?.youtube || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                })}
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
