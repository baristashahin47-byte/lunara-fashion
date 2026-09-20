import React, { useState } from 'react';
import { X, Star, Check, ShoppingBag, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Product } from '../types.js';
import { formatBDT } from '../lib/utils.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useSettings } from '../context/SettingsContext.js';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, navigate }) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { language } = useSettings();

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const currentPrice = product.salePrice ?? product.price;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-stone-100 text-stone-600 flex items-center justify-center transition-colors shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-5 bg-stone-50 flex flex-col justify-between">
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-200">
              <img
                src={product.images[selectedImgIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-14 h-16 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImgIndex === idx ? 'border-stone-900' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 flex flex-col justify-between space-y-4 font-bangla">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span>{product.categoryName}</span>
                <span className="font-mono text-stone-400">SKU: {product.sku}</span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                {language === 'bn' && product.nameBn ? product.nameBn : product.name}
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  <span className="text-xs font-bold text-stone-800">{product.rating}</span>
                </div>
                <span className="text-stone-300">|</span>
                <span className="text-xs text-stone-500">{product.reviewCount} reviews</span>
                <span className="text-stone-300">|</span>
                <span className="text-xs text-emerald-600 font-semibold">ইন স্টক ({product.stock} টি অবশিষ্ট)</span>
              </div>

              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-xl font-bold text-stone-950">
                  {formatBDT(currentPrice, language === 'bn')}
                </span>
                {product.salePrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatBDT(product.price, language === 'bn')}
                  </span>
                )}
                {product.discount && (
                  <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded">
                    -{product.discount}% OFF
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 mt-3 line-clamp-3 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Variation Pickers */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              {/* Color Selection */}
              <div>
                <span className="text-xs font-semibold text-stone-800 block mb-1.5">
                  রং নির্বাচন করুন: <span className="font-normal text-stone-500">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all ${
                        selectedColor === color
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-stone-300"
                        style={{ backgroundColor: product.colorCodes?.[idx] || '#888' }}
                      />
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <span className="text-xs font-semibold text-stone-800 block mb-1.5">
                  সাইজ নির্বাচন করুন: <span className="font-normal text-stone-500">{selectedSize}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-10 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedSize === size
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={added}
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {added ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingBag className="w-4 h-4 text-amber-300" />}
                  <span>{added ? 'ব্যাগে যোগ হয়েছে!' : 'কার্টে যোগ করুন'}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`px-3 py-3 rounded-xl border flex items-center justify-center transition-colors ${
                    inWishlist ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-600' : ''}`} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>সরাসরি অর্ডার করুন (Buy Now)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/product/${product.slug}`);
                }}
                className="w-full text-center text-xs text-stone-500 hover:text-stone-900 underline pt-1"
              >
                সম্পূর্ণ বিবরণ ও রিভিউ দেখুন →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
