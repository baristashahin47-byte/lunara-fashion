import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  Ruler, 
  Share2, 
  ArrowRight,
  ChevronRight,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Product, Review } from '../types.js';
import { fetchProductBySlug, fetchProducts, submitProductReview, fetchProductReviews } from '../lib/api.js';
import { ProductCard } from '../components/ProductCard.js';
import { formatBDT } from '../lib/utils.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';

interface ProductDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, navigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { settings, language } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Interaction states
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'fabric' | 'shipping' | 'reviews'>('desc');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState(user?.name || '');
  const [reviewCity, setReviewCity] = useState('Dhaka');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        const prod = await fetchProductBySlug(slug);
        setProduct(prod);
        setSelectedImgIdx(0);
        setSelectedSize(prod.sizes[0] || 'Standard');
        setSelectedColor(prod.colors[0] || 'Default');

        // Load reviews & related products
        const [revs, allProds] = await Promise.all([
          fetchProductReviews(prod.id),
          fetchProducts({ category: prod.categorySlug })
        ]);
        setReviews(revs);
        setRelatedProducts(allProds.filter(p => p.id !== prod.id).slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-8 font-bangla text-center">
        <h2 className="text-xl font-bold text-stone-800">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 px-6 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold"
        >
          সব পোশাক কালেকশনে ফিরে যান
        </button>
      </div>
    );
  }

  const currentPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !reviewName.trim()) return;

    setSubmittingReview(true);
    try {
      const newRev = await submitProductReview({
        productId: product.id,
        userName: reviewName,
        userCity: reviewCity,
        rating: reviewRating,
        comment: reviewComment,
        userId: user?.id
      });
      setReviews(prev => [newRev, ...prev]);
      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6 font-bangla">
          <button onClick={() => navigate('/')} className="hover:text-stone-900">হোম</button>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <button onClick={() => navigate('/shop')} className="hover:text-stone-900">শপ</button>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <button onClick={() => navigate(`/category/${product.categorySlug}`)} className="hover:text-stone-900">
            {product.categoryName}
          </button>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-stone-900 font-semibold truncate max-w-[200px]">
            {language === 'bn' && product.nameBn ? product.nameBn : product.name}
          </span>
        </nav>

        {/* Top Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white p-5 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
          {/* Gallery Column */}
          <div className="space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 group">
              <img
                src={product.images[selectedImgIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
                {hasDiscount && (
                  <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs">
                    -{product.discount || 15}% OFF
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="bg-stone-950 text-amber-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded tracking-wider shadow-xs">
                    NEW ARRIVAL
                  </span>
                )}
              </div>

              {/* Wishlist floating toggle */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-3.5 right-3.5 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md ${
                  inWishlist ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-stone-700 hover:bg-white hover:text-rose-600'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIdx(idx)}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImgIdx === idx ? 'border-stone-900 shadow-sm' : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Purchase Column */}
          <div className="flex flex-col justify-between space-y-6 font-bangla">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="uppercase tracking-wider font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {product.categoryName}
                </span>
                <span className="font-mono text-stone-400">SKU: {product.sku}</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif-luxury text-stone-900 leading-snug">
                {language === 'bn' && product.nameBn ? product.nameBn : product.name}
              </h1>

              {/* Rating & Stock Status */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-bold text-stone-800">{product.rating}</span>
                </div>
                <span className="text-stone-300">|</span>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-xs text-stone-600 hover:text-amber-900 underline"
                >
                  {reviews.length || product.reviewCount} টি কাস্টমার রিভিউ
                </button>
                <span className="text-stone-300">|</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  স্টকে আছে ({product.stock} পিস)
                </span>
              </div>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl sm:text-3xl font-bold text-stone-950 font-sans">
                  {formatBDT(currentPrice, language === 'bn')}
                </span>
                {hasDiscount && (
                  <span className="text-base text-stone-400 line-through font-sans">
                    {formatBDT(product.price, language === 'bn')}
                  </span>
                )}
                <span className="text-xs text-stone-500">ভ্যাট অন্তর্ভুক্ত</span>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-2">
                {product.description}
              </p>
            </div>

            {/* Variations */}
            <div className="space-y-4 pt-4 border-t border-stone-200/70">
              {/* Colors */}
              <div>
                <span className="text-xs font-bold text-stone-800 block mb-2">
                  রং পছন্দ করুন: <span className="font-semibold text-amber-900">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all ${
                        selectedColor === c
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-stone-300 shrink-0"
                        style={{ backgroundColor: product.colorCodes?.[i] || '#777' }}
                      />
                      <span>{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes & Size Guide */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-800">
                    সাইজ বেছে নিন: <span className="font-semibold text-amber-900">{selectedSize}</span>
                  </span>
                  <button
                    onClick={() => setShowSizeModal(true)}
                    className="text-xs text-amber-800 hover:text-amber-950 flex items-center gap-1 font-semibold underline"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>সাইজ চার্ট (Size Guide)</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-12 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedSize === s
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs font-bold text-stone-800">পরিমাণ:</span>
                <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-stone-200 text-stone-700 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1.5 hover:bg-stone-200 text-stone-700 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-stone-200/70">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-200" />
                  <span>ব্যাগে যোগ করুন</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>সরাসরি অর্ডার করুন (COD)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {addedToast && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 justify-center">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>পণ্যটি সফলভাবে শপিং ব্যাগে যোগ করা হয়েছে!</span>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-200/70 text-center text-[11px] text-stone-600">
              <div className="p-2 bg-stone-50 rounded-lg flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>৭ দিনের ফ্রি সাইজ এক্সচেঞ্জ</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>১০০% অরিজিনাল কোয়ালিটি</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs (Description, Fabric, Delivery Policy, Customer Reviews) */}
        <div className="mt-10 bg-white rounded-2xl border border-stone-200/80 overflow-hidden font-bangla shadow-xs">
          {/* Tabs Navigation */}
          <div className="flex border-b border-stone-200 overflow-x-auto bg-stone-50/50">
            <button
              onClick={() => setActiveTab('desc')}
              className={`px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'desc'
                  ? 'border-amber-600 text-amber-950 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              পোশাকের বিবরণ
            </button>
            <button
              onClick={() => setActiveTab('fabric')}
              className={`px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'fabric'
                  ? 'border-amber-600 text-amber-950 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              ফেব্রিক ও ধোয়ার নিয়ম
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'shipping'
                  ? 'border-amber-600 text-amber-950 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              ডেলিভারি ও রিটার্ন পলিসি
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-amber-600 text-amber-950 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              গ্রাহকদের রিভিউ ({reviews.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
            {activeTab === 'desc' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-stone-900 font-serif-luxury">
                  {language === 'bn' && product.nameBn ? product.nameBn : product.name}
                </h3>
                <p>{product.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <span className="font-bold text-stone-800 block">ক্যাটাগরি:</span>
                    <span className="text-stone-600">{product.categoryName}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <span className="font-bold text-stone-800 block">উপলব্ধ সাইজ:</span>
                    <span className="text-stone-600">{product.sizes.join(', ')}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <span className="font-bold text-stone-800 block">রং সমূহ:</span>
                    <span className="text-stone-600">{product.colors.join(', ')}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <span className="font-bold text-stone-800 block">মডেল / এসকেইউ:</span>
                    <span className="text-stone-600">{product.sku}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fabric' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-stone-900">ফেব্রিক স্পেসিফিকেশন ও যত্ন</h4>
                <p>
                  লুনারা ফ্যাশনের প্রতিটি পোশাক পরীক্ষিত ও প্রিমিয়াম থ্রেডে তৈরি। রঙ এবং সূক্ষ্ম নকশার স্থায়িত্ব বজায় রাখতে নিচের নির্দেশনাগুলো অনুসরণ করুন:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                  <li>শাড়ি এবং এমব্রয়ডারি করা থ্রি-পিসের জন্য ড্রাই ক্লিন (Dry Clean) করা সর্বোত্তম।</li>
                  <li>বাসায় ধোয়ার ক্ষেত্রে ঠান্ডা পানিতে হালকা শ্যাম্পু বা মাইল্ড ডিটারজেন্ট ব্যবহার করুন।</li>
                  <li>ব্লিচ বা কড়া কেমিক্যাল কোনোভাবেই ব্যবহার করবেন না।</li>
                  <li>সরাসরি কড়া রোদে না শুকিয়ে ছায়াযুক্ত স্থানে শুকানো ভালো।</li>
                  <li>পোশাকের উল্টো পিঠে মাঝারি তাপে ইস্ত্রি (Iron) করুন।</li>
                </ul>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-stone-900">ডেলিভারি চার্জ ও সময়সূচী (বাংলাদেশ)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60">
                    <h5 className="font-bold text-amber-950">ঢাকা মেট্রো সিটি</h5>
                    <p className="text-xs text-amber-900 mt-1">ডেলিভারি ফি: ৳৭০</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">সময়: ২৪ থেকে ৪৮ ঘণ্টা</p>
                  </div>
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60">
                    <h5 className="font-bold text-amber-950">ঢাকার পার্শ্ববর্তী এলাকা</h5>
                    <p className="text-xs text-amber-900 mt-1">ডেলিভারি ফি: ৳১০০</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">গাজীপুর, সাভার, নারায়ণগঞ্জ (৪৮-৭২ ঘণ্টা)</p>
                  </div>
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60">
                    <h5 className="font-bold text-amber-950">ঢাকার বাইরে (৬৪ জেলা)</h5>
                    <p className="text-xs text-amber-900 mt-1">ডেলিভারি ফি: ৳১২০</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">সুন্দরবন ও রেডেক্স হোম ডেলিভারি (৩-৫ দিন)</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200">
                  <h5 className="font-bold text-stone-900">৭ দিনের রিটার্ন ও সাইজ এক্সচেঞ্জ পলিসি:</h5>
                  <p className="text-xs text-stone-600 mt-1">
                    পণ্য রিসিভ করার পর কোনো ডিফেক্ট বা সাইজ সমস্যা হলে ডেলিভারিম্যান থাকা অবস্থায় অথবা ৪৮ ঘণ্টার মধ্যে আমাদের হটলাইনে কল করে ফ্রি এক্সচেঞ্জ করতে পারবেন।
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Write a review form */}
                <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="text-sm font-bold text-stone-900 mb-2">এই পোশাকে আপনার রিভিউ দিন</h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">রেটিং দিন:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setReviewRating(s)}
                            className="p-1"
                          >
                            <Star className={`w-5 h-5 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="আপনার নাম"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        required
                        className="px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="আপনার শহর (যেমন: ঢাকা / চট্টগ্রাম)"
                        value={reviewCity}
                        onChange={(e) => setReviewCity(e.target.value)}
                        className="px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    </div>

                    <textarea
                      placeholder="পোশাকটির ফেব্রিক, ডিজাইন ও ফিটিংস নিয়ে আপনার অভিজ্ঞতা লিখুন..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
                    >
                      {submittingReview ? 'জমা দেওয়া হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                    </button>

                    {reviewSuccess && (
                      <p className="text-xs text-emerald-600 font-bold">
                        ধন্যবাদ! আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে।
                      </p>
                    )}
                  </form>
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-stone-500 italic">এখনো কোনো রিভিউ যোগ করা হয়নি। প্রথম রিভিউটি আপনি দিন!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-white rounded-xl border border-stone-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-xs">{rev.userName}</span>
                            <span className="text-[11px] text-stone-400">({rev.userCity})</span>
                          </div>
                          <div className="flex gap-0.5 text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-stone-600">{rev.comment}</p>
                        <span className="text-[10px] text-stone-400 block pt-1">
                          {new Date(rev.createdAt).toLocaleDateString('bn-BD', { dateStyle: 'medium' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-14 font-bangla">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-800 font-bold">
                  একই ক্যাটাগরির
                </span>
                <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-stone-900">
                  সম্পর্কিত অন্যান্য পোশাক
                </h3>
              </div>
              <button
                onClick={() => navigate(`/category/${product.categorySlug}`)}
                className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1"
              >
                <span>আরও দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} navigate={navigate} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-bangla">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-amber-700" />
                <span>লুনারা ওমেন্স সাইজ গাইড (ইঞ্চি পরিমাপ)</span>
              </h3>
              <button onClick={() => setShowSizeModal(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500">
              নিচের চার্টটি কামিজ ও কুর্তির জন্য প্রযোজ্য। শাড়ির জন্য стандарт ১২ হাত এবং ব্লাউজ পিস ১ গজ।
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-stone-700 border border-stone-200">
                <thead className="bg-stone-100 text-stone-900 font-bold">
                  <tr>
                    <th className="p-2.5 border-b">সাইজ</th>
                    <th className="p-2.5 border-b">বুক (Bust)</th>
                    <th className="p-2.5 border-b">ঝুল (Length)</th>
                    <th className="p-2.5 border-b">হাতা (Sleeve)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="p-2.5 font-bold">Small (S)</td>
                    <td className="p-2.5">৩৬"</td>
                    <td className="p-2.5">৪০" - ৪২"</td>
                    <td className="p-2.5">১৯"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Medium (M)</td>
                    <td className="p-2.5">৩৮"</td>
                    <td className="p-2.5">৪২" - ৪৪"</td>
                    <td className="p-2.5">২০"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Large (L)</td>
                    <td className="p-2.5">৪০"</td>
                    <td className="p-2.5">৪৪"</td>
                    <td className="p-2.5">২০.৫"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">XL</td>
                    <td className="p-2.5">৪২"</td>
                    <td className="p-2.5">৪৪" - ৪৬"</td>
                    <td className="p-2.5">২১"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">XXL</td>
                    <td className="p-2.5">৪৪" - ৪৬"</td>
                    <td className="p-2.5">৪৬"</td>
                    <td className="p-2.5">২১.৫"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSizeModal(false)}
                className="px-5 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
