import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { formatBDT } from '../lib/utils.js';
import { DeliveryZone } from '../types.js';

interface CartPageProps {
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal, 
    discountAmount, 
    deliveryFee, 
    grandTotal, 
    deliveryZone, 
    setDeliveryZone,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { language } = useSettings();
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponCode.trim());
    setIsApplying(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 sm:p-12 rounded-2xl border border-stone-200/80 shadow-xs font-bangla space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 font-serif-luxury">
            আপনার শপিং ব্যাগ বর্তমানে খালি
          </h1>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            লুনারা ফ্যাশনের থ্রি-পিস, জামদানি শাড়ি, বোরকা বা কুর্তি কালেকশন থেকে আপনার পছন্দের পোশাক যোগ করুন।
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <span>কেনাকাটা শুরু করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 font-bangla">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-stone-900">
              শপিং ব্যাগ (Shopping Cart)
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              মোট {items.reduce((s, i) => s + i.quantity, 0)} টি পোশাক ব্যাগে রয়েছে
            </p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="hidden sm:flex items-center gap-1.5 text-xs text-amber-900 hover:text-amber-950 font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>আরও কেনাকাটা করুন</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Table / Items Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex gap-4 sm:gap-6 items-center">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-26 sm:w-24 sm:h-32 object-cover object-top rounded-xl bg-stone-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <h3 
                        onClick={() => navigate(`/product/${item.product.slug}`)}
                        className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-amber-900 cursor-pointer truncate"
                      >
                        {language === 'bn' && item.product.nameBn ? item.product.nameBn : item.product.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        title="রিমুভ করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
                      <span className="bg-stone-100 px-2 py-0.5 rounded">
                        সাইজ: {item.size}
                      </span>
                      <span className="bg-stone-100 px-2 py-0.5 rounded">
                        রং: {item.color}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      {/* Stepper */}
                      <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm sm:text-base font-bold text-stone-950 font-sans">
                          {formatBDT(item.price * item.quantity, language === 'bn')}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[11px] text-stone-400 block">
                            ({formatBDT(item.price)} প্রতি পিস)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
              >
                কার্ট খালি করুন
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="sm:hidden text-xs text-stone-600 font-semibold"
              >
                আরও কেনাকাটা করুন →
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-stone-900 pb-2 border-b border-stone-100">
                অর্ডার বিবরণী (Order Summary)
              </h2>

              {/* Delivery Zone Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">
                  ডেলিভারি এলাকা নির্বাচন করুন:
                </label>
                <select
                  value={deliveryZone}
                  onChange={(e) => setDeliveryZone(e.target.value as DeliveryZone)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-stone-800"
                >
                  <option value="DHAKA_CITY">ঢাকা সিটি (৳৭০)</option>
                  <option value="SUB_DHAKA">ঢাকার পার্শ্ববর্তী - সাভার, গাজীপুর, নারায়ণগঞ্জ (৳১০০)</option>
                  <option value="OUTSIDE_DHAKA">ঢাকার বাইরে - সমগ্র বাংলাদেশ (৳১২০)</option>
                </select>
              </div>

              {/* Coupon Form */}
              <div className="pt-2">
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  কুপন বা ভাউচার কোড:
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">{appliedCoupon.code}</span>
                      <span>(-{formatBDT(discountAmount)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-400 hover:text-rose-600 text-xs underline"
                    >
                      বাতিল
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="কুপন লিখুন (যেমন: LUNARA10)"
                      className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
                    >
                      {isApplying ? '...' : 'প্রয়োগ'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>
                )}
              </div>

              {/* Calculation Summary */}
              <div className="pt-3 border-t border-stone-200 space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>পোশাকের মূল্য (সাবটোটাল)</span>
                  <span className="font-semibold text-stone-900 font-sans">{formatBDT(subtotal, language === 'bn')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>কুপন ডিসকাউন্ট</span>
                    <span className="font-sans">-{formatBDT(discountAmount, language === 'bn')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-semibold text-stone-900 font-sans">{formatBDT(deliveryFee, language === 'bn')}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm sm:text-base font-bold text-stone-950">
                  <span>সর্বমোট প্রদেয় বিল</span>
                  <span className="text-amber-900 font-sans">{formatBDT(grandTotal, language === 'bn')}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-stone-950 hover:bg-amber-950 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>অর্ডার চেকআউটে এগিয়ে যান</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে পেমেন্ট)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
