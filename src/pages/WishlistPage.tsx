import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { formatBDT } from '../lib/utils.js';

interface WishlistPageProps {
  navigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ navigate }) => {
  const { items, removeFromWishlist, moveToCart, clearWishlist } = useWishlist();
  const { language } = useSettings();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 px-4 font-bangla text-center">
        <div className="max-w-md mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 font-serif-luxury">
            আপনার পছন্দের তালিকা খালি
          </h1>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            পছন্দের পোশাকের হার্ট (Heart) আইকনে ক্লিক করে পরবর্তীতে কেনার জন্য সংরক্ষণ করে রাখুন।
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 px-6 py-2.5 bg-stone-900 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <span>পোশাক কালেকশন দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12 font-bangla">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-stone-900">
              পছন্দের তালিকা (My Wishlist)
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              মোট {items.length} টি পোশাক সংরক্ষিত আছে
            </p>
          </div>
          <button
            onClick={clearWishlist}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
          >
            সব মুছে ফেলুন
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => {
            const prod = item.product;
            const currentPrice = prod.salePrice ?? prod.price;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs flex flex-col justify-between group"
              >
                <div 
                  onClick={() => navigate(`/product/${prod.slug}`)}
                  className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 cursor-pointer"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(prod.id);
                    }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-rose-600 flex items-center justify-center shadow-xs transition-colors"
                    title="রিমুভ করুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <div>
                    <span className="text-[11px] text-stone-400 block mb-1">{prod.categoryName}</span>
                    <h3 
                      onClick={() => navigate(`/product/${prod.slug}`)}
                      className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-amber-900 cursor-pointer line-clamp-2"
                    >
                      {language === 'bn' && prod.nameBn ? prod.nameBn : prod.name}
                    </h3>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-sm sm:text-base font-bold text-stone-950 font-sans">
                        {formatBDT(currentPrice, language === 'bn')}
                      </span>
                      {prod.salePrice && (
                        <span className="text-xs text-stone-400 line-through font-sans">
                          {formatBDT(prod.price, language === 'bn')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => moveToCart(prod, prod.sizes[0], prod.colors[0])}
                    className="w-full py-2.5 bg-stone-900 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-200" />
                    <span>কার্টে যোগ করুন</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
