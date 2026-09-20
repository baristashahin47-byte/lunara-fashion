import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Minus, 
  Save, 
  Sliders,
  RefreshCw
} from 'lucide-react';
import { fetchAdminInventory, updateAdminInventoryStock } from '../../lib/api.js';
import { formatBDT } from '../../lib/utils.js';

interface AdminInventoryManagementProps {
  threshold: number;
  onUpdateThreshold: (newThreshold: number) => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminInventoryManagement: React.FC<AdminInventoryManagementProps> = ({
  threshold,
  onUpdateThreshold,
  showToast
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentThreshold, setCurrentThreshold] = useState(threshold || 5);
  const [editingStocks, setEditingStocks] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadInventory = async (thresh?: number) => {
    setLoading(true);
    try {
      const data = await fetchAdminInventory(thresh ?? currentThreshold);
      setItems(data);
      const stockMap: Record<string, number> = {};
      data.forEach(d => {
        stockMap[d.id] = d.stock;
      });
      setEditingStocks(stockMap);
    } catch (err: any) {
      showToast(err.message || 'Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory(threshold);
  }, [threshold]);

  const handleStockDelta = (id: string, delta: number) => {
    setEditingStocks(prev => {
      const curr = prev[id] !== undefined ? prev[id] : 0;
      const next = Math.max(0, curr + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleSaveStock = async (id: string) => {
    const val = editingStocks[id];
    if (val === undefined) return;
    setSavingId(id);
    try {
      await updateAdminInventoryStock(id, val);
      showToast('Inventory stock count updated');
      loadInventory();
    } catch (err: any) {
      showToast(err.message || 'Failed to update stock', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleThresholdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateThreshold(Number(currentThreshold));
    loadInventory(Number(currentThreshold));
    showToast(`Low stock warning threshold set to ${currentThreshold} units`);
  };

  const filteredItems = items.filter(item => {
    const q = search.toLowerCase().trim();
    const matchesSearch = 
      item.name.toLowerCase().includes(q) ||
      (item.nameBn && item.nameBn.includes(q)) ||
      item.sku.toLowerCase().includes(q) ||
      item.categoryName.toLowerCase().includes(q);

    const matchesStatus = 
      statusFilter === 'ALL' || 
      item.stockStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const lowStockCount = items.filter(i => i.stockStatus === 'LOW_STOCK').length;
  const outOfStockCount = items.filter(i => i.stockStatus === 'OUT_OF_STOCK').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900">
            Inventory & Stock Tracking ({items.length})
          </h2>
          <p className="text-xs text-stone-500">
            Real-time SKU quantities, restock alerts and rapid mobile inventory adjustments
          </p>
        </div>

        {/* Low Stock Threshold Config */}
        <form onSubmit={handleThresholdSubmit} className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-600 whitespace-nowrap">
            Low Stock Threshold:
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={currentThreshold}
            onChange={(e) => setCurrentThreshold(Number(e.target.value))}
            className="w-16 px-2.5 py-1.5 text-xs font-bold text-center border border-stone-300 rounded-xl bg-stone-50"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase">Total Catalog SKUs</span>
          <p className="text-xl font-bold text-stone-900 mt-1">{items.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 uppercase">In Stock</span>
          <p className="text-xl font-bold text-emerald-900 mt-1">{items.length - lowStockCount - outOfStockCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-800 uppercase">Low Stock (≤ {currentThreshold})</span>
          <p className="text-xl font-bold text-amber-900 mt-1">{lowStockCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 shadow-xs">
          <span className="text-xs font-semibold text-red-800 uppercase">Out of Stock (0)</span>
          <p className="text-xl font-bold text-red-900 mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or dress title..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="ALL">All Statuses ({items.length})</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock Alert</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Items List (Mobile-friendly direct rapid editor) */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isModified = editingStocks[item.id] !== item.stock;
          const status = item.stockStatus;

          return (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Product Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-stone-500">{item.sku}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-800' :
                      status === 'LOW_STOCK' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {status === 'OUT_OF_STOCK' ? 'Out of Stock' :
                       status === 'LOW_STOCK' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 truncate">{item.name}</h3>
                  <p className="text-[11px] text-stone-500">
                    {item.categoryName} • Price: {formatBDT(item.salePrice || item.price)}
                  </p>
                </div>
              </div>

              {/* Rapid Stock Stepper Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleStockDelta(item.id, -1)}
                    className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition-transform"
                    title="Decrease Stock"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    min={0}
                    value={editingStocks[item.id] ?? item.stock}
                    onChange={(e) => setEditingStocks(prev => ({ ...prev, [item.id]: Math.max(0, Number(e.target.value)) }))}
                    className="w-14 text-center font-bold text-sm bg-transparent border-none focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleStockDelta(item.id, 1)}
                    className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition-transform"
                    title="Increase Stock"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={savingId === item.id || !isModified}
                  onClick={() => handleSaveStock(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isModified
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs cursor-pointer'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingId === item.id ? 'Saving...' : 'Update'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
