import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Heart, 
  Eye,
  Search,
  Check
} from 'lucide-react';
import { Product, Category } from '../types.js';
import { fetchProducts, fetchCategories } from '../lib/api.js';
import { ProductCard } from '../components/ProductCard.js';
import { QuickViewModal } from '../components/QuickViewModal.js';
import { formatBDT } from '../lib/utils.js';
import { useSettings } from '../context/SettingsContext.js';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { settings, language } = useSettings();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Search & Home category tab state
  const [homeSearch, setHomeSearch] = useState('');
  const [selectedHomeCategory, setSelectedHomeCategory] = useState<string>('ALL');

  // Hero carousel slide
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      badgeBn: "বৈশাখ ও বসন্ত কালেকশন ২০২৬",
      badgeEn: "Festive Spring Collection 2026",
      titleBn: "আভিজাত্য ও ঐতিহ্যের সেরা মেলবন্ধন",
      titleEn: "Timeless Elegance & Handcrafted Luxury",
      descBn: "এক্সক্লুসিভ সুইস লন থ্রি-পিস, পিওর ঢাকাই জামদানি এবং ডিজাইনার আবায়ার অপূর্ব সমাহার। ক্যাশ অন ডেলিভারি সুবিধা দেশজুড়ে।",
      descEn: "Explore exclusive embroidered 3-piece ensembles, authentic Dhakai Jamdani sarees, and premium Dubai abayas.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=90",
      ctaBn: "নতুন কালেকশন দেখুন",
      ctaEn: "Shop New Arrivals",
      link: "/shop?new=true"
    },
    {
      badgeBn: "এক্সক্লুসিভ হ্যান্ডলুম শাড়ি",
      badgeEn: "Heritage Handloom Sarees",
      titleBn: "ঢাকাই জামদানি ও পিওর কাতান সিল্ক",
      titleEn: "Royal Dhakai Jamdani & Katan Silk",
      descBn: "বাংলার দক্ষ কারিগরদের বোনা বিশ্বখ্যাত ঐতিহ্যবাহী জামদানি ও বিয়ের পার্টির কাতান শাড়ি。",
      descEn: "Handcrafted masterworks by traditional Bangladeshi weavers, adorned with royal gold and copper zari.",
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&q=90",
      ctaBn: "শাড়ির কালেকশন",
      ctaEn: "Explore Sarees",
      link: "/shop?category=saree"
    },
    {
      badgeBn: "মডার্ন মোডেস্ট ফ্যাশন",
      badgeEn: "Contemporary Modest Couture",
      titleBn: "দুবাই নিদাহ আবায়া ও প্রিমিয়াম হিজাব",
      titleEn: "Dubai Nidha Abayas & Silk Hijabs",
      descBn: "নন-স্লিপ বাবল ক্রিঙ্কল হিজাব, ক্রিস্টাল ওয়ার্ক কিমোনো বোরকা ও পার্টি আবায়া。",
      descEn: "Breathable, wrinkle-resistant and effortlessly draped modest wear for modern women.",
      image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1600&q=90",
      ctaBn: "আবায়া ও হিজাব দেখুন",
      ctaEn: "View Abayas & Hijabs",
      link: "/shop?category=abaya"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);
        setCategories(cats);
        setAllProducts(prods);
        setFeaturedProducts(prods.filter(p => p.isFeatured).slice(0, 4));
        setNewArrivals(prods.filter(p => p.isNewArrival).slice(0, 8));
        setBestSellers(prods.filter(p => p.isBestSeller).slice(0, 8));
        setTrendingProducts(prods.filter(p => p.isTrending).slice(0, 4));
        setSaleProducts(prods.filter(p => p.isOnSale || (p.salePrice && p.salePrice < p.price)).slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // Products filtered by selected category on Home Screen
  const categoryProducts = useMemo(() => {
    if (selectedHomeCategory === 'ALL') {
      return allProducts.slice(0, 8);
    }
    const catNorm = selectedHomeCategory.toLowerCase().trim();
    return allProducts.filter(p => 
      p.categorySlug?.toLowerCase() === catNorm || 
      p.categoryId?.toLowerCase() === catNorm ||
      p.categoryName?.toLowerCase() === catNorm
    );
  }, [allProducts, selectedHomeCategory]);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* 1. HERO BANNER SLIDER */}
      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div className="relative min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex items-center">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Image with Luxury Gradient Overlay */}
              <img
                src={slide.image}
                alt={slide.titleEn}
                className="w-full h-full object-cover object-center filter brightness-60 scale-105 transition-transform duration-10000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent" />

              {/* Text Content */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center relative z-20">
                <div className="max-w-xl py-12 space-y-4 font-bangla">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? slide.badgeBn : slide.badgeEn}</span>
                  </div>

                  <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wide leading-tight">
                    {language === 'bn' ? slide.titleBn : slide.titleEn}
                  </h1>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg">
                    {language === 'bn' ? slide.descBn : slide.descEn}
                  </p>

                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => navigate(slide.link)}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      <span>{language === 'bn' ? slide.ctaBn : slide.ctaEn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => navigate('/shop')}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/20 backdrop-blur-xs transition-all"
                    >
                      {language === 'bn' ? 'সব পোশাক এক্সপ্লোর করুন' : 'Explore All Shop'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Controls */}
          <button
            onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slider Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === i ? 'w-8 bg-amber-500' : 'w-2.5 bg-white/40'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Home Product Search Bar with Categories Directly Underneath */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-30">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-stone-200/90 font-bangla">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (homeSearch.trim()) {
                navigate(`/search?q=${encodeURIComponent(homeSearch.trim())}`);
              }
            }}
            className="relative"
          >
            <Search className="w-5 h-5 text-amber-800 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={homeSearch}
              onChange={(e) => setHomeSearch(e.target.value)}
              placeholder={language === 'bn' ? "পোশাকের নাম, শাড়ি, থ্রি-পিস, হিজাব বা কোড লিখে সার্চ করুন..." : "Search dresses by name, category or SKU..."}
              className="w-full pl-12 pr-24 sm:pr-28 py-2.5 sm:py-3 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1.5 sm:py-2 bg-stone-900 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              {language === 'bn' ? 'খুঁজুন' : 'Search'}
            </button>
          </form>

          {/* Categories directly below the Search Bar */}
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5 text-xs">
            <span className="text-stone-500 font-semibold shrink-0 text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'bn' ? 'ক্যাটাগরি:' : 'Categories:'}</span>
            </span>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium whitespace-nowrap text-xs transition-colors shrink-0"
            >
              {language === 'bn' ? 'সব পোশাক' : 'All Products'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/shop?category=${cat.slug}`)}
                className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-medium whitespace-nowrap text-xs transition-colors shrink-0"
              >
                {language === 'bn' ? cat.nameBn : cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 text-center sm:text-left gap-2">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-800 font-bold font-bangla">
              {language === 'bn' ? 'ক্যাটাগরি অনুযায়ী কেনাকাটা' : 'Curated Categories'}
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1 font-bangla">
              {language === 'bn' ? 'আপনার পছন্দের সেকশন বেছে নিন' : 'Shop by Women’s Category'}
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 font-bangla"
          >
            <span>{language === 'bn' ? 'সব ক্যাটাগরি দেখুন' : 'Browse All'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/shop?category=${cat.slug}`)}
              className="group relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 hover:shadow-md cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-[4/5] w-full overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-center font-bangla">
                <h3 className="text-sm font-bold tracking-wide leading-tight">
                  {language === 'bn' ? cat.nameBn : cat.name}
                </h3>
                <span className="text-[10px] text-stone-300">
                  {cat.itemCount || 10}+ {language === 'bn' ? 'পোশাক' : 'items'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Category Products Quick Showcase on Home Screen */}
        <div className="mt-10 pt-8 border-t border-stone-200/70 font-bangla">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                {language === 'bn' ? 'লাইভ কালেকশন প্রিভিউ' : 'Category Showcase'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900 mt-0.5">
                {selectedHomeCategory === 'ALL'
                  ? (language === 'bn' ? 'সব ক্যাটাগরির জনপ্রিয় পোশাক' : 'Popular from All Categories')
                  : (categories.find(c => c.slug === selectedHomeCategory)?.nameBn || selectedHomeCategory) + ' কালেকশন'}
              </h3>
            </div>

            {/* Category Filter Pills on Home Screen */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedHomeCategory('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedHomeCategory === 'ALL'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-amber-50'
                }`}
              >
                সব পোশাক
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedHomeCategory(cat.slug)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedHomeCategory === cat.slug
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-amber-50'
                  }`}
                >
                  {language === 'bn' ? cat.nameBn : cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid for this Category */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {categoryProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                navigate={navigate}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                if (selectedHomeCategory === 'ALL') {
                  navigate('/shop');
                } else {
                  navigate(`/shop?category=${selectedHomeCategory}`);
                }
              }}
              className="px-6 py-2.5 bg-stone-900 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <span>
                {selectedHomeCategory === 'ALL'
                  ? (language === 'bn' ? 'সব পোশাক ক্যাটালগ দেখুন' : 'View Full Catalogue')
                  : `${categories.find(c => c.slug === selectedHomeCategory)?.nameBn || 'এই'} ক্যাটাগরির সব পোশাক দেখুন`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="py-12 bg-white border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 text-center sm:text-left gap-2">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-800 font-bold font-bangla">
                {language === 'bn' ? 'লেটেস্ট ডিজাইন' : 'Just In'}
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1 font-bangla">
                {language === 'bn' ? 'নতুন পোশাক কালেকশন' : 'New Arrivals for Women'}
              </h2>
            </div>
            <button
              onClick={() => navigate('/shop?new=true')}
              className="text-xs font-semibold text-stone-800 hover:text-amber-900 flex items-center gap-1 font-bangla"
            >
              <span>{language === 'bn' ? 'সব নতুন কালেকশন' : 'View All New'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {newArrivals.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                navigate={navigate}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED LUXURY EDIT (Editorial Banner) */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl overflow-hidden bg-stone-900 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="p-8 sm:p-12 lg:p-16 space-y-4 font-bangla z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                {language === 'bn' ? 'রয়েল জামদানি ও সিল্ক এডিট' : 'The Royal Jamdani & Silk Edit'}
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                {language === 'bn' ? 'ঐতিহ্যবাহী বুননে বিয়ের রাজকীয় সাজ' : 'Hand-Woven Royal Jamdani for Festive Occasions'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {language === 'bn'
                  ? 'রূপগঞ্জের অভিজ্ঞ জামদানি কারিগরদের নিখুঁত হাতে বোনা ৮৪-কাউন্ট সুতো ও গোল্ডেন জরির শাড়ি। সাথে ম্যাচিং ব্লাউজ পিস এবং উপহারের রাজকীয় মোড়ক।'
                  : 'Experience the pinnacle of Bengali heritage. 84-count authentic fine weave draped in pure zari elegance.'}
              </p>
              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => navigate('/shop?category=saree')}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md"
                >
                  {language === 'bn' ? 'শাড়ি কালেকশন দেখুন' : 'Explore Sarees'}
                </button>
                <span className="text-xs text-amber-200">
                  {language === 'bn' ? 'সীমিত স্টক' : 'Limited Edition'}
                </span>
              </div>
            </div>

            <div className="relative h-72 sm:h-96 lg:h-full min-h-[350px]">
              <img
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&q=85"
                alt="Jamdani Saree"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-transparent to-stone-900/90 lg:to-stone-900" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS & TRENDING */}
      <section className="py-12 bg-white border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 text-center sm:text-left gap-2">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-800 font-bold font-bangla">
                {language === 'bn' ? 'সবচেয়ে জনপ্রিয়' : 'Customer Favorites'}
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1 font-bangla">
                {language === 'bn' ? 'বেস্ট সেলিং পোশাক' : 'Best Sellers of the Season'}
              </h2>
            </div>
            <button
              onClick={() => navigate('/shop?sort=best-selling')}
              className="text-xs font-semibold text-stone-800 hover:text-amber-900 flex items-center gap-1 font-bangla"
            >
              <span>{language === 'bn' ? 'সব বেস্ট সেলার' : 'View All Best Sellers'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {bestSellers.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                navigate={navigate}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. SPECIAL SALE / DISCOUNT SECTION */}
      {saleProducts.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="p-6 sm:p-8 bg-rose-50/70 border border-rose-200 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-bangla">
            <div className="space-y-1 text-center sm:text-left">
              <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Special Discount
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-rose-950 font-serif-luxury">
                {language === 'bn' ? 'উৎসবের এক্সক্লুসিভ অফার ও ছাড়' : 'Limited Time Festive Sale'}
              </h3>
              <p className="text-xs text-rose-800">
                {language === 'bn' 
                  ? 'থ্রি-পিস, কুর্তি ও হিজাবে বিশেষ ডিসকাউন্ট। সাথে কুপন কোড LUNARA10 ব্যবহারে বাড়তি ১০% ছাড়!'
                  : 'Enjoy special seasonal discounts on selected dresses. Extra 10% off with coupon code LUNARA10.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/shop?sale=true')}
              className="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-xs"
            >
              {language === 'bn' ? 'সব ডিসকাউন্ট প্রোডাক্ট' : 'Shop All On Sale'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
            {saleProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                navigate={navigate}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. CUSTOMER REVIEWS & TESTIMONIALS */}
      <section className="py-14 bg-stone-100/60 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 font-bangla">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              {language === 'bn' ? 'গ্রাহকদের সন্তুষ্টি' : 'Verified Reviews'}
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              {language === 'bn' ? 'লুনারা ফ্যাশন নিয়ে গ্রাহকদের মতামত' : 'What Our Customers Say'}
            </h2>
            <p className="text-xs text-stone-500 mt-1.5">
              {language === 'bn' 
                ? 'সারা দেশের শত শত নারী বেছে নিয়েছেন লুনারার অরিজিনাল কোয়ালিটি।'
                : 'Real reviews from verified shoppers across Dhaka, Chattogram and Sylhet.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bangla">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                "কাপড়ের কোয়ালিটি ও এমব্রয়ডারি সত্যিই অসাধারণ! ছবিতে যেমন দেখেছি হুবহু তেমনই পেয়েছি। মাত্র ২ দিনে বনানী থেকে ডেলিভারি পেয়েছি।"
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-stone-900">নুসরাত জাহান</h4>
                  <span className="text-stone-400 text-[11px]">ধানমন্ডি, ঢাকা</span>
                </div>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">ভেরিফাইড ক্রেতা</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                "জামদানি শাড়ির বুনন খুব নিখুঁত। সুতি অত্যন্ত নরম ও আরামদায়ক। বিশেষ করে ক্যাশ অন ডেলিভারিতে চেক করে পেমেন্ট নেওয়ার ব্যবস্থাটি খুব ভালো।"
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-stone-900">ফারহানা হক</h4>
                  <span className="text-stone-400 text-[11px]">চট্টগ্রাম</span>
                </div>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">ভেরিফাইড ক্রেতা</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                "তুর্কি জর্জেট হিজাব ও নিদাহ আবায়া এক কথায় প্রিমিয়াম! মাথায় কোনো পিন ছাড়াই সুন্দরভাবে সেট হয়ে থাকে। আবার অর্ডার করবো ইনশাআল্লাহ।"
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-stone-900">সামিয়া আক্তার</h4>
                  <span className="text-stone-400 text-[11px]">উত্তরা, ঢাকা</span>
                </div>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">ভেরিফাইড ক্রেতা</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal Popup */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        navigate={navigate}
      />
    </div>
  );
};
