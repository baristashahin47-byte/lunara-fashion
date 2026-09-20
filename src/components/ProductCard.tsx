import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { Product } from '../types.js';
import { formatBDT } from '../lib/utils.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useSettings } from '../context/SettingsContext.js';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { language } = useSettings();

  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Standard');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const currentPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = product.discount || (hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize, product.colors[0] || 'Default', 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.slug}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-xl overflow-hidden border border-stone-200/70 hover:border-stone-400 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
        <img
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {hasDiscount && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-stone-900 text-amber-200 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded tracking-wider shadow-xs">
              {language === 'bn' ? 'নতুন' : 'NEW'}
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-600 text-white text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded tracking-wider shadow-xs">
              {language === 'bn' ? 'বেস্ট সেলার' : 'BEST SELLER'}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs z-10 ${
            inWishlist 
              ? 'bg-rose-50 text-rose-600' 
              : 'bg-white/80 text-stone-700 hover:bg-white hover:text-rose-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600 stroke-rose-600' : ''}`} />
        </button>

        {/* Quick View Action on Hover (Desktop) */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="hidden sm:flex absolute bottom-3 left-3 right-3 bg-white/90 hover:bg-white text-stone-900 py-1.5 px-3 rounded-lg text-xs font-semibold items-center justify-center gap-1.5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md transform translate-y-2 group-hover:translate-y-0"
          >
            <Eye className="w-3.5 h-3.5 text-stone-600" />
            <span>{language === 'bn' ? 'এক ঝলকে দেখুন' : 'Quick View'}</span>
          </button>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-1 text-[11px] text-stone-500 mb-1 font-bangla">
          <span className="truncate">{product.categoryName}</span>
          <div className="flex items-center gap-1 text-amber-500 font-semibold shrink-0">
            <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
            <span className="text-[11px] text-stone-700">{product.rating}</span>
            <span className="text-[10px] text-stone-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-2 leading-snug font-bangla mb-2">
          {language === 'bn' && product.nameBn ? product.nameBn : product.name}
        </h3>

        {/* Color Indicators */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1 mb-2.5">
            {product.colors.slice(0, 3).map((col, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-stone-300"
                style={{ backgroundColor: product.colorCodes?.[idx] || '#ddd' }}
                title={col}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[10px] text-stone-400">+{product.colors.length - 3}</span>
            )}
          </div>
        )}

        {/* Price & Quick Add */}
        <div className="mt-auto pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-stone-900">
              {formatBDT(currentPrice, language === 'bn')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">
                {formatBDT(product.price, language === 'bn')}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${
              addedAnimation 
                ? 'bg-emerald-600 text-white'
                : product.stock <= 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 text-white hover:bg-amber-900'
            }`}
            title={product.stock <= 0 ? 'Stock Out' : 'Add to Bag'}
          >
            {addedAnimation ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
