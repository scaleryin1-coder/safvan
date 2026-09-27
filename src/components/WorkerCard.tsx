import React from 'react';
import { Star, MapPin, Clock, Calendar, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { WorkerProfile, TimeSlotId } from '../types';
import { JobitAvatar } from './JobitAvatar';
import { TIME_SLOT_OPTIONS } from '../data/mockData';
import { triggerHaptic } from '../utils/feedback';

interface WorkerCardProps {
  worker: WorkerProfile;
  selectedDate: string;
  selectedSlot: TimeSlotId | 'any';
  onBook: (worker: WorkerProfile) => void;
  onViewDetails: (worker: WorkerProfile) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  selectedDate,
  selectedSlot,
  onBook,
  onViewDetails,
}) => {
  return (
    <div
      onClick={() => {
        triggerHaptic('light');
        onViewDetails(worker);
      }}
      className={`relative bg-white rounded-2xl border transition-all active:scale-[0.99] p-3.5 shadow-xs hover:shadow-md cursor-pointer ${
        worker.isOnline
          ? 'border-stone-200 hover:border-red-300'
          : 'border-stone-200/60 opacity-80'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Strictly JOBit Brand Logo Avatar with Live Green Pulse Dot (NO user photo) */}
        <JobitAvatar isOnline={worker.isOnline} size="md" />

        {/* Worker Info: ONLY First Name, Rating, Exp, Rate, Distance */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Privacy First: Display ONLY First Name (e.g., Ramesh K.) */}
              <h3 className="text-base font-black text-black truncate">
                {worker.name}
              </h3>
              {worker.verified && (
                <span title="Verified JOBit Professional">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </span>
              )}
            </div>

            {/* Distance Badge */}
            <div className="flex items-center gap-1 bg-stone-100 text-stone-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-stone-200 shrink-0">
              <MapPin className="w-3 h-3 text-red-600" />
              <span>{worker.distanceKm ?? 1.5} km away</span>
            </div>
          </div>

          {/* Profession & Experience */}
          <div className="flex items-center gap-2 mt-0.5 text-xs">
            <span className="font-extrabold text-red-600">{worker.profession}</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-600 font-semibold">{worker.experience} Yrs Exp</span>
            <span className="text-stone-300">•</span>
            {/* Rating */}
            <div className="flex items-center gap-1 font-bold text-stone-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{worker.rating} ★</span>
            </div>
          </div>

          {/* Available Time Slots Chips */}
          <div className="flex flex-wrap items-center gap-1 mt-2">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mr-0.5">
              Slots:
            </span>
            {(worker.availableSlots || ['morning', 'midday', 'afternoon']).map((slotId) => {
              const opt = TIME_SLOT_OPTIONS.find((o) => o.id === slotId);
              const isSlotMatching = selectedSlot === slotId;
              return (
                <span
                  key={slotId}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    isSlotMatching
                      ? 'bg-red-50 text-red-600 border-red-300 ring-1 ring-red-400/30'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  {opt?.label || slotId}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Pricing & Action Bar */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-stone-100">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-black">
              ₹{worker.hourlyRate}
            </span>
            <span className="text-[11px] text-stone-500 font-medium">/hr</span>
            <span className="text-stone-300 mx-1">|</span>
            <span className="text-xs font-bold text-stone-700">₹{worker.dailyRate}</span>
            <span className="text-[10px] text-stone-500">/day</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
            {worker.isOnline ? '🟢 Available for instant scheduling' : '⚪ Offline'}
          </span>
        </div>

        {/* 1-Tap Booking Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('medium');
            onBook(worker);
          }}
          disabled={!worker.isOnline}
          className={`flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-2.5 rounded-xl shadow-xs active:scale-95 transition ${
            worker.isOnline
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>Book Now</span>
        </button>
      </div>
    </div>
  );
};
