import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  ArrowRight, 
  MapPin, 
  User as UserIcon, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { createOrderApi } from '../lib/api.js';
import { BD_DIVISIONS, BD_DISTRICTS, getDeliveryZone, formatBDT } from '../lib/utils.js';
import { DeliveryZone } from '../types.js';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { 
    items, 
    clearCart, 
    subtotal, 
    discountAmount, 
    appliedCoupon, 
    deliveryFee, 
    grandTotal, 
    deliveryZone, 
    setDeliveryZone 
  } = useCart();

  const { user } = useAuth();
  const { language } = useSettings();

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka City');
  const [upazila, setUpazila] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD'>('COD');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available districts based on division
  const currentDistricts = BD_DISTRICTS[division] || ['Dhaka City'];

  // Update district when division changes
  useEffect(() => {
    if (!currentDistricts.includes(district)) {
      setDistrict(currentDistricts[0]);
    }
  }, [division]);

  // Recalculate delivery zone whenever district changes
  useEffect(() => {
    const zone = getDeliveryZone(division, district);
    setDeliveryZone(zone);
  }, [division, district, setDeliveryZone]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 px-4 font-bangla text-center">
        <h2 className="text-xl font-bold text-stone-900">চেকআউট করার জন্য আপনার কার্ট খালি</h2>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          শপে ফিরে যান
        </button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate phone number
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 01712345678)');
      return;
    }

    if (!fullAddress.trim()) {
      setErrorMessage('সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা নং, রোড নং, এলাকা) আবশ্যক');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        userId: user?.id,
        customerName: customerName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        shippingAddress: {
          fullName: customerName.trim(),
          phone: phone.trim(),
          altPhone: altPhone.trim() || undefined,
          division,
          district,
          upazila: upazila.trim() || undefined,
          fullAddress: fullAddress.trim(),
          deliveryZone
        },
        items: items.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          productNameBn: item.product.nameBn,
          productImage: item.product.images[0],
          size: item.size,
          color: item.color,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        deliveryFee,
        totalAmount: grandTotal,
        deliveryZone,
        paymentMethod: paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : paymentMethod,
        orderNotes: orderNotes.trim() || undefined
      };

      const order = await createOrderApi(orderPayload);
      clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 font-bangla">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-stone-900">
            অর্ডার চেকআউট (Order Checkout)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            ক্যাশ অন ডেলিভারি সুবিধা | সারা বাংলাদেশে বিশ্বস্ত ডেলিভারি
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer & Address Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Customer Information */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <UserIcon className="w-4 h-4 text-amber-800" />
                <h2 className="text-sm font-bold text-stone-900">
                  ১. গ্রাহকের তথ্য (Customer Details)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    আপনার পূর্ণ নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="যেমন: সুমাইয়া হক"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    মোবাইল নম্বর (১১ ডিজিট) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    বিকল্প মোবাইল নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="জরুরী প্রয়োজনে আরেকটি নম্বর"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    ইমেইল ঠিকানা (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="invoice@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address & BD Logistics */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <MapPin className="w-4 h-4 text-amber-800" />
                <h2 className="text-sm font-bold text-stone-900">
                  ২. ডেলিভারি ঠিকানা (Shipping Address)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Division */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    বিভাগ (Division) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  >
                    <option value="Dhaka">ঢাকা বিভাগ (Dhaka)</option>
                    <option value="Chattogram">চট্টগ্রাম বিভাগ (Chattogram)</option>
                    <option value="Rajshahi">রাজশাহী বিভাগ (Rajshahi)</option>
                    <option value="Khulna">খুলনা বিভাগ (Khulna)</option>
                    <option value="Barishal">বরিশাল বিভাগ (Barishal)</option>
                    <option value="Sylhet">সিলেট বিভাগ (Sylhet)</option>
                    <option value="Rangpur">রংপুর বিভাগ (Rangpur)</option>
                    <option value="Mymensingh">ময়মনসিংহ বিভাগ (Mymensingh)</option>
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    জেলা (District) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  >
                    {currentDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Upazila / Thana */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    থানা / উপজেলা / এরিয়া (Police Station / Area)
                  </label>
                  <input
                    type="text"
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    placeholder="যেমন: গুলশান-১ / মিরপুর-১০ / কোতোয়ালী"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  />
                </div>

                {/* Full Address */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    সম্পূর্ণ ঠিকানা (বাসা/ফ্ল্যাট নম্বর, রোড, এলাকা) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="যেমন: ফ্ল্যাট ৪বি, বাড়ি ১২, রোড ২৩, ব্লক বি, ধানমন্ডি, ঢাকা"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  />
                </div>

                {/* Order Notes */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    ডেলিভারি সংক্রান্ত বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="যেমন: কল দিয়ে আসবেন, বা বিকেলে ডেলিভারি দিন"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              {/* Delivery Zone Notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs flex items-center justify-between text-amber-900">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-700" />
                  <span>নির্ধারিত ডেলিভারি জোন: <strong>{deliveryZone === 'DHAKA_CITY' ? 'ঢাকা মেট্রো সিটি' : deliveryZone === 'SUB_DHAKA' ? 'ঢাকার পার্শ্ববর্তী' : 'ঢাকার বাইরে'}</strong></span>
                </div>
                <span className="font-bold text-amber-950 font-sans">{formatBDT(deliveryFee)}</span>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <CreditCard className="w-4 h-4 text-amber-800" />
                <h2 className="text-sm font-bold text-stone-900">
                  ৩. পেমেন্ট পদ্ধতি (Payment Method)
                </h2>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-stone-900 bg-stone-50/70 ring-1 ring-stone-900'
                    : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 accent-stone-900"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">
                        ক্যাশ অন ডেলিভারি (Cash on Delivery)
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        জনপ্রিয়
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      পণ্য হাতে পেয়ে চেক করে ডেলিভারিম্যানকে ক্যাশ টাকা পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।
                    </p>
                  </div>
                </label>

                {/* bKash (Ready architecture) */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'BKASH'
                    ? 'border-[#E2136E] bg-pink-50/30 ring-1 ring-[#E2136E]'
                    : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'BKASH'}
                    onChange={() => setPaymentMethod('BKASH')}
                    className="mt-1 accent-[#E2136E]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">
                        বিকাশ পেমেন্ট (bKash Payment)
                      </span>
                      <span className="bg-[#E2136E] text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                        bKash
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      অর্ডার করার পর আমাদের মার্চেন্ট বিকাশ নম্বরে পেমেন্ট করতে পারবেন।
                    </p>
                  </div>
                </label>

                {/* Nagad */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'NAGAD'
                    ? 'border-[#F7921E] bg-orange-50/30 ring-1 ring-[#F7921E]'
                    : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'NAGAD'}
                    onChange={() => setPaymentMethod('NAGAD')}
                    className="mt-1 accent-[#F7921E]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">
                        নগদ পেমেন্ট (Nagad Payment)
                      </span>
                      <span className="bg-[#F7921E] text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                        Nagad
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      নগদ অ্যাপ বা ইউএসএসডি কোড ব্যবহার করে নিরাপদে পেমেন্ট করুন।
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary & Submit Action */}
          <div className="space-y-4">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4 sticky top-24">
              <h3 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100">
                অর্ডার সারাংশ ({items.length} টি আইটেম)
              </h3>

              {/* Items Mini List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-stone-100">
                {items.map((it) => (
                  <div key={it.id} className="pt-2.5 first:pt-0 flex gap-3 items-center">
                    <img
                      src={it.product.images[0]}
                      alt={it.product.name}
                      className="w-12 h-14 object-cover object-top rounded-lg bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-stone-800 truncate">
                        {language === 'bn' && it.product.nameBn ? it.product.nameBn : it.product.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                        <span>{it.size}</span>
                        <span>•</span>
                        <span>{it.color}</span>
                        <span>•</span>
                        <span>Qty: {it.quantity}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-stone-900 font-sans shrink-0">
                      {formatBDT(it.price * it.quantity, language === 'bn')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-stone-200 space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>সাবটোটাল</span>
                  <span className="font-semibold text-stone-900 font-sans">{formatBDT(subtotal, language === 'bn')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>কুপন ডিসকাউন্ট ({appliedCoupon?.code})</span>
                    <span className="font-sans">-{formatBDT(discountAmount, language === 'bn')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ ({deliveryZone === 'DHAKA_CITY' ? 'ঢাকা' : 'ঢাকার বাইরে'})</span>
                  <span className="font-semibold text-stone-900 font-sans">{formatBDT(deliveryFee, language === 'bn')}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm sm:text-base font-bold text-stone-950">
                  <span>সর্বমোট প্রদেয় বিল</span>
                  <span className="text-amber-900 font-sans">{formatBDT(grandTotal, language === 'bn')}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-stone-950 hover:bg-amber-950 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all font-bangla"
              >
                {isSubmitting ? (
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                ) : (
                  <>
                    <span>অর্ডার কনফার্ম করুন (৳{grandTotal.toLocaleString('en-IN')})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 flex flex-col gap-1 text-[11px] text-stone-500 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>কোনো অগ্রিম টাকা দিতে হবে না</span>
                </div>
                <p>পণ্য পৌঁছানোর পর দেখে পেমেন্ট করুন</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
