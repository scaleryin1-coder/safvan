import React from 'react';
import { 
  CalendarCheck, 
  MapPin, 
  ChevronRight, 
  Star, 
  Clock, 
  Calendar,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Booking } from '../types';
import { JobitAvatar } from './JobitAvatar';
import { triggerHaptic } from '../utils/feedback';

interface BookingsListViewProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onExploreServices: () => void;
}

export const BookingsListView: React.FC<BookingsListViewProps> = ({
  bookings = [],
  onSelectBooking,
  onExploreServices,
}) => {
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const activeBookings = safeBookings.filter(
    (b) => b && b.status !== 'completed' && b.status !== 'cancelled'
  );
  const completedBookings = safeBookings.filter((b) => b && b.status === 'completed');

  return (
    <div className="min-h-screen bg-stone-50 pb-24 p-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-black tracking-tight">
            My Service Bookings
          </h1>
          <p className="text-xs text-stone-500 font-semibold">Scheduled slots & live job status</p>
        </div>
        <span className="text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
          {bookings.length} Total
        </span>
      </div>

      {/* Active Bookings Section */}
      {activeBookings.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <h2 className="text-xs font-black uppercase tracking-wider text-black">
              Active Job Slots ({activeBookings.length})
            </h2>
          </div>

          {activeBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => {
                triggerHaptic('medium');
                onSelectBooking(b);
              }}
              className="bg-white rounded-2xl p-4 border-2 border-red-200 shadow-md shadow-red-100/40 hover:border-red-400 active:scale-[0.99] transition cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {/* Strictly JOBit Brand Logo Avatar (NO user photo) */}
                  <JobitAvatar isOnline={true} size="sm" />
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                      {b.status.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-black text-black mt-1">
                      {b.taskTitle}
                    </h3>
                    <p className="text-xs text-stone-600 font-medium">
                      Worker: <span className="font-bold text-black">{b.workerName}</span> ({b.workerProfession})
                    </p>
                    <p className="text-[11px] text-red-600 font-bold mt-0.5">
                      📅 {b.selectedDate} • {b.selectedSlotLabel}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-black text-red-600">
                    ₹{b.estimatedTotal}
                  </span>
                  <span className="text-[10px] text-stone-400 block font-bold">
                    PIN: {b.otp}
                  </span>
                </div>
              </div>

              {/* Status footer button */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">
                  {b.status === 'scheduled_confirmed'
                    ? '📅 Time slot confirmed by worker'
                    : '⚡ Assignment active'}
                </span>
                <span className="font-black text-red-600 flex items-center gap-0.5">
                  <span>Track Status</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed History Section */}
      <div className="space-y-2.5 pt-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-stone-400">
          Completed Services & History
        </h2>

        {completedBookings.length === 0 && activeBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-sm text-black">No Bookings Yet</h3>
              <p className="text-xs text-stone-500 mt-1">
                Book a verified electrician, plumber, or cleaner in Perinthalmanna with 1 tap.
              </p>
            </div>
            <button
              onClick={() => {
                triggerHaptic('medium');
                onExploreServices();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-xs active:scale-95 transition"
            >
              Explore Available Workers
            </button>
          </div>
        ) : (
          completedBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => {
                triggerHaptic('light');
                onSelectBooking(b);
              }}
              className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-xs hover:border-red-200 active:scale-[0.99] transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <JobitAvatar isOnline={false} size="sm" />
                  <div>
                    <h4 className="text-xs font-black text-black">{b.taskTitle}</h4>
                    <p className="text-[11px] text-stone-500 font-medium">
                      {b.workerName} • {b.selectedDate} ({b.selectedSlotLabel})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-black">
                    ₹{b.finalTotal ?? b.estimatedTotal}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 font-bold mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Completed</span>
                  </div>
                </div>
              </div>

              {b.review && (
                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                  <span className="italic truncate max-w-[200px]">"{b.review}"</span>
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{b.rating ?? 5}.0 ★</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
