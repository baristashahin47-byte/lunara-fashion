import React, { useState, useEffect, useMemo } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  ArrowUpDown, 
  Check,
  Search,
  Sparkles
} from 'lucide-react';
import { Product, Category } from '../types.js';
import { fetchProducts, fetchCategories } from '../lib/api.js';
import { ProductCard } from '../components/ProductCard.js';
import { QuickViewModal } from '../components/QuickViewModal.js';
import { formatBDT } from '../lib/utils.js';
import { useSettings } from '../context/SettingsContext.js';

interface ShopPageProps {
  navigate: (path: string) => void;
  initialCategory?: string;
  initialQuery?: string;
  initialSaleOnly?: boolean;
}

export const ShopPage: React.FC<ShopPageProps> = ({ 
  navigate, 
  initialCategory, 
  initialQuery = '', 
  initialSaleOnly = false 
}) => {
  const { language } = useSettings();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'ALL');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(15000);
  const [onlySale, setOnlySale] = useState(initialSaleOnly);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    } else {
      setSelectedCategory('ALL');
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialQuery !== undefined) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (initialSaleOnly !== undefined) {
      setOnlySale(initialSaleOnly);
    }
  }, [initialSaleOnly]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category match (resilient to slug, id, or case)
      if (selectedCategory !== 'ALL') {
        const catNorm = selectedCategory.toLowerCase().trim();
        const matchesSlug = prod.categorySlug?.toLowerCase() === catNorm;
        const matchesId = prod.categoryId?.toLowerCase() === catNorm;
        const matchesName = prod.categoryName?.toLowerCase() === catNorm;
        if (!matchesSlug && !matchesId && !matchesName) {
          return false;
        }
      }
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchNameBn = prod.nameBn?.toLowerCase().includes(q);
        const matchSku = prod.sku?.toLowerCase().includes(q);
        const matchCategory = prod.categoryName.toLowerCase().includes(q);
        if (!matchName && !matchNameBn && !matchSku && !matchCategory) {
          return false;
        }
      }
      // Sale filter
      if (onlySale && !prod.salePrice) {
        return false;
      }
      // Stock filter
      if (onlyInStock && prod.stock <= 0) {
        return false;
      }
      // Price filter
      const currentPrice = prod.salePrice ?? prod.price;
      if (currentPrice > priceRange) {
        return false;
      }
      // Size filter
      if (selectedSizes.length > 0) {
        const hasSize = prod.sizes.some(s => selectedSizes.includes(s));
        if (!hasSize) return false;
      }
      // Color filter
      if (selectedColors.length > 0) {
        const hasColor = prod.colors.some(c => selectedColors.includes(c));
        if (!hasColor) return false;
      }
      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice ?? a.price;
      const priceB = b.salePrice ?? b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'best-selling') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      // default newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, searchQuery, onlySale, onlyInStock, priceRange, selectedSizes, selectedColors, sortBy]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(15000);
    setOnlySale(false);
    setOnlyInStock(false);
    setSearchQuery('');
  };

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const availableColors = ['Black', 'Ivory', 'Pastel Pink', 'Emerald Green', 'Royal Navy', 'Ruby Red', 'Mustard Gold', 'Maroon', 'Sky Blue'];

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Product Search Bar with Categories Directly Underneath */}
        <div className="mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs font-bangla">
          <div className="relative">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-800 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? "পোশাকের নাম, শাড়ি, থ্রি-পিস, হিজাব বা কোড লিখে সার্চ করুন..." : "Search dresses by name, category or SKU..."}
              className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60"
                title="সার্চ ক্লিয়ার করুন"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories Under the Search Bar */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-bold text-stone-600 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'bn' ? 'ক্যাটাগরি:' : 'Categories:'}</span>
            </span>

            <button
              onClick={() => {
                setSelectedCategory('ALL');
                navigate('/shop');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-amber-100 hover:text-amber-950'
              }`}
            >
              <span>{language === 'bn' ? 'সব পোশাক' : 'All'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'ALL' ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-600'}`}>
                {products.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase() || selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    navigate(`/shop?category=${cat.slug}`);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-amber-800 text-white shadow-xs font-semibold'
                      : 'bg-stone-100 text-stone-700 hover:bg-amber-100 hover:text-amber-950'
                  }`}
                >
                  <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
                  {cat.itemCount !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-amber-900 text-amber-200' : 'bg-stone-200 text-stone-600'}`}>
                      {cat.itemCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Sale Category Pill */}
            <button
              onClick={() => setOnlySale(!onlySale)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                onlySale
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span>{language === 'bn' ? 'অফার ও সেল' : 'Offers'}</span>
              <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">Sale</span>
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8 border-b border-stone-200/80 pb-6 font-bangla">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">
                {language === 'bn' ? 'লুনারা উইমেন্স ফ্যাশন' : "Lunara Women's Collection"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-stone-900 mt-0.5">
                {selectedCategory !== 'ALL'
                  ? categories.find(c => c.slug === selectedCategory)?.nameBn || 'কালেকশন'
                  : language === 'bn' ? 'সব পোশাক সংগ্রহ' : 'All Fashion Catalogue'}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                {filteredProducts.length} {language === 'bn' ? 'টি পণ্য পাওয়া গেছে' : 'products found'}
              </p>
            </div>

            {/* Top Toolbar (Sort + Mobile Filter Button) */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 flex items-center gap-1.5 shadow-2xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-stone-600" />
                <span>ফিল্টার</span>
                {(selectedSizes.length > 0 || selectedColors.length > 0 || onlySale || selectedCategory !== 'ALL') && (
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                )}
              </button>

              <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-lg px-3 py-1.5 shadow-2xs text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-stone-500 font-medium">সর্ট:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value="newest">নতুন সংযোজন (Newest)</option>
                  <option value="best-selling">বেস্ট সেলার (Best Selling)</option>
                  <option value="price-asc">দাম: কম থেকে বেশি</option>
                  <option value="price-desc">দাম: বেশি থেকে কম</option>
                  <option value="rating">সর্বোচ্চ রেটিং</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(selectedCategory !== 'ALL' || selectedSizes.length > 0 || selectedColors.length > 0 || onlySale || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-200/60 text-xs">
              <span className="text-stone-400 font-medium">ফিল্টার সক্রিয়:</span>

              {selectedCategory !== 'ALL' && (
                <span className="bg-amber-100/70 text-amber-900 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                  ক্যাটাগরি: {categories.find(c => c.slug === selectedCategory)?.nameBn || selectedCategory}
                  <button onClick={() => setSelectedCategory('ALL')}><X className="w-3 h-3" /></button>
                </span>
              )}

              {onlySale && (
                <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                  শুধুমাত্র অফার ও সেল
                  <button onClick={() => setOnlySale(false)}><X className="w-3 h-3" /></button>
                </span>
              )}

              {searchQuery && (
                <span className="bg-stone-200 text-stone-800 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                  অনুসন্ধান: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                </span>
              )}

              {selectedSizes.map((s) => (
                <span key={s} className="bg-stone-200 text-stone-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  সাইজ: {s}
                  <button onClick={() => toggleSize(s)}><X className="w-3 h-3" /></button>
                </span>
              ))}

              {selectedColors.map((c) => (
                <span key={c} className="bg-stone-200 text-stone-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  রং: {c}
                  <button onClick={() => toggleColor(c)}><X className="w-3 h-3" /></button>
                </span>
              ))}

              <button
                onClick={clearAllFilters}
                className="text-amber-800 hover:text-amber-950 font-semibold underline text-xs ml-2"
              >
                সব ফিল্টার মুছুন
              </button>
            </div>
          )}
        </div>

        {/* Main Grid & Desktop Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs h-fit font-bangla">
            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
                ক্যাটাগরি
              </h3>
              <div className="space-y-1.5 text-xs text-stone-600 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between ${
                    selectedCategory === 'ALL'
                      ? 'bg-amber-100/70 text-amber-950 font-bold'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <span>সব ক্যাটাগরি</span>
                  <span className="text-stone-400">{products.length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-amber-100/70 text-amber-950 font-bold'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    <span>{cat.nameBn || cat.name}</span>
                    <span className="text-stone-400">{cat.itemCount || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  সর্বোচ্চ মূল্য
                </h3>
                <span className="text-xs font-bold text-amber-900">
                  {formatBDT(priceRange)}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={20000}
                step={500}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                <span>৳১,০০০</span>
                <span>৳২০,০০০</span>
              </div>
            </div>

            {/* Size Filter */}
            <div className="pt-4 border-t border-stone-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2.5">
                সাইজ
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                      selectedSizes.includes(size)
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="pt-4 border-t border-stone-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2.5">
                কালার / রং
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {availableColors.map((col) => (
                  <button
                    key={col}
                    onClick={() => toggleColor(col)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all ${
                      selectedColors.includes(col)
                        ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                        : 'border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-stone-100 space-y-2.5 text-xs text-stone-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlySale}
                  onChange={(e) => setOnlySale(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0"
                />
                <span className="font-semibold text-rose-700">শুধুমাত্র ডিসকাউন্ট অফার</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0"
                />
                <span>স্টকে থাকা পণ্যসমূহ</span>
              </label>
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-stone-200 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center font-bangla space-y-3">
                <p className="text-base font-semibold text-stone-800">
                  আপনার নির্বাচিত ফিল্টারের সাথে কোনো পোশাকের মিল পাওয়া যায়নি।
                </p>
                <p className="text-xs text-stone-500">
                  অন্য কোনো ক্যাটাগরি বেছে নিন অথবা ফিল্টার ক্লিয়ার করে সব পোশাক দেখুন।
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-2 px-5 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-amber-900 transition-colors"
                >
                  সব ফিল্টার রিসেট করুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    navigate={navigate}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        navigate={navigate}
      />

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end font-bangla">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="text-base font-bold text-stone-900">ফিল্টারসমূহ</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {/* Categories */}
              <div className="py-4 border-b border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
                  ক্যাটাগরি
                </h4>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setSelectedCategory('ALL')}
                    className={`w-full text-left py-1.5 px-2 rounded ${
                      selectedCategory === 'ALL' ? 'bg-amber-100 font-bold' : ''
                    }`}
                  >
                    সব ক্যাটাগরি
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`w-full text-left py-1.5 px-2 rounded ${
                        selectedCategory === c.slug ? 'bg-amber-100 font-bold' : ''
                      }`}
                    >
                      {c.nameBn || c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="py-4 border-b border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
                  সাইজ
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1 text-xs rounded border ${
                        selectedSizes.includes(s) ? 'bg-stone-900 text-white' : 'border-stone-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700"
              >
                রিসেট
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                প্রয়োগ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
