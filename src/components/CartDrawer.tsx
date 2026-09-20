import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { formatBDT } from '../lib/utils.js';

interface CartDrawerProps {
  navigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const { 
    isDrawerOpen, 
    closeDrawer, 
    items, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    discountAmount, 
    deliveryFee, 
    grandTotal,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { settings, language } = useSettings();
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isDrawerOpen) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponCodeInput.trim());
    setIsApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              <h2 className="font-serif-luxury text-base sm:text-lg font-bold text-stone-900 font-bangla">
                {language === 'bn' ? 'শপিং ব্যাগ' : 'Shopping Bag'}
              </h2>
              <span className="text-xs bg-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button 
              onClick={closeDrawer}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Free Delivery Highlight */}
          <div className="px-5 py-2.5 bg-amber-50/70 border-b border-amber-100/70 text-xs text-amber-900 font-bangla flex items-center justify-between">
            <span>ক্যাশ অন ডেলিভারি (COD) প্রযোজ্য</span>
            <span className="font-semibold text-amber-800">ঢাকা মাত্র ৳৭০</span>
          </div>

          {/* Drawer Body / Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3 text-stone-400">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold text-stone-800 font-bangla">
                  {language === 'bn' ? 'আপনার শপিং ব্যাগ খালি' : 'Your bag is empty'}
                </h3>
                <p className="text-xs text-stone-400 mt-1 max-w-xs font-bangla">
                  {language === 'bn' 
                    ? 'লুনারার নতুন ফ্যাশন কালেকশন থেকে আপনার পছন্দের পোশাক ব্যাগে যোগ করুন।'
                    : 'Discover our latest sarees, 3-pieces, and abayas to fill your bag.'}
                </p>
                <button
                  onClick={() => { closeDrawer(); navigate('/shop'); }}
                  className="mt-5 px-6 py-2.5 bg-stone-900 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold transition-colors font-bangla"
                >
                  {language === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Explore Catalog'}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {items.map((item) => (
                  <div key={item.id} className="py-3.5 flex gap-3.5">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-18 h-22 object-cover object-top rounded-lg bg-stone-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-semibold text-stone-900 truncate font-bangla">
                            {language === 'bn' && item.product.nameBn ? item.product.nameBn : item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 font-bangla">
                          <span className="bg-stone-100 px-1.5 py-0.5 rounded">
                            সাইজ: {item.size}
                          </span>
                          <span className="bg-stone-100 px-1.5 py-0.5 rounded">
                            রং: {item.color}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-stone-200 rounded-md bg-stone-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs sm:text-sm font-bold text-stone-900">
                          {formatBDT(item.price * item.quantity, language === 'bn')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/90 space-y-3 font-bangla">
              {/* Coupon Field */}
              <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 p-2 rounded">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold">{appliedCoupon.code}</span>
                      <span>(-{formatBDT(discountAmount)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-400 hover:text-rose-600 text-[11px] underline"
                    >
                      রিমুভ
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      placeholder="কুপন কোড (যেমন: LUNARA10)"
                      className="flex-1 px-2.5 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:border-stone-800 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-3 py-1.5 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 transition-colors"
                    >
                      {isApplying ? '...' : 'প্রয়োগ'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>সাবটোটাল</span>
                  <span className="font-semibold text-stone-800">{formatBDT(subtotal, language === 'bn')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>কুপন ডিসকাউন্ট</span>
                    <span>-{formatBDT(discountAmount, language === 'bn')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>আনুমানিক ডেলিভারি চার্জ</span>
                  <span className="font-semibold text-stone-800">{formatBDT(deliveryFee, language === 'bn')}</span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between text-sm sm:text-base font-bold text-stone-950">
                  <span>সর্বমোট প্রদেয়</span>
                  <span className="text-amber-900">{formatBDT(grandTotal, language === 'bn')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/checkout');
                  }}
                  className="w-full py-3 bg-stone-950 hover:bg-amber-950 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all font-bangla"
                >
                  <span>অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/cart');
                  }}
                  className="w-full py-2 text-stone-600 hover:text-stone-900 text-xs font-medium text-center font-bangla"
                >
                  সম্পূর্ণ কার্ট দেখুন ও এডিট করুন
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>১০০% নিরাপদ ও ঝামেলাহীন কেনাকাটা</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
