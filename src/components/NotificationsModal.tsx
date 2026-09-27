import React from 'react';
import { X, Bell, CheckCheck, CalendarCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { NotificationItem } from '../types';
import { triggerHaptic } from '../utils/feedback';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelectBooking: (bookingId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications = [],
  onClose,
  onMarkAllRead,
  onSelectBooking,
}) => {
  const safeNotifs = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <Bell className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-stone-900">Notifications</h3>
              <p className="text-[11px] text-stone-500">Job updates & match alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                onMarkAllRead();
              }}
              className="text-[11px] font-bold text-red-600 hover:underline"
            >
              Mark all read
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="p-1 rounded-full text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar text-xs">
          {safeNotifs.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <Bell className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="font-semibold text-xs text-stone-600">No notifications yet</p>
            </div>
          ) : (
            safeNotifs.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.bookingId) {
                    triggerHaptic('light');
                    onSelectBooking(item.bookingId);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl border transition text-left ${
                  item.read
                    ? 'bg-stone-50/70 border-stone-200/80 text-stone-600'
                    : 'bg-orange-50/50 border-orange-200 text-stone-900 shadow-xs'
                } ${item.bookingId ? 'cursor-pointer hover:border-orange-300 active:scale-98' : ''}`}
              >
                <div className="flex items-baseline justify-between gap-1">
                  <h4 className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#FF5722] shrink-0" />
                    )}
                    <span>{item.title}</span>
                  </h4>
                  <span className="text-[10px] text-stone-400 shrink-0">{item.timestamp}</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1 leading-normal">
                  {item.message}
                </p>
                {item.bookingId && (
                  <span className="inline-block mt-2 text-[10px] font-bold text-[#FF5722] hover:underline">
                    View Live Tracker ➔
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
