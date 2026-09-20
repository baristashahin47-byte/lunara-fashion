import React, { useState, useEffect } from 'react';
import { SettingsProvider } from './context/SettingsContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { WishlistProvider } from './context/WishlistContext.js';

import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';
import { CartDrawer } from './components/CartDrawer.js';
import { QuickViewModal } from './components/QuickViewModal.js';

import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderSuccessPage } from './pages/OrderSuccessPage.js';
import { TrackOrderPage } from './pages/TrackOrderPage.js';
import { WishlistPage } from './pages/WishlistPage.js';
import { AccountPage } from './pages/AccountPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { AdminDashboard } from './pages/AdminDashboard.js';

import { Product } from './types.js';

export function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return (window.location.pathname + window.location.search) || '/';
  });

  // Quick view product modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync route on browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  // Route parsing
  const renderRoute = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage navigate={navigate} />;
    }

    if (currentPath.startsWith('/shop') || currentPath.startsWith('/category/') || currentPath.startsWith('/search')) {
      const url = new URL(currentPath, window.location.origin);
      let category = url.searchParams.get('category') || undefined;
      
      if (currentPath.startsWith('/category/')) {
        const catSlug = currentPath.replace('/category/', '').split('?')[0];
        if (catSlug) {
          category = catSlug;
        }
      }

      const search = url.searchParams.get('q') || undefined;
      const sale = url.searchParams.get('sale') === 'true';

      return (
        <ShopPage
          navigate={navigate}
          initialCategory={category}
          initialQuery={search}
          initialSaleOnly={sale}
        />
      );
    }

    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '').split('?')[0];
      return <ProductDetailPage slug={slug} navigate={navigate} />;
    }

    if (currentPath === '/cart') {
      return <CartPage navigate={navigate} />;
    }

    if (currentPath === '/checkout') {
      return <CheckoutPage navigate={navigate} />;
    }

    if (currentPath.startsWith('/order-success/')) {
      const orderId = currentPath.replace('/order-success/', '').split('?')[0];
      return <OrderSuccessPage orderId={orderId} navigate={navigate} />;
    }

    if (currentPath === '/track-order') {
      return <TrackOrderPage navigate={navigate} />;
    }

    if (currentPath === '/wishlist') {
      return <WishlistPage navigate={navigate} />;
    }

    if (currentPath === '/account') {
      return <AccountPage navigate={navigate} />;
    }

    if (currentPath === '/login' || currentPath === '/register') {
      return <AuthPage navigate={navigate} />;
    }

    if (currentPath === '/admin') {
      return <AdminDashboard navigate={navigate} />;
    }

    // Default fallback to Home
    return <HomePage navigate={navigate} />;
  };

  const isAdminPage = currentPath === '/admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Hide customer navbar and footer when in dedicated full Admin panel */}
      {!isAdminPage && <Navbar navigate={navigate} currentRoute={currentPath} />}

      <main className="flex-1">
        {renderRoute()}
      </main>

      {!isAdminPage && <Footer navigate={navigate} />}
      {!isAdminPage && <MobileBottomNav navigate={navigate} currentRoute={currentPath} />}

      {/* Global Interactive Drawers & Modals */}
      <CartDrawer navigate={navigate} />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        navigate={navigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
