import React from 'react';
import { CheckCircle2, Clock, PackageCheck, Truck, Check, AlertCircle } from 'lucide-react';
import { OrderStatus, OrderStatusHistoryItem } from '../types.js';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  history?: OrderStatusHistoryItem[];
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, history = [] }) => {
  const steps: { key: OrderStatus; labelBn: string; labelEn: string; icon: any }[] = [
    { key: 'PENDING', labelBn: 'অর্ডার প্লেসড', labelEn: 'Order Placed', icon: Clock },
    { key: 'CONFIRMED', labelBn: 'কনফার্মড', labelEn: 'Confirmed', icon: CheckCircle2 },
    { key: 'PROCESSING', labelBn: 'প্যাকেজিং / প্রসেসিং', labelEn: 'Processing', icon: PackageCheck },
    { key: 'SHIPPED', labelBn: 'ডেলিভারিতে চলমান', labelEn: 'Shipped', icon: Truck },
    { key: 'DELIVERED', labelBn: 'ডেলিভার্ড সম্পন্ন', labelEn: 'Delivered', icon: Check }
  ];

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold">অর্ডারটি বাতিল করা হয়েছে (Order Cancelled)</span>
          <p className="text-[11px] text-rose-600 mt-0.5">বিস্তারিত তথ্যের জন্য আমাদের কাস্টমার সাপোর্টে যোগাযোগ করুন।</p>
        </div>
      </div>
    );
  }

  const getStepIndex = (status: OrderStatus) => {
    return steps.findIndex(s => s.key === status);
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full py-4">
      {/* Visual Stepper Bar */}
      <div className="relative flex items-center justify-between w-full">
        {/* Progress Line */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-stone-200 -z-0">
          <div
            className="h-full bg-amber-600 transition-all duration-500"
            style={{
              width: currentIndex >= 0 ? `${(currentIndex / (steps.length - 1)) * 100}%` : '0%'
            }}
          />
        </div>

        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white border-2 border-stone-300 text-stone-400'
                } ${isCurrent ? 'ring-4 ring-amber-100 scale-110' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span className={`text-[10px] sm:text-xs mt-2 font-bangla text-center max-w-[70px] sm:max-w-none ${
                isCurrent ? 'font-bold text-stone-900' : isDone ? 'font-medium text-stone-700' : 'text-stone-400'
              }`}>
                {step.labelBn}
              </span>
            </div>
          );
        })}
      </div>

      {/* History Log */}
      {history.length > 0 && (
        <div className="mt-8 pt-4 border-t border-stone-200 space-y-3 font-bangla">
          <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            স্ট্যাটাস ট্র্যাকিং হিস্ট্রি
          </h5>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">{h.status}</span>
                    <span className="text-[11px] text-stone-400">
                      {new Date(h.timestamp).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">{h.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
