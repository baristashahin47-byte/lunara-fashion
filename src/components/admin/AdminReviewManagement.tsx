import React, { useState } from 'react';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare, Search, ShieldCheck } from 'lucide-react';
import { Review } from '../../types.js';
import { updateAdminReviewStatus, deleteAdminReview } from '../../lib/api.js';

interface AdminReviewManagementProps {
  reviews: Review[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminReviewManagement: React.FC<AdminReviewManagementProps> = ({
  reviews,
  onRefresh,
  showToast
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredReviews = reviews.filter(r => {
    const q = search.toLowerCase().trim();
    const matchesSearch = 
      (r.userName && r.userName.toLowerCase().includes(q)) ||
      (r.userCity && r.userCity.toLowerCase().includes(q)) ||
      (r.comment && r.comment.toLowerCase().includes(q));

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'APPROVED' && r.isApproved) ||
      (statusFilter === 'PENDING' && !r.isApproved);

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    try {
      await updateAdminReviewStatus(id, status);
      showToast(`Review marked as ${status}`);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update review status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;
    setProcessingId(id);
    try {
      await deleteAdminReview(id);
      showToast('Review deleted successfully');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete review', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-600" />
            <span>Customer Reviews Moderation ({reviews.length})</span>
          </h2>
          <p className="text-xs text-stone-500">
            Approve genuine customer ratings, manage testimonials and protect brand reputation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            Pending Approval: {reviews.filter(r => !r.isApproved).length}
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            Approved: {reviews.filter(r => r.isApproved).length}
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, city, comment..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="ALL">All Reviews ({reviews.length})</option>
          <option value="PENDING">Pending Moderation</option>
          <option value="APPROVED">Approved Only</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No reviews matching the criteria.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">{rev.userName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rev.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rev.isApproved ? 'APPROVED' : 'PENDING'}
                    </span>
                    {rev.isVerified && (
                      <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {rev.userCity && `${rev.userCity} • `}Product ID: {rev.productId} • {new Date(rev.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400' : 'text-stone-300'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                "{rev.comment}"
              </p>

              {/* Moderation Controls */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!rev.isApproved ? (
                    <button
                      onClick={() => handleStatusChange(rev.id, 'APPROVED')}
                      disabled={processingId === rev.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Review</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(rev.id, 'REJECTED')}
                      disabled={processingId === rev.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 text-stone-500" />
                      <span>Unapprove / Hide</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(rev.id)}
                  disabled={processingId === rev.id}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
