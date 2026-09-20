import React, { useState } from 'react';
import { 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Clock, 
  Phone, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { ReturnRequest } from '../../types.js';
import { formatBDT } from '../../lib/utils.js';
import { updateAdminReturnRequest } from '../../lib/api.js';

interface AdminReturnManagementProps {
  returnRequests: ReturnRequest[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminReturnManagement: React.FC<AdminReturnManagementProps> = ({
  returnRequests,
  onRefresh,
  showToast
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED'>('ALL');
  const [adminNoteInput, setAdminNoteInput] = useState<Record<string, string>>({});
  const [refundAmountInput, setRefundAmountInput] = useState<Record<string, number>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = returnRequests.filter(r => {
    const q = search.toLowerCase().trim();
    const matchesSearch = 
      r.orderNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerPhone.includes(q) ||
      r.reason.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED' | 'REFUNDED') => {
    setUpdatingId(id);
    try {
      await updateAdminReturnRequest(id, {
        status,
        adminNotes: adminNoteInput[id],
        refundAmount: refundAmountInput[id]
      });
      showToast(`Return request updated to ${status}`);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update return request', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-600" />
            <span>Return & Refund Management ({returnRequests.length})</span>
          </h2>
          <p className="text-xs text-stone-500">
            Handle size exchanges, parcel return claims and customer refund approvals
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
          Pending Claims: {returnRequests.filter(r => r.status === 'REQUESTED').length}
        </span>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer name or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="ALL">All Statuses ({returnRequests.length})</option>
          <option value="REQUESTED">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REFUNDED">Refunded</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Return Requests List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No return requests found.</p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">Order: {req.orderNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                      req.status === 'REFUNDED' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {req.customerName} • <span className="font-mono">{req.customerPhone}</span> • {new Date(req.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-stone-500 uppercase font-semibold block">Requested Refund</span>
                  <span className="text-sm font-bold text-stone-900">{formatBDT(req.refundAmount)}</span>
                </div>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
                <p className="font-semibold text-stone-900">Reason: {req.reason}</p>
                {req.adminNotes && (
                  <p className="text-amber-800 pt-1 border-t border-stone-200 font-medium">
                    Admin Note: {req.adminNotes}
                  </p>
                )}
              </div>

              {/* Admin Note and Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add note for record or customer..."
                  value={adminNoteInput[req.id] || ''}
                  onChange={(e) => setAdminNoteInput({ ...adminNoteInput, [req.id]: e.target.value })}
                  className="px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />

                <input
                  type="number"
                  placeholder={`Refund amount (৳${req.refundAmount})`}
                  value={refundAmountInput[req.id] ?? ''}
                  onChange={(e) => setRefundAmountInput({ ...refundAmountInput, [req.id]: Number(e.target.value) })}
                  className="px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />

                <div className="flex items-center gap-1.5 justify-end">
                  {req.status !== 'APPROVED' && req.status !== 'REFUNDED' && (
                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() => handleAction(req.id, 'APPROVED')}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Approve
                    </button>
                  )}

                  {req.status !== 'REFUNDED' && (
                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() => handleAction(req.id, 'REFUNDED')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Process Refund
                    </button>
                  )}

                  {req.status !== 'REJECTED' && req.status !== 'REFUNDED' && (
                    <button
                      type="button"
                      disabled={updatingId === req.id}
                      onClick={() => handleAction(req.id, 'REJECTED')}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
