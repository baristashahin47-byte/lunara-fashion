import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  Phone, 
  Truck, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  MapPin,
  Tag,
  Clock,
  Layers,
  ShoppingBasket
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';
import { formatBDT } from '../lib/utils.js';
import { fetchProducts } from '../lib/api.js';
import { Product } from '../types.js';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { settings, language, toggleLanguage } = useSettings();
  const { totalItems, subtotal, openDrawer } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, logout, isAdmin, quickDemoLogin } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await fetchProducts({ search: searchQuery });
        setSearchSuggestions(results.slice(0, 5));
        setShowSearchDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navCategories = [
    { label: language === 'bn' ? 'সব পোশাক' : 'All Shop', path: '/shop' },
    { label: language === 'bn' ? 'থ্রি-পিস' : '3 Piece', path: '/category/3-piece' },
    { label: language === 'bn' ? 'শাড়ি' : 'Saree', path: '/category/saree' },
    { label: language === 'bn' ? 'কামিজ' : 'Kameez', path: '/category/kameez' },
    { label: language === 'bn' ? 'হিজাব' : 'Hijab', path: '/category/hijab' },
    { label: language === 'bn' ? 'আবায়া' : 'Abaya', path: '/category/abaya' },
    { label: language === 'bn' ? 'কুর্তি' : 'Kurti', path: '/category/kurti' },
    { label: language === 'bn' ? 'গহনা' : 'Jewellery', path: '/category/jewellery' },
    { label: language === 'bn' ? 'ব্যাগ' : 'Bags', path: '/category/bags' },
    { label: language === 'bn' ? 'অফার সেল' : 'Sale', path: '/shop?sale=true', highlight: true }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#1C1917] text-stone-200 text-xs py-2 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 font-bangla">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {language === 'bn' ? 'অফার' : 'Offer'}
            </span>
            <p className="text-stone-300 text-xs">
              {language === 'bn' ? settings.noticeBannerBn : settings.noticeBanner}
            </p>
          </div>

          <div className="flex items-center gap-4 text-stone-400 text-xs">
            <button
              onClick={() => navigate('/track-order')}
              className="hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
            </button>
            <span className="text-stone-600">|</span>
            <a href={`tel:${settings.supportPhone}`} className="hover:text-amber-300 transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{settings.supportPhone}</span>
            </a>
            <span className="text-stone-600">|</span>
            <button
              onClick={toggleLanguage}
              className="hover:text-white transition-colors font-semibold px-1.5 py-0.5 rounded bg-stone-800 text-amber-200 text-[11px]"
              title="Toggle Language"
            >
              {language === 'bn' ? 'EN' : 'বাংলা'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-stone-700 hover:text-stone-900 rounded-md focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/')}
          className="cursor-pointer flex flex-col items-center sm:items-start group select-none"
        >
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl sm:text-3xl tracking-widest font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
              LUNARA
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-widest text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Fashion BD
            </span>
          </div>
          <span className="text-[10px] tracking-wider text-stone-500 font-bangla">
            {language === 'bn' ? 'লুনারা ওমেন্স ফ্যাশন' : "Women's Boutique & Couture"}
          </span>
        </div>

        {/* Search Bar with live autocomplete & Categories Underneath */}
        <div ref={searchRef} className="hidden md:flex flex-col flex-1 max-w-xl mx-4 lg:mx-6 relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder={language === 'bn' ? "থ্রি-পিস, শাড়ি, হিজাব, কুর্তি খুঁজুন..." : "Search sarees, 3-piece, hijabs, kurti..."}
              className="w-full pl-10 pr-10 py-2 bg-stone-50 hover:bg-stone-100/80 focus:bg-white border border-stone-300 rounded-full text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all shadow-2xs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                className="absolute right-3 top-2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Categories directly below the Search Bar */}
          <div className="flex items-center gap-1.5 mt-1 px-1 overflow-x-auto no-scrollbar py-0.5 text-[11px] font-bangla">
            <span className="text-[10px] text-stone-400 font-semibold shrink-0">
              {language === 'bn' ? 'ক্যাটাগরি:' : 'Categories:'}
            </span>
            {navCategories.filter(c => c.path !== '/shop').map((cat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setShowSearchDropdown(false);
                  navigate(cat.path);
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
                  cat.highlight
                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold'
                    : currentRoute === cat.path
                    ? 'bg-amber-800 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-950'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Autocomplete & Category Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50">
              {/* Quick Category Suggestions inside dropdown */}
              <div className="p-3 bg-stone-50 border-b border-stone-100">
                <p className="text-[11px] font-bold text-stone-600 mb-2 font-bangla">
                  {language === 'bn' ? 'জনপ্রিয় ক্যাটাগরি ব্রাউজ করুন:' : 'Browse Popular Categories:'}
                </p>
                <div className="flex flex-wrap gap-1.5 font-bangla">
                  {navCategories.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setShowSearchDropdown(false);
                        navigate(c.path);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-amber-700 hover:bg-amber-50 text-stone-700 hover:text-amber-900 transition-colors"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {searchQuery.trim() && (
                <>
                  <div className="px-3 py-2 bg-stone-100/60 border-b border-stone-100 flex items-center justify-between text-xs text-stone-500 font-bangla">
                    <span>{language === 'bn' ? `"${searchQuery}" সম্পর্কিত পণ্য` : 'Search Suggestions'}</span>
                    {isSearching && <span className="animate-pulse">Loading...</span>}
                  </div>
                  {searchSuggestions.length > 0 ? (
                    <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
                      {searchSuggestions.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate(`/product/${prod.slug}`);
                          }}
                          className="p-3 flex items-center gap-3 hover:bg-amber-50/50 cursor-pointer transition-colors"
                        >
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-12 h-14 object-cover rounded bg-stone-100"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-stone-800 truncate font-bangla">
                              {language === 'bn' && prod.nameBn ? prod.nameBn : prod.name}
                            </h4>
                            <span className="text-[11px] text-stone-500">{prod.categoryName}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-stone-900">
                                {formatBDT(prod.salePrice ?? prod.price, language === 'bn')}
                              </span>
                              {prod.salePrice && (
                                <span className="text-[11px] text-stone-400 line-through">
                                  {formatBDT(prod.price, language === 'bn')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div 
                        onClick={handleSearchSubmit}
                        className="p-2.5 text-center text-xs font-semibold text-amber-800 hover:bg-amber-50 cursor-pointer flex items-center justify-center gap-1.5 font-bangla"
                      >
                        <span>{language === 'bn' ? `"${searchQuery}" এর সব ফলাফল দেখুন` : `View all results for "${searchQuery}"`}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : !isSearching ? (
                    <div className="p-6 text-center text-xs text-stone-500 font-bangla">
                      {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি। অন্য কিছু দিয়ে চেষ্টা করুন।' : 'No matching products found'}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Wishlist Button */}
          <button
            onClick={() => navigate('/wishlist')}
            className="relative p-2 text-stone-700 hover:text-rose-700 transition-colors rounded-full hover:bg-stone-100"
            title={language === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist'}
          >
            <Heart className="w-5 h-5" />
            {totalWishlistItems > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                {totalWishlistItems}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={openDrawer}
            className="flex items-center gap-2.5 px-3 py-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-all shadow-sm"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-amber-200" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] text-stone-400 leading-none">
                {language === 'bn' ? 'ব্যাগ' : 'Cart'}
              </span>
              <span className="text-xs font-semibold leading-tight text-amber-100">
                {formatBDT(subtotal, language === 'bn')}
              </span>
            </div>
          </button>

          {/* User Account / Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 p-2 text-stone-700 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
              title={user ? user.name : 'Account'}
            >
              <UserIcon className="w-5 h-5" />
              {user && (
                <span className="hidden md:inline-block text-xs font-medium max-w-[90px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:inline-block" />
            </button>

            {userDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-scale-in"
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                {user ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/70">
                      <p className="text-xs font-semibold text-stone-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="mt-1 inline-block bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          ADMIN ACCESS
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate('/admin'); }}
                        className="w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 font-semibold flex items-center justify-between"
                      >
                        <span>{language === 'bn' ? 'এডমিন ড্যাশবোর্ড' : 'Admin Panel'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => { setUserDropdownOpen(false); navigate('/account'); }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 font-bangla"
                    >
                      {language === 'bn' ? 'আমার প্রোফাইল ও অর্ডার' : 'My Account & Orders'}
                    </button>
                    <button
                      onClick={() => { setUserDropdownOpen(false); navigate('/track-order'); }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 font-bangla"
                    >
                      {language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}
                    </button>
                    <div className="border-t border-stone-100 my-1"></div>
                    <button
                      onClick={() => { setUserDropdownOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bangla"
                    >
                      {language === 'bn' ? 'লগআউট' : 'Logout'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 text-xs text-stone-600 font-bangla">
                      {language === 'bn' ? 'লুনারা একাউন্টে সাইন ইন করুন' : 'Sign in to Lunara Fashion'}
                    </div>
                    <button
                      onClick={() => { setUserDropdownOpen(false); navigate('/login'); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-900 hover:bg-stone-50"
                    >
                      {language === 'bn' ? 'লগইন / রেজিস্টার' : 'Login / Register'}
                    </button>
                    <div className="border-t border-stone-100 my-1"></div>
                    <div className="px-4 py-1 text-[11px] text-stone-400 uppercase font-semibold">
                      Demo Shortcuts:
                    </div>
                    <button
                      onClick={() => { setUserDropdownOpen(false); quickDemoLogin('ADMIN'); }}
                      className="w-full text-left px-4 py-1.5 text-xs text-purple-700 hover:bg-purple-50 flex items-center justify-between"
                    >
                      <span>Login as Admin</span>
                      <span className="text-[10px] bg-purple-100 px-1 rounded">Admin</span>
                    </button>
                    <button
                      onClick={() => { setUserDropdownOpen(false); quickDemoLogin('CUSTOMER'); }}
                      className="w-full text-left px-4 py-1.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center justify-between"
                    >
                      <span>Login as Customer</span>
                      <span className="text-[10px] bg-stone-100 px-1 rounded">User</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar & Category Chips */}
      <div className="md:hidden px-4 py-2 bg-stone-50/90 border-t border-stone-200/70 font-bangla">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? "পোশাক খুঁজুন (শাড়ি, থ্রি-পিস, হিজাব)..." : "Search sarees, 3-piece, abaya..."}
            className="w-full pl-9 pr-8 py-1.5 bg-white border border-stone-300 rounded-full text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-800 shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1.5 text-stone-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Categories directly below search bar on mobile */}
        <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto no-scrollbar pb-0.5 text-[10px]">
          <span className="text-stone-400 shrink-0 font-semibold">ক্যাটাগরি:</span>
          {navCategories.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => navigate(cat.path)}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 transition-colors ${
                cat.highlight
                  ? 'bg-rose-100 text-rose-700 font-bold'
                  : currentRoute === cat.path
                  ? 'bg-amber-800 text-white font-semibold'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-amber-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Navigation Bar (Desktop) */}
      <nav className="hidden lg:block border-t border-stone-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-8 py-2.5 text-xs font-medium text-stone-700 font-bangla">
          {navCategories.map((cat, idx) => {
            const isActive = currentRoute === cat.path || (cat.path !== '/shop' && currentRoute.startsWith(cat.path));
            return (
              <button
                key={idx}
                onClick={() => navigate(cat.path)}
                className={`py-1 relative transition-all tracking-wide ${
                  cat.highlight
                    ? 'text-rose-600 font-bold hover:text-rose-700 flex items-center gap-1'
                    : isActive
                    ? 'text-stone-950 font-bold border-b-2 border-stone-900'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {cat.label}
                {cat.highlight && (
                  <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase">
                    Hot
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Full Screen Mobile Menu Overlay (Rendered via Portal to escape header backdrop-filter) */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] w-screen h-[100dvh] bg-[#FAF8F5] text-stone-900 flex flex-col overflow-y-auto overscroll-contain animate-fade-in font-bangla">
          {/* Top Full Screen Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-stone-200 flex items-center justify-between shadow-xs">
            <div 
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-widest text-stone-950">
                  LUNARA
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                  Fashion BD
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                {language === 'bn' ? 'প্রিমিয়াম উইমেন্স এথনিক ওয়্যার' : "Exclusive Women's Couture"}
              </p>
            </div>

            {/* Prominent Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center transition-all border border-stone-300/80 shadow-xs active:scale-95"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-6 flex-1">
            {/* Full Search Bar */}
            <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
              <form 
                onSubmit={(e) => { 
                  handleSearchSubmit(e); 
                  setMobileMenuOpen(false); 
                }} 
                className="relative flex items-center"
              >
                <Search className="w-4 h-4 text-amber-800 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? "পোশাক খুঁজুন (যেমন: থ্রি-পিস, শাড়ি, হিজাব)..." : "Search sarees, 3-piece, hijabs..."}
                  className="w-full pl-10 pr-20 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-16 text-stone-400 hover:text-stone-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {language === 'bn' ? 'খুঁজুন' : 'Search'}
                </button>
              </form>

              {/* Quick Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
                <span className="text-stone-400 font-semibold shrink-0">দ্রুত ফিল্টার:</span>
                {['থ্রি-পিস', 'শাড়ি', 'কামিজ', 'হিজাব', 'আবায়া', 'কুর্তি'].map((name, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSearchQuery(name);
                      navigate(`/shop?search=${encodeURIComponent(name)}`);
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-amber-100 text-stone-700 rounded-full shrink-0 transition-colors font-medium border border-stone-200"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Collection List */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-700" />
                  {language === 'bn' ? 'পোশাক ক্যাটাগরি কালেকশন' : 'Browse Categories'}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {navCategories.length} টি ক্যাটাগরি
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
                {navCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(cat.path);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                      cat.highlight
                        ? 'bg-rose-50/50 hover:bg-rose-50 text-rose-800'
                        : 'hover:bg-amber-50/40 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${cat.highlight ? 'bg-rose-500' : 'bg-amber-700'}`}></span>
                      <span className="text-sm font-semibold">{cat.label}</span>
                      {cat.highlight && (
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Hot Offer
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions & Account Grid */}
            <div>
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5 mb-3 px-1">
                <Sparkles className="w-4 h-4 text-amber-700" />
                {language === 'bn' ? 'প্রয়োজনীয় সেবা ও অ্যাকাউন্ট' : 'Services & Account'}
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Track Order */}
                <button
                  onClick={() => {
                    navigate('/track-order');
                    setMobileMenuOpen(false);
                  }}
                  className="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-xs hover:border-amber-700 text-left flex items-center gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-stone-900">
                      {language === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}
                    </span>
                    <span className="text-[10px] text-stone-500">স্টেটাস দেখুন</span>
                  </div>
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => {
                    navigate('/wishlist');
                    setMobileMenuOpen(false);
                  }}
                  className="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-xs hover:border-rose-700 text-left flex items-center gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 relative">
                    <Heart className="w-5 h-5" />
                    {totalWishlistItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {totalWishlistItems}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-stone-900">
                      {language === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist'}
                    </span>
                    <span className="text-[10px] text-stone-500">{totalWishlistItems} টি পণ্য</span>
                  </div>
                </button>

                {/* Cart Drawer */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openDrawer();
                  }}
                  className="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-xs hover:border-stone-900 text-left flex items-center gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-900 flex items-center justify-center shrink-0 relative">
                    <ShoppingBag className="w-5 h-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-stone-900">
                      {language === 'bn' ? 'শপিং ব্যাগ' : 'Cart'}
                    </span>
                    <span className="text-[10px] text-amber-800 font-semibold">{formatBDT(subtotal)}</span>
                  </div>
                </button>

                {/* User Account */}
                <button
                  onClick={() => {
                    navigate('/account');
                    setMobileMenuOpen(false);
                  }}
                  className="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-xs hover:border-stone-900 text-left flex items-center gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-900 flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold block text-stone-900 truncate">
                      {user ? user.name : (language === 'bn' ? 'একাউন্ট / লগইন' : 'My Account')}
                    </span>
                    <span className="text-[10px] text-stone-500 truncate">
                      {user ? 'প্রোফাইল দেখুন' : 'লগইন করুন'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Admin Panel Link (if user is Admin) */}
            {isAdmin && (
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-900 block">এডমিন ড্যাশবোর্ড (Admin Panel)</span>
                  <span className="text-[11px] text-purple-700">পণ্য, অর্ডার ও সেটিংস পরিচালনা করুন</span>
                </div>
                <button
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold"
                >
                  প্রবেশ করুন
                </button>
              </div>
            )}

            {/* Support & Showroom Information Card */}
            <div className="bg-stone-900 text-white p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  গ্রাহক সেবা ও যোগাযোগ
                </span>
                <a
                  href={`tel:${settings.supportPhone}`}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>কল করুন</span>
                </a>
              </div>

              <div className="space-y-2 text-xs text-stone-300">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>হটলাইন: <strong>{settings.supportPhone}</strong> (সকাল ১০টা - রাত ১০টা)</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">বনানী ফ্ল্যাগশিপ শোরুম:</span>
                    <p className="text-[11px] text-stone-400">বাড়ি ৪২, রোড ১১, ব্লক ডি, বনানী, ঢাকা-১২১৩</p>
                  </div>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                <span className="text-xs text-stone-400">ভাষা পরিবর্তন:</span>
                <button
                  onClick={() => {
                    toggleLanguage();
                  }}
                  className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-semibold border border-stone-700"
                >
                  {language === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
                </button>
              </div>
            </div>

            {/* Close Button at Bottom */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <X className="w-4 h-4" />
              <span>মেনু বন্ধ করুন (Close Menu)</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
