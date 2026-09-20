import React from 'react';
import { 
  BarChart3, 
  Package, 
  Layers, 
  ShoppingBag, 
  Users, 
  Boxes, 
  Tag, 
  Zap, 
  Star, 
  RotateCcw, 
  Layout, 
  Truck, 
  Settings as SettingsIcon, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ExternalLink,
  X,
  Menu,
  Sparkles
} from 'lucide-react';
import { User } from '../../types.js';

export type AdminTab = 
  | 'stats' 
  | 'products' 
  | 'categories' 
  | 'orders' 
  | 'customers' 
  | 'inventory' 
  | 'coupons' 
  | 'flash-sale' 
  | 'reviews' 
  | 'returns' 
  | 'homepage' 
  | 'delivery' 
  | 'settings' 
  | 'notifications' 
  | 'profile';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminUser: User | null;
  onLogout: () => void;
  onViewStore: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
  pendingReviewsCount?: number;
  pendingReturnsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  adminUser,
  onLogout,
  onViewStore,
  mobileOpen,
  setMobileOpen,
  pendingOrdersCount = 0,
  lowStockCount = 0,
  pendingReviewsCount = 0,
  pendingReturnsCount = 0
}) => {
  const menuSections = [
    {
      group: 'Core Store',
      items: [
        { id: 'stats' as AdminTab, label: 'Dashboard', icon: BarChart3 },
        { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-amber-500 text-stone-950' },
        { id: 'products' as AdminTab, label: 'Products', icon: Package },
        { id: 'categories' as AdminTab, label: 'Categories', icon: Layers },
        { id: 'inventory' as AdminTab, label: 'Inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-red-500 text-white' },
        { id: 'customers' as AdminTab, label: 'Customers', icon: Users },
      ]
    },
    {
      group: 'Promotions & Content',
      items: [
        { id: 'coupons' as AdminTab, label: 'Coupons', icon: Tag },
        { id: 'flash-sale' as AdminTab, label: 'Flash Sale', icon: Zap },
        { id: 'homepage' as AdminTab, label: 'Homepage', icon: Layout },
        { id: 'reviews' as AdminTab, label: 'Reviews', icon: Star, badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined, badgeColor: 'bg-amber-400 text-stone-950' },
        { id: 'returns' as AdminTab, label: 'Returns & Refunds', icon: RotateCcw, badge: pendingReturnsCount > 0 ? pendingReturnsCount : undefined, badgeColor: 'bg-purple-500 text-white' },
      ]
    },
    {
      group: 'Settings & Admin',
      items: [
        { id: 'delivery' as AdminTab, label: 'Delivery Charges', icon: Truck },
        { id: 'notifications' as AdminTab, label: 'Customer Notifications', icon: Bell },
        { id: 'settings' as AdminTab, label: 'Store Settings', icon: SettingsIcon },
        { id: 'profile' as AdminTab, label: 'Admin Profile', icon: UserIcon },
      ]
    }
  ];

  const handleItemClick = (id: AdminTab) => {
    onSelectTab(id);
    setMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-stone-900 text-stone-300 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-500/20">
            L
          </div>
          <div>
            <h1 className="text-base font-serif-luxury font-bold tracking-wider text-white">
              LUNARA
            </h1>
            <span className="text-[10px] tracking-widest text-amber-400 uppercase font-semibold block">
              Admin Portal
            </span>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin User Info pill */}
      <div className="px-5 py-3 border-b border-stone-800/60 bg-stone-950/40">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{adminUser?.name || 'Administrator'}</p>
            <p className="text-[11px] text-stone-400 truncate">{adminUser?.email || 'admin@lunarafashion.com'}</p>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold tracking-wider uppercase">
            Admin
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
              {sec.group}
            </p>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/20'
                      : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-stone-700 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-stone-800 space-y-1.5 bg-stone-950/60">
        <button
          onClick={onViewStore}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800/80 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-amber-400" />
          <span>Customer Storefront</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30 border-r border-stone-800 shadow-2xl">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs h-full z-10 shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
