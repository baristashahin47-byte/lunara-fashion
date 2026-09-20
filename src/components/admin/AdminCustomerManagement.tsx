import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  MapPin, 
  X, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { formatBDT } from '../../lib/utils.js';
import { fetchAdminCustomerDetails } from '../../lib/api.js';
import { Order } from '../../types.js';

interface AdminCustomerManagementProps {
  customers: any[];
  onSelectOrder: (order: Order) => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminCustomerManagement: React.FC<AdminCustomerManagementProps> = ({
  customers,
  onSelectOrder,
  showToast
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const handleOpenCustomer = async (c: any) => {
    setLoadingDetails(true);
    setSelectedCustomer(c);
    try {
      const details = await fetchAdminCustomerDetails(c.id);
      setSelectedCustomer(details);
    } catch (err: any) {
      // fallback to existing object
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intl = cleanPhone.startsWith('880') ? cleanPhone : cleanPhone.startsWith('0') ? `88${cleanPhone}` : `880${cleanPhone}`;
    window.open(`https://wa.me/${intl}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900">
            Customer Directory ({customers.length})
          </h2>
          <p className="text-xs text-stone-500">
            Registered shopper profiles, order counts, lifetime value & shipping addresses
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, phone number or email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
        />
      </div>

      {/* Customer Cards (Mobile-first) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            onClick={() => handleOpenCustomer(cust)}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-400 transition-colors cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 font-bold flex items-center justify-center text-sm border border-amber-200">
                  {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                  Joined {new Date(cust.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-stone-900">{cust.name}</h3>
                <p className="text-xs text-stone-500 truncate">{cust.email}</p>
                {cust.phone && (
                  <p className="text-xs text-stone-600 font-mono mt-0.5">{cust.phone}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Orders</span>
                <span className="font-bold text-stone-900">{cust.orderCount || 0}</span>
              </div>
              <div className="text-right">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Total Spent</span>
                <span className="font-bold text-amber-700">{formatBDT(cust.totalSpent || 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CUSTOMER DETAILS MODAL / DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-base">
                  {selectedCustomer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-stone-500">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] text-stone-500 uppercase font-semibold block">Total Orders</span>
                <span className="text-xl font-bold text-stone-900">{selectedCustomer.orderCount || 0} orders</span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] text-amber-800 uppercase font-semibold block">Total Lifetime Value</span>
                <span className="text-xl font-bold text-amber-900">{formatBDT(selectedCustomer.totalSpent || 0)}</span>
              </div>
            </div>

            {/* Contact Actions */}
            {selectedCustomer.phone && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-500" />
                  <span className="font-mono font-bold text-stone-800">{selectedCustomer.phone}</span>
                </div>
                <button
                  onClick={() => handleOpenWhatsApp(selectedCustomer.phone)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            )}

            {/* Customer Saved Addresses */}
            {selectedCustomer.addresses?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Saved Delivery Addresses</span>
                </h4>
                <div className="space-y-2">
                  {selectedCustomer.addresses.map((addr: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl border border-stone-200 text-xs bg-stone-50/50">
                      <span className="font-bold text-stone-800">{addr.street}</span>
                      <p className="text-stone-500 mt-0.5">{addr.district}, {addr.division}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order History */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-stone-700" />
                <span>Order History</span>
              </h4>
              {selectedCustomer.orders?.length > 0 ? (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden text-xs">
                  {selectedCustomer.orders.map((ord: Order) => (
                    <div
                      key={ord.id}
                      onClick={() => {
                        setSelectedCustomer(null);
                        onSelectOrder(ord);
                      }}
                      className="p-3 flex items-center justify-between hover:bg-stone-50 cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{ord.orderNumber}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString('en-GB')} • {ord.items.length} items
                        </p>
                      </div>
                      <span className="font-bold text-stone-900">{formatBDT(ord.grandTotal)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 py-3 text-center">No previous orders placed yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
