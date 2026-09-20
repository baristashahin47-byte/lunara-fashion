import React, { useState } from 'react';
import { Search, Truck, MapPin, Phone, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Order } from '../types.js';
import { fetchOrders, fetchOrderById } from '../lib/api.js';
import { OrderTimeline } from '../components/OrderTimeline.js';
import { formatBDT } from '../lib/utils.js';

interface TrackOrderPageProps {
  navigate: (path: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ navigate }) => {
  const [query, setQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setNotFound(false);
    setSearchedOrder(null);

    try {
      const trimmed = query.trim();
      // First attempt direct ID fetch
      try {
        const direct = await fetchOrderById(trimmed);
        if (direct) {
          setSearchedOrder(direct);
          return;
        }
      } catch {
        // Fallback to searching all orders by phone or partial ID
      }

      const all = await fetchOrders();
      const match = all.find(o => {
        const addrPhone = typeof o.shippingAddress === 'object' && o.shippingAddress !== null
          ? o.shippingAddress.phone
          : '';
        return (
          o.id.toLowerCase() === trimmed.toLowerCase() ||
          o.customerPhone.includes(trimmed) ||
          addrPhone.includes(trimmed)
        );
      });

      if (match) {
        setSearchedOrder(match);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-14 font-bangla">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-bold">
            লাইভ ট্র্যাকিং সিস্টেম
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-stone-900">
            আপনার অর্ডারের বর্তমান অবস্থা জানুন
          </h1>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            অর্ডার নিশ্চিতকরণ এসএমএসে পাঠানো Tracking ID (যেমন: LN-1001) অথবা মোবাইল নম্বর দিয়ে সার্চ করুন।
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs mb-8">
          <form onSubmit={handleTrack} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="অর্ডার নম্বর (LN-...) অথবা মোবাইল নম্বর"
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800 uppercase"
                required
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-stone-900 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-xs"
            >
              {loading ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
            </button>
          </form>

          {/* Quick Demo ID helper */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-500">
            <span>পরীক্ষার জন্য ব্যবহার করুন:</span>
            <button
              type="button"
              onClick={() => setQuery('LN-1001')}
              className="text-amber-800 font-semibold underline"
            >
              LN-1001
            </button>
            <span>বা</span>
            <button
              type="button"
              onClick={() => setQuery('LN-1002')}
              className="text-amber-800 font-semibold underline"
            >
              LN-1002
            </button>
          </div>
        </div>

        {/* Not Found state */}
        {notFound && (
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center text-xs text-rose-800 space-y-2">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <p className="font-bold">দুঃখিত! এই নম্বরে কোনো অর্ডার খুঁজে পাওয়া যায়নি।</p>
            <p className="text-stone-500 text-[11px]">
              অনুগ্রহ করে সঠিক অর্ডার আইডি বা মোবাইল নম্বর দিয়ে পুনরায় চেষ্টা করুন। যেকোনো প্রয়োজনে কল করুন {formatBDT(0)}
            </p>
          </div>
        )}

        {/* Order Details View */}
        {searchedOrder && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
              <div>
                <span className="text-[11px] text-stone-400 uppercase font-semibold">অর্ডার ট্র্যাকিং আইডি</span>
                <h3 className="text-lg font-bold font-mono text-amber-950">{searchedOrder.id}</h3>
              </div>
              <div className="sm:text-right">
                <span className="text-[11px] text-stone-400 block">অর্ডার তারিখ</span>
                <span className="text-xs font-semibold text-stone-800">
                  {new Date(searchedOrder.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            {/* Visual Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">
                ডেলিভারি ট্র্যাকিং স্ট্যাটাস
              </h4>
              <OrderTimeline currentStatus={searchedOrder.status} history={searchedOrder.statusHistory} />
            </div>

            {/* Recipient & Destination Info */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-stone-400 block mb-1">গ্রাহকের নাম ও ঠিকানা:</span>
                <p className="font-bold text-stone-900">{searchedOrder.customerName}</p>
                <p className="text-stone-600">
                  {typeof searchedOrder.shippingAddress === 'object' && searchedOrder.shippingAddress !== null
                    ? searchedOrder.shippingAddress.fullAddress
                    : String(searchedOrder.shippingAddress || '')}
                </p>
                <p className="text-stone-600">
                  {typeof searchedOrder.shippingAddress === 'object' && searchedOrder.shippingAddress !== null
                    ? `${searchedOrder.shippingAddress.district}, ${searchedOrder.shippingAddress.division}`
                    : `${searchedOrder.district || ''}, ${searchedOrder.division || ''}`}
                </p>
              </div>

              <div>
                <span className="text-stone-400 block mb-1">পেমেন্ট ও ডেলিভারি:</span>
                <p className="text-stone-700">মেথড: <strong>ক্যাশ অন ডেলিভারি (COD)</strong></p>
                <p className="text-stone-700">পেমেন্ট স্ট্যাটাস: <strong>{searchedOrder.paymentStatus}</strong></p>
                <p className="text-stone-700">
                  প্রদেয় বিল: <strong className="font-sans text-amber-900 font-bold">
                    {formatBDT(searchedOrder.totalAmount ?? searchedOrder.grandTotal ?? 0)}
                  </strong>
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                অর্ডারের আইটেম ({searchedOrder.items.length})
              </h5>
              <div className="divide-y divide-stone-100">
                {searchedOrder.items.map((it, idx) => {
                  const itemPrice = it.price ?? it.unitPrice ?? 0;
                  return (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img src={it.productImage} alt="" className="w-10 h-12 object-cover rounded bg-stone-100" />
                        <div>
                          <span className="font-semibold text-stone-900">{it.productNameBn || it.productName}</span>
                          <span className="text-[11px] text-stone-500 block">
                            সাইজ: {it.size} | কালার: {it.color} | Qty: {it.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold font-sans text-stone-900">
                        {formatBDT(itemPrice * it.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
