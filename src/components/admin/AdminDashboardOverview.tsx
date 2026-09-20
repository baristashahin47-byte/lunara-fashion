import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  ArrowUpRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { formatBDT } from '../../lib/utils.js';
import { Order } from '../../types.js';

interface AdminDashboardOverviewProps {
  stats: any;
  onNavigateTab: (tab: any) => void;
  onSelectOrder: (order: Order) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  stats,
  onNavigateTab,
  onSelectOrder
}) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Maximum value for SVG scaling
  const maxDailySales = Math.max(...(stats.dailySales?.map((d: any) => d.sales) || [1]), 1000);
  const maxMonthlySales = Math.max(...(stats.monthlySales?.map((m: any) => m.sales) || [1]), 5000);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. SALES HERO METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-stone-900 tracking-tight">
              {formatBDT(stats.totalSales || 0)}
            </h3>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">All completed</span> customer orders
            </p>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Today's Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-stone-900 tracking-tight">
              {formatBDT(stats.todaySales || 0)}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Live updates for {new Date().toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>

        {/* This Month's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">This Month's Sales</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-stone-900 tracking-tight">
              {formatBDT(stats.thisMonthSales || 0)}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Month to date revenue
            </p>
          </div>
        </div>
      </div>

      {/* 2. ORDER STATUS TILES */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Orders Overview</h4>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
          >
            <span>View All ({stats.totalOrders})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-left hover:bg-amber-100/60 transition-colors"
          >
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-xs font-semibold">Pending</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-stone-900">{stats.pendingOrders || 0}</p>
          </button>

          <button
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-left hover:bg-blue-100/60 transition-colors"
          >
            <div className="flex items-center justify-between text-blue-700 mb-1">
              <span className="text-xs font-semibold">Confirmed</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-stone-900">{stats.confirmedOrders || 0}</p>
          </button>

          <button
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/70 text-left hover:bg-indigo-100/60 transition-colors"
          >
            <div className="flex items-center justify-between text-indigo-700 mb-1">
              <span className="text-xs font-semibold">Processing</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-stone-900">{stats.processingOrders || 0}</p>
          </button>

          <button
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/70 text-left hover:bg-sky-100/60 transition-colors"
          >
            <div className="flex items-center justify-between text-sky-700 mb-1">
              <span className="text-xs font-semibold">Shipped</span>
              <Truck className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-stone-900">{stats.shippedOrders || 0}</p>
          </button>

          <button
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-left hover:bg-emerald-100/60 transition-colors"
          >
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-xs font-semibold">Delivered</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-stone-900">{stats.deliveredOrders || 0}</p>
          </button>

          <button
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/70 text-left hover:bg-rose-100/60 transition-colors"
          >
            <div className="flex items-center justify-between text-rose-700 mb-1">
              <span className="text-xs font-semibold">Cancelled</span>
              <XCircle className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-stone-900">{stats.cancelledOrders || 0}</p>
          </button>
        </div>
      </div>

      {/* 3. STORE INVENTORY & CUSTOMERS COUNT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigateTab('customers')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase">Registered Customers</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{stats.totalCustomers || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('products')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase">Catalog Products</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{stats.totalProducts || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">{stats.lowStockCount || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. CHARTS: DAILY SALES & MONTHLY REVENUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-stone-900">Daily Sales (Last 7 Days)</h4>
              <p className="text-xs text-stone-500">Revenue per day across Bangladesh</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
              BDT (৳)
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2">
            {stats.dailySales?.map((day: any, idx: number) => {
              const heightPercent = Math.max(8, Math.round((day.sales / maxDailySales) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <span className="px-2 py-1 bg-stone-900 text-white text-[10px] font-semibold rounded-md shadow-md whitespace-nowrap">
                      ৳{day.sales.toLocaleString()} ({day.orders} ord)
                    </span>
                    <div className="w-1.5 h-1.5 bg-stone-900 rotate-45 -mt-0.5"></div>
                  </div>

                  <div className="w-full bg-stone-100 rounded-t-lg relative flex items-end h-36 overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-amber-500 group-hover:bg-amber-600 transition-all rounded-t-md"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium mt-2 truncate w-full text-center">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Revenue Progression */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-stone-900">Monthly Revenue (Last 6 Months)</h4>
              <p className="text-xs text-stone-500">Sales trend analysis</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800">
              Monthly
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2">
            {stats.monthlySales?.map((m: any, idx: number) => {
              const heightPercent = Math.max(10, Math.round((m.sales / maxMonthlySales) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  <div className="absolute -top-10 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <span className="px-2 py-1 bg-stone-900 text-white text-[10px] font-semibold rounded-md shadow-md whitespace-nowrap">
                      ৳{m.sales.toLocaleString()} ({m.orders} ord)
                    </span>
                    <div className="w-1.5 h-1.5 bg-stone-900 rotate-45 -mt-0.5"></div>
                  </div>

                  <div className="w-full bg-stone-100 rounded-t-lg relative flex items-end h-36 overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-stone-800 to-stone-600 group-hover:from-amber-600 group-hover:to-amber-500 transition-all rounded-t-md"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium mt-2 truncate w-full text-center">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. BEST SELLERS & RECENT ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-stone-900">Best-Selling Ensembles</h4>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
            >
              All Products
            </button>
          </div>

          <div className="space-y-3">
            {stats.bestSellingProducts?.length > 0 ? (
              stats.bestSellingProducts.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-stone-500">{p.unitsSold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-900">{formatBDT(p.revenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 py-6 text-center">No sales recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-stone-900">Recent Customer Orders</h4>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
            >
              View Orders
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {stats.recentOrders?.map((ord: Order) => (
              <div
                key={ord.id}
                onClick={() => onSelectOrder(ord)}
                className="py-3 flex items-center justify-between cursor-pointer hover:bg-stone-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{ord.orderNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      ord.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                      ord.status === 'SHIPPED' ? 'bg-sky-100 text-sky-800' :
                      ord.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    {ord.customerName} • {ord.customerPhone}
                  </p>
                </div>
                <div className="text-right pl-2">
                  <span className="text-xs font-bold text-stone-900">{formatBDT(ord.grandTotal)}</span>
                  <p className="text-[10px] text-stone-400">
                    {new Date(ord.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
