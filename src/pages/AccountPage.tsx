import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Package, 
  MapPin, 
  LogOut, 
  Clock, 
  Truck, 
  ChevronRight, 
  ShieldCheck, 
  Edit3, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { fetchOrders } from '../lib/api.js';
import { Order } from '../types.js';
import { formatBDT } from '../lib/utils.js';

interface AccountPageProps {
  navigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ navigate }) => {
  const { user, logout, updateProfile, isAdmin, quickDemoLogin } = useAuth();
  const { language } = useSettings();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile edit
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    async function loadUserOrders() {
      setLoadingOrders(true);
      try {
        const data = await fetchOrders(user?.id);
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadUserOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 px-4 font-bangla text-center">
        <div className="max-w-md mx-auto bg-white p-8 sm:p-10 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 font-serif-luxury">
            লুনারা একাউন্টে সাইন ইন করুন
          </h2>
          <p className="text-xs text-stone-500">
            আপনার পূর্ববর্তী অর্ডারের হিস্ট্রি দেখতে এবং দ্রুত চেকআউটের জন্য লগইন করুন।
          </p>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
            >
              লগইন / রেজিস্টার করুন
            </button>

            <div className="pt-3 border-t border-stone-100">
              <span className="text-[11px] text-stone-400 block mb-2">দ্রুত পরীক্ষা করার জন্য:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => quickDemoLogin('CUSTOMER')}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold text-stone-800"
                >
                  Customer Demo
                </button>
                <button
                  onClick={() => quickDemoLogin('ADMIN')}
                  className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-xs font-semibold text-purple-800"
                >
                  Admin Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile({ name: editName, phone: editPhone });
    setSavingProfile(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12 font-bangla">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* User Greeting Bar */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xl border border-amber-200">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900 font-serif-luxury">{user.name}</h1>
                {isAdmin && (
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{user.email} {user.phone && `• ${user.phone}`}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                এডমিন প্যানেল প্রবেশ
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs h-fit text-xs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'orders' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>আমার অর্ডারসমূহ ({orders.length})</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'profile' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-4 h-4" />
                <span>প্রোফাইল পরিবর্তন</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'addresses' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4" />
                <span>সংরক্ষিত ডেলিভারি ঠিকানা</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* 1. Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-stone-900">
                  অর্ডারের বিবরণ ও ট্র্যাকিং
                </h2>

                {loadingOrders ? (
                  <div className="p-8 text-center text-xs text-stone-400">অর্ডার লোড হচ্ছে...</div>
                ) : orders.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-3">
                    <p className="text-xs text-stone-500">আপনার একাউন্টে কোনো অর্ডার পাওয়া যায়নি।</p>
                    <button
                      onClick={() => navigate('/shop')}
                      className="px-5 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
                    >
                      কেনাকাটা শুরু করুন
                    </button>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div key={ord.id} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 text-xs gap-2">
                        <div>
                          <span className="font-mono font-bold text-amber-900">{ord.id}</span>
                          <span className="text-stone-400 block text-[11px]">
                            তারিখ: {new Date(ord.createdAt).toLocaleDateString('bn-BD', { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            ord.status === 'DELIVERED' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : ord.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                          <button
                            onClick={() => navigate(`/order-success/${ord.id}`)}
                            className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold"
                          >
                            বিস্তারিত দেখুন
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-stone-100">
                        {ord.items.map((it, i) => {
                          const itemPrice = it.price ?? it.unitPrice ?? 0;
                          return (
                            <div key={i} className="py-2 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                <img src={it.productImage} alt="" className="w-10 h-12 object-cover rounded bg-stone-100" />
                                <div>
                                  <span className="font-semibold text-stone-900">{it.productNameBn || it.productName}</span>
                                  <span className="text-[11px] text-stone-400 block">
                                    {it.size} | {it.color} | Qty: {it.quantity}
                                  </span>
                                </div>
                              </div>
                              <span className="font-bold font-sans text-stone-900">{formatBDT(itemPrice * it.quantity)}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-stone-500">পেমেন্ট: {ord.paymentMethod}</span>
                        <span className="font-bold text-stone-900">
                          সর্বমোট: <strong className="font-sans text-amber-900">{formatBDT(ord.totalAmount ?? ord.grandTotal ?? 0)}</strong>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-stone-900">প্রোফাইল তথ্য আপডেট</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">পূর্ণ নাম</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">মোবাইল নম্বর</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">ইমেইল (লগইন আইডি)</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-500 cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
                  >
                    {savingProfile ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল সংরক্ষণ করুন'}
                  </button>

                  {profileSuccess && (
                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!</span>
                    </p>
                  )}
                </form>
              </div>
            )}

            {/* 3. Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-stone-900">ডেলিভারি ঠিকানা সমূহ</h2>
                {user.addresses && user.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <div key={addr.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                        <span className="font-bold text-stone-900 block">{addr.fullName}</span>
                        <p className="text-stone-600">{addr.fullAddress}</p>
                        <p className="text-stone-600">{addr.district}, {addr.division}</p>
                        <p className="text-stone-600">ফোন: {addr.phone}</p>
                        {addr.isDefault && (
                          <span className="mt-2 inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            ডিফল্ট ঠিকানা
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">কোনো সংরক্ষিত ঠিকানা নেই। পরবর্তী চেকআউটের সময় ঠিকানা স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
