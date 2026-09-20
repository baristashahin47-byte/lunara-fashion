import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  LogOut, 
  ExternalLink, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { AdminLoginView } from '../components/admin/AdminLoginView.js';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar.js';
import { AdminDashboardOverview } from '../components/admin/AdminDashboardOverview.js';
import { AdminCategoryManagement } from '../components/admin/AdminCategoryManagement.js';
import { AdminProductManagement } from '../components/admin/AdminProductManagement.js';
import { AdminOrderManagement } from '../components/admin/AdminOrderManagement.js';
import { AdminInventoryManagement } from '../components/admin/AdminInventoryManagement.js';
import { AdminCustomerManagement } from '../components/admin/AdminCustomerManagement.js';
import { AdminCouponManagement } from '../components/admin/AdminCouponManagement.js';
import { AdminFlashSaleManagement } from '../components/admin/AdminFlashSaleManagement.js';
import { AdminReviewManagement } from '../components/admin/AdminReviewManagement.js';
import { AdminReturnManagement } from '../components/admin/AdminReturnManagement.js';
import { AdminHomepageManagement } from '../components/admin/AdminHomepageManagement.js';
import { AdminStoreSettings } from '../components/admin/AdminStoreSettings.js';
import { AdminProfile } from '../components/admin/AdminProfile.js';

import { 
  fetchAdminStats, 
  fetchProducts, 
  fetchOrders, 
  fetchCategories, 
  fetchCoupons, 
  fetchAdminCustomers,
  fetchAdminReviews,
  fetchAdminReturns,
  adminLogoutApi
} from '../lib/api.js';
import { Product, Order, Category, Coupon, Review, ReturnRequest, User } from '../types.js';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { user, isAdmin, logout } = useAuth();
  const { settings, refreshSettings } = useSettings();

  // Local admin token check (persisted in localStorage from AdminLoginView)
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('lunara_admin_token') || null;
  });

  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Applet data states
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast notification system
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [st, pr, ord, cat, cp, cust, rev, ret] = await Promise.all([
        fetchAdminStats().catch(() => null),
        fetchProducts().catch(() => []),
        fetchOrders().catch(() => []),
        fetchCategories().catch(() => []),
        fetchCoupons().catch(() => []),
        fetchAdminCustomers().catch(() => []),
        fetchAdminReviews().catch(() => []),
        fetchAdminReturns().catch(() => [])
      ]);

      if (st) setStats(st);
      setProducts(pr);
      setOrders(ord);
      setCategories(cat);
      setCoupons(cp);
      setCustomers(cust);
      setReviews(rev);
      setReturnRequests(ret);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we have an admin session or user is marked as ADMIN
    if (adminToken || (user && user.role === 'ADMIN')) {
      loadDashboardData();
    }
  }, [adminToken, user]);

  const handleAdminLoginSuccess = (adminUser: User) => {
    const token = localStorage.getItem('lunara_admin_token') || 'token_active';
    setAdminToken(token);
    showToast(`Welcome back, ${adminUser.name}!`);
    loadDashboardData();
  };

  const handleAdminLogout = async () => {
    try {
      await adminLogoutApi();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('lunara_admin_token');
    localStorage.removeItem('lunara_admin_user');
    setAdminToken(null);
    logout();
    navigate('/');
  };

  // If NOT logged in as admin with valid session token or admin user role
  const isFullyAuthorized = !!adminToken || (user && user.role === 'ADMIN');

  if (!isFullyAuthorized) {
    return (
      <AdminLoginView 
        onLoginSuccess={handleAdminLoginSuccess} 
        onBackToStore={() => navigate('/')} 
      />
    );
  }

  // Pending badges calculation for sidebar
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;
  const lowStockThreshold = settings.lowStockThreshold || 5;
  const lowStockCount = products.filter(p => p.stock <= lowStockThreshold).length;
  const pendingReviewsCount = reviews.filter(r => !r.isApproved).length;
  const pendingReturnsCount = returnRequests.filter(r => r.status === 'REQUESTED').length;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* TOP ADMIN HEADER BAR (Mobile-first responsive) */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-4 py-3 sm:px-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 focus:outline-none cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-serif-luxury font-bold text-lg text-stone-900 tracking-wider">
              LUNARA
            </span>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              ADMIN PANEL
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => loadDashboardData()}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live Store</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Secure Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <AdminSidebar
          currentTab={activeTab}
          onSelectTab={setActiveTab}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          adminUser={user}
          onLogout={handleAdminLogout}
          onViewStore={() => navigate('/')}
          pendingOrdersCount={pendingOrdersCount}
          lowStockCount={lowStockCount}
          pendingReviewsCount={pendingReviewsCount}
          pendingReturnsCount={pendingReturnsCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'stats' && (
            <AdminDashboardOverview
              stats={stats}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectOrder={(order) => {
                setActiveTab('orders');
              }}
            />
          )}

          {/* TAB 2: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <AdminCategoryManagement
              categories={categories}
              onRefresh={loadDashboardData}
              showToast={showToast}
            />
          )}

          {/* TAB 3: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <AdminProductManagement
              products={products}
              categories={categories}
              onRefresh={loadDashboardData}
              showToast={showToast}
            />
          )}

          {/* TAB 4: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <AdminOrderManagement
              orders={orders}
              onRefresh={loadDashboardData}
              showToast={showToast}
            />
          )}

          {/* TAB 5: INVENTORY TRACKING */}
          {activeTab === 'inventory' && (
            <AdminInventoryManagement
              threshold={lowStockThreshold}
              onUpdateThreshold={(newT) => {
                refreshSettings();
              }}
              showToast={showToast}
            />
          )}

          {/* TAB 6: CUSTOMERS */}
          {activeTab === 'customers' && (
            <AdminCustomerManagement
              customers={customers}
              onSelectOrder={(order) => {
                setActiveTab('orders');
              }}
              showToast={showToast}
            />
          )}

          {/* TAB 7: COUPONS & DISCOUNTS */}
          {activeTab === 'coupons' && (
            <AdminCouponManagement
              coupons={coupons}
              onRefresh={loadDashboardData}
              showToast={showToast}
            />
          )}

          {/* TAB 8: FLASH SALE */}
          {activeTab === 'flash-sale' && (
            <AdminFlashSaleManagement
              products={products}
              showToast={showToast}
            />
          )}

          {/* TAB 9: CUSTOMER REVIEWS */}
          {activeTab === 'reviews' && (
            <AdminReviewManagement
              reviews={reviews}
              onRefresh={loadDashboardData}
              showToast={showToast}
            />
          )}

          {/* TAB 10: RETURNS & REFUNDS */}
          {activeTab === 'returns' && (
            <AdminReturnManagement
              returnRequests={returnRequests}
              onRefresh={loadDashboardData}
              showToast={showToast}
            />
          )}

          {/* TAB 11: HOMEPAGE BANNERS */}
          {activeTab === 'homepage' && (
            <AdminHomepageManagement
              categories={categories}
              products={products}
              showToast={showToast}
            />
          )}

          {/* TAB 12: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <AdminStoreSettings
              settings={settings}
              onRefresh={() => {
                refreshSettings();
                loadDashboardData();
              }}
              showToast={showToast}
            />
          )}

          {/* TAB 13: ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <AdminProfile
              adminUser={user || { name: 'Store Administrator', email: 'admin@lunarafashion.com' }}
              onRefresh={loadDashboardData}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* TOAST NOTIFICATION POPUP */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold text-white border ${
            toast.type === 'error' ? 'bg-red-600 border-red-700' : 'bg-stone-900 border-stone-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-200 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
