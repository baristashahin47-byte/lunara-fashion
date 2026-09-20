import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  ShoppingBag, 
  Truck, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Printer, 
  Share2 
} from 'lucide-react';
import { Order } from '../types.js';
import { fetchOrderById } from '../lib/api.js';
import { formatBDT } from '../lib/utils.js';
import { OrderTimeline } from '../components/OrderTimeline.js';
import { useSettings } from '../context/SettingsContext.js';

interface OrderSuccessPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, navigate }) => {
  const { settings, language } = useSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await fetchOrderById(orderId);
        setOrder(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-8 font-bangla text-center">
        <h2 className="text-xl font-bold text-stone-900">অর্ডারটি পাওয়া যায়নি</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          হোমে ফিরে যান
        </button>
      </div>
    );
  }

  const addressObj = typeof order.shippingAddress === 'object' && order.shippingAddress !== null
    ? order.shippingAddress
    : {
        fullName: order.customerName,
        fullAddress: String(order.shippingAddress || ''),
        district: order.district || 'Dhaka',
        division: order.division || 'Dhaka',
        phone: order.customerPhone
      };

  const discountVal = order.discount ?? order.discountAmount ?? 0;
  const grandTotalVal = order.totalAmount ?? order.grandTotal ?? 0;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-14 font-bangla">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-10 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            অর্ডার সফলভাবে সম্পন্ন হয়েছে
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-stone-900">
            ধন্যবাদ, {order.customerName}!
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমাদের কাস্টমার প্রতিনিধি শীঘ্রই ফোন দিয়ে অর্ডারটি কনফার্ম করবেন।
          </p>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 inline-block text-left text-xs space-y-1">
            <div className="flex items-center gap-4">
              <span className="text-stone-500">অর্ডার নম্বর (Tracking ID):</span>
              <span className="font-mono font-bold text-amber-900 text-sm">{order.id}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-stone-500">পেমেন্ট মেথড:</span>
              <span className="font-semibold text-stone-800">
                {order.paymentMethod === 'COD' || order.paymentMethod === 'CASH_ON_DELIVERY' ? 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা দিন)' : order.paymentMethod}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="pt-6 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">
              অর্ডারের বর্তমান অবস্থা
            </h3>
            <OrderTimeline currentStatus={order.status} history={order.statusHistory} />
          </div>

          {/* Shipping Details */}
          <div className="pt-6 border-t border-stone-100 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-stone-50 rounded-xl">
              <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-700" />
                <span>ডেলিভারি ঠিকানা</span>
              </h4>
              <p className="font-semibold text-stone-800">{addressObj.fullName}</p>
              <p className="text-stone-600 mt-0.5">{addressObj.fullAddress}</p>
              <p className="text-stone-600">
                {addressObj.district}, {addressObj.division}
              </p>
              <p className="text-stone-600 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-stone-400" />
                <span>{addressObj.phone}</span>
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl">
              <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-700" />
                <span>ডেলিভারি তথ্য</span>
              </h4>
              <p className="text-stone-600">
                জোন: <strong className="text-stone-800">{order.deliveryZone}</strong>
              </p>
              <p className="text-stone-600 mt-0.5">
                আনুমানিক সময়: <strong className="text-stone-800">২৪ থেকে ৭২ ঘণ্টা</strong>
              </p>
              <p className="text-stone-600 mt-1">
                ডেলিভারি চার্জ: <strong className="text-stone-800 font-sans">{formatBDT(order.deliveryFee)}</strong>
              </p>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="pt-6 border-t border-stone-100 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              অর্ডারের পোশাকসমূহ ({order.items.length} টি)
            </h4>
            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => {
                const itemPrice = item.price ?? item.unitPrice ?? 0;
                return (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-14 object-cover object-top rounded-lg bg-stone-100"
                      />
                      <div>
                        <h5 className="font-semibold text-stone-900">{item.productNameBn || item.productName}</h5>
                        <span className="text-[11px] text-stone-500">
                          সাইজ: {item.size} | রং: {item.color} | Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 font-sans">
                      {formatBDT(itemPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total Summary */}
            <div className="pt-4 mt-2 border-t border-stone-200 space-y-1.5 text-xs text-stone-600 text-right">
              <p>সাবটোটাল: <span className="font-sans font-bold text-stone-800">{formatBDT(order.subtotal)}</span></p>
              {discountVal > 0 && (
                <p className="text-emerald-700">কুপন ডিসকাউন্ট: <span className="font-sans font-bold">-{formatBDT(discountVal)}</span></p>
              )}
              <p>ডেলিভারি চার্জ: <span className="font-sans font-bold text-stone-800">{formatBDT(order.deliveryFee)}</span></p>
              <p className="text-sm font-bold text-stone-950 pt-1">
                সর্বমোট ক্যাশ অন ডেলিভারি বিল: <span className="font-sans text-amber-900 text-base">{formatBDT(grandTotalVal)}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-stone-100 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>রসিদ প্রিন্ট করুন</span>
            </button>

            <button
              onClick={() => navigate('/track-order')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Truck className="w-4 h-4" />
              <span>লাইভ অর্ডার ট্র্যাক করুন</span>
            </button>

            <button
              onClick={() => navigate('/shop')}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-amber-200" />
              <span>আরও কেনাকাটা করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
