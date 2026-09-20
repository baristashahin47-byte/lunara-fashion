import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Save, 
  Plus, 
  X,
  Package,
  Calendar,
  Percent
} from 'lucide-react';
import { Product, FlashSale } from '../../types.js';
import { fetchFlashSale, updateFlashSaleApi } from '../../lib/api.js';
import { formatBDT } from '../../lib/utils.js';

interface AdminFlashSaleManagementProps {
  products: Product[];
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminFlashSaleManagement: React.FC<AdminFlashSaleManagementProps> = ({
  products,
  showToast
}) => {
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Time remaining preview state
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const fs = await fetchFlashSale();
      setFlashSale(fs);
    } catch (err: any) {
      showToast(err.message || 'Failed to load flash sale', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update live countdown timer
  useEffect(() => {
    if (!flashSale?.endTime) return;

    const interval = setInterval(() => {
      const end = new Date(flashSale.endTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [flashSale?.endTime]);

  const handleToggleProduct = (productId: string) => {
    if (!flashSale) return;
    const current = flashSale.productIds || [];
    const exists = current.includes(productId);
    const updated = exists ? current.filter(id => id !== productId) : [...current, productId];
    setFlashSale({ ...flashSale, productIds: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashSale) return;
    setSaving(true);
    try {
      const updated = await updateFlashSaleApi(flashSale);
      setFlashSale(updated);
      showToast('Flash Sale settings saved successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to save flash sale', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !flashSale) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const selectedProducts = products.filter(p => flashSale.productIds?.includes(p.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Flash Sale & Limited Offers</span>
          </h2>
          <p className="text-xs text-stone-500">
            Schedule countdown discounts, special holiday campaigns & live homepage flash banners
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
            flashSale.isActive 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-stone-100 text-stone-600 border-stone-200'
          }`}>
            {flashSale.isActive ? '⚡ FLASH SALE ACTIVE' : 'DISABLED'}
          </span>
        </div>
      </div>

      {/* Countdown Preview Bar */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">Live Customer Countdown Preview</span>
          <h3 className="text-base font-bold text-white mt-1">{flashSale.title}</h3>
          <p className="text-xs text-amber-200 font-bangla">{flashSale.titleBn}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-stone-950/80 px-3 py-2 rounded-xl text-center min-w-[50px] border border-stone-700">
            <span className="text-lg font-bold font-mono text-amber-400">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[9px] text-stone-400 block uppercase">Hours</span>
          </div>
          <span className="text-stone-500 font-bold">:</span>
          <div className="bg-stone-950/80 px-3 py-2 rounded-xl text-center min-w-[50px] border border-stone-700">
            <span className="text-lg font-bold font-mono text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[9px] text-stone-400 block uppercase">Mins</span>
          </div>
          <span className="text-stone-500 font-bold">:</span>
          <div className="bg-stone-950/80 px-3 py-2 rounded-xl text-center min-w-[50px] border border-stone-700">
            <span className="text-lg font-bold font-mono text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[9px] text-stone-400 block uppercase">Secs</span>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="text-sm font-bold text-stone-900">Campaign Configuration</h3>
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={flashSale.isActive}
              onChange={(e) => setFlashSale({ ...flashSale, isActive: e.target.checked })}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            <span>Activate Flash Sale on Storefront</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Campaign Title (English) *
            </label>
            <input
              type="text"
              required
              value={flashSale.title}
              onChange={(e) => setFlashSale({ ...flashSale, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Campaign Title (বাংলা)
            </label>
            <input
              type="text"
              value={flashSale.titleBn}
              onChange={(e) => setFlashSale({ ...flashSale, titleBn: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-bangla focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Global Flash Discount (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={90}
                required
                value={flashSale.discountPercentage}
                onChange={(e) => setFlashSale({ ...flashSale, discountPercentage: Number(e.target.value) })}
                className="w-full pl-8 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <Percent className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={flashSale.startTime ? flashSale.startTime.slice(0, 16) : ''}
              onChange={(e) => setFlashSale({ ...flashSale, startTime: new Date(e.target.value).toISOString() })}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={flashSale.endTime ? flashSale.endTime.slice(0, 16) : ''}
              onChange={(e) => setFlashSale({ ...flashSale, endTime: new Date(e.target.value).toISOString() })}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Participating Products Selection */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
            Select Participating Dresses & Ensembles ({flashSale.productIds?.length || 0} selected)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1 border border-stone-200 rounded-xl">
            {products.map((p) => {
              const isSelected = flashSale.productIds?.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => handleToggleProduct(p.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-amber-50 border-amber-400 text-amber-950' 
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 flex-shrink-0"
                  />
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{p.name}</p>
                    <p className="text-[11px] text-stone-500">
                      {p.sku} • {formatBDT(p.price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Campaign...' : 'Save Flash Sale Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
