import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag, 
  XCircle, 
  Phone, 
  MapPin, 
  Calendar, 
  X, 
  CreditCard,
  Send,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { Order, OrderStatus } from '../../types.js';
import { formatBDT } from '../../lib/utils.js';
import { updateOrderStatusApi } from '../../lib/api.js';

interface AdminOrderManagementProps {
  orders: Order[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
  initialSelectedOrder?: Order | null;
}

export const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({
  orders,
  onRefresh,
  showToast,
  initialSelectedOrder = null
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(initialSelectedOrder);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PENDING');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase().trim();
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
      o.trackingNumber.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || o.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  }).sort((a, b) => {
    if (sortOption === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortOption === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortOption === 'highest') return (b.grandTotal || 0) - (a.grandTotal || 0);
    if (sortOption === 'lowest') return (a.grandTotal || 0) - (b.grandTotal || 0);
    return 0;
  });

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatusApi(selectedOrder.id, newStatus, statusNote);
      showToast(`Order ${selectedOrder.orderNumber} status updated to ${newStatus}`);
      setSelectedOrder(updated);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // WhatsApp quick trigger
  const handleOpenWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const international = cleanPhone.startsWith('880') ? cleanPhone : cleanPhone.startsWith('0') ? `88${cleanPhone}` : `880${cleanPhone}`;
    window.open(`https://wa.me/${international}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const renderAddressText = (addr: any): string => {
    if (!addr) return 'N/A';
    if (typeof addr === 'string') return addr;
    return `${addr.fullAddress || ''}, ${addr.upazila ? addr.upazila + ', ' : ''}${addr.district || ''}, ${addr.division || ''}`.trim();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900">
            Order Management ({orders.length})
          </h2>
          <p className="text-xs text-stone-500">
            Real-time customer orders, automated SMS tracking, delivery zone routing & courier dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            Pending: {orders.filter(o => o.status === 'PENDING').length}
          </span>
          <span className="text-xs font-medium px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
            Confirmed: {orders.filter(o => o.status === 'CONFIRMED').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, Name, Phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Statuses ({orders.length})</option>
            <option value="PENDING">Pending Orders</option>
            <option value="CONFIRMED">Confirmed Orders</option>
            <option value="PROCESSING">Processing Orders</option>
            <option value="SHIPPED">Shipped Orders</option>
            <option value="DELIVERED">Delivered Orders</option>
            <option value="CANCELLED">Cancelled Orders</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="BKASH">bKash Online</option>
            <option value="NAGAD">Nagad Online</option>
            <option value="CARD">Debit / Credit Card</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="highest">Sort: Highest Order Value</option>
            <option value="lowest">Sort: Lowest Order Value</option>
          </select>
        </div>
      </div>

      {/* Orders List (Mobile-First Cards + Responsive Grid) */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No orders found matching the filter.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const statusColors: Record<string, string> = {
              PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
              CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
              PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
              SHIPPED: 'bg-sky-100 text-sky-800 border-sky-200',
              DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200'
            };

            return (
              <div
                key={ord.id}
                onClick={() => handleOpenDetail(ord)}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: ID & Customer */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-stone-900">{ord.orderNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[ord.status] || 'bg-stone-100 text-stone-700'}`}>
                      {ord.status}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 uppercase">
                      {ord.paymentMethod}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-stone-800">
                    {ord.customerName} • <span className="text-stone-500 font-normal">{ord.customerPhone}</span>
                  </p>

                  <p className="text-[11px] text-stone-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0 text-stone-400" />
                    <span>{renderAddressText(ord.shippingAddress)}</span>
                  </p>
                </div>

                {/* Right: Items Count, Date & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <div>
                    <span className="text-sm font-bold text-stone-900 block">{formatBDT(ord.grandTotal)}</span>
                    <span className="text-[11px] text-stone-500">
                      {ord.items.length} item{ord.items.length > 1 ? 's' : ''} • {new Date(ord.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(ord);
                    }}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-amber-100 hover:text-amber-800 text-stone-600 transition-colors"
                    title="View Order Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAILED ORDER MODAL / DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 font-serif-luxury">
                    Order {selectedOrder.orderNumber}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-GB')}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Update Section */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Update Order Status & Dispatch Courier
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>

                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Optional status note (e.g. Courier handed)"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />

                <button
                  type="button"
                  disabled={updating}
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {updating ? 'Updating...' : 'Save & Trigger SMS'}
                </button>
              </div>

              <p className="text-[11px] text-stone-500">
                Tracking Number: <code className="font-mono bg-stone-200 px-1 py-0.5 rounded text-stone-800">{selectedOrder.trackingNumber}</code>
              </p>
            </div>

            {/* Customer Details & Shipping Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200 space-y-2 text-xs">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Customer Information</span>
                </h4>
                <p><span className="text-stone-500">Name:</span> <strong>{selectedOrder.customerName}</strong></p>
                <p className="flex items-center gap-2">
                  <span className="text-stone-500">Phone:</span> 
                  <strong className="font-mono">{selectedOrder.customerPhone}</strong>
                  <button
                    onClick={() => handleOpenWhatsApp(selectedOrder.customerPhone, `Hi ${selectedOrder.customerName}, regarding your order ${selectedOrder.orderNumber} on Lunara Fashion:`)}
                    className="p-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    title="Message on WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </p>
                {selectedOrder.customerEmail && (
                  <p><span className="text-stone-500">Email:</span> {selectedOrder.customerEmail}</p>
                )}
                <p><span className="text-stone-500">Payment:</span> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200 space-y-2 text-xs">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Delivery Address</span>
                </h4>
                <p className="leading-relaxed">{renderAddressText(selectedOrder.shippingAddress)}</p>
                <p><span className="text-stone-500">Zone:</span> {selectedOrder.deliveryZone}</p>
                <p><span className="text-stone-500">District:</span> {selectedOrder.district || 'N/A'}, {selectedOrder.division || 'N/A'}</p>
                {selectedOrder.deliveryNote && (
                  <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 text-[11px]">
                    Note: {selectedOrder.deliveryNote}
                  </p>
                )}
              </div>
            </div>

            {/* Items Ordered */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                Ordered Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                {selectedOrder.items.map((itm, i) => (
                  <div key={i} className="p-3 flex items-center justify-between text-xs hover:bg-stone-50">
                    <div className="flex items-center gap-3 min-w-0">
                      {itm.productImage && (
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                          <img src={itm.productImage} alt={itm.productName} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 truncate">{itm.productName}</p>
                        <p className="text-[11px] text-stone-500">
                          {itm.size && `Size: ${itm.size}`} {itm.color && `• Color: ${itm.color}`} • Qty: {itm.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 whitespace-nowrap pl-2">
                      {formatBDT((itm.price || itm.unitPrice || 0) * itm.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Calculation Summary */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatBDT(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge</span>
                <span>{formatBDT(selectedOrder.deliveryFee)}</span>
              </div>
              {Number(selectedOrder.discountAmount || selectedOrder.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({selectedOrder.couponCode})</span>
                  <span>-{formatBDT(Number(selectedOrder.discountAmount || selectedOrder.discount || 0))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Grand Total</span>
                <span>{formatBDT(selectedOrder.grandTotal)}</span>
              </div>
            </div>

            {/* Status History Timeline */}
            {selectedOrder.statusHistory?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                  Timeline History
                </h4>
                <div className="space-y-2 border-l-2 border-amber-400 pl-3 ml-2">
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{h.status}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(h.timestamp).toLocaleString('en-GB')}
                        </span>
                      </div>
                      <p className="text-stone-600 text-[11px]">{h.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
