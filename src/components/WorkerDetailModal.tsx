import React from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Calendar,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { WorkerProfile } from '../types';
import { JobitAvatar } from './JobitAvatar';
import { TIME_SLOT_OPTIONS } from '../data/mockData';
import { triggerHaptic } from '../utils/feedback';

interface WorkerDetailModalProps {
  worker: WorkerProfile | null;
  onClose: () => void;
  onBook: (worker: WorkerProfile) => void;
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  onClose,
  onBook,
}) => {
  if (!worker) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-red-600 p-4 text-white shrink-0">
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/30 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pt-1">
            {/* Strictly JOBit Brand Logo Avatar with Live Pulse Dot */}
            <JobitAvatar isOnline={worker.isOnline} size="lg" />

            <div>
              <div className="flex items-center gap-1.5">
                {/* Privacy-First Name */}
                <h2 className="text-lg font-black text-white">{worker.name}</h2>
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-red-100 font-semibold">
                {worker.profession} • {worker.experience} Yrs Experience
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  Verified Worker
                </span>
                <span className="text-xs font-black text-amber-200 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  {worker.rating} ({worker.reviewCount} jobs)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-stone-700 no-scrollbar">
          {/* Rates */}
          <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
            <div>
              <span className="text-[10px] uppercase font-black text-stone-400 block">Hourly Rate</span>
              <span className="text-lg font-black text-black">₹{worker.hourlyRate}</span>
              <span className="text-[10px] text-stone-500 block">/ hour</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-stone-400 block">Daily Rate</span>
              <span className="text-lg font-black text-black">₹{worker.dailyRate}</span>
              <span className="text-[10px] text-stone-500 block">/ 8 hour shift</span>
            </div>
          </div>

          {/* Location & Status */}
          <div className="flex items-center justify-between p-3 bg-red-50/50 border border-red-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <div>
                <span className="font-black text-black">{worker.location.name}</span>
                <p className="text-[11px] text-stone-500">{worker.distanceKm ?? 1.5} km away from your location</p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
              worker.isOnline ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'
            }`}>
              {worker.isOnline ? '🟢 Available' : 'Offline'}
            </span>
          </div>

          {/* Working Schedule Slots */}
          <div>
            <h4 className="font-black text-black uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-red-600" />
              <span>Available Time Slots</span>
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {TIME_SLOT_OPTIONS.map((slot) => {
                const isAvailable = (worker.availableSlots || ['morning', 'midday', 'afternoon']).includes(slot.id);
                return (
                  <div
                    key={slot.id}
                    className={`p-2 rounded-xl border flex items-center justify-between ${
                      isAvailable
                        ? 'bg-stone-50 border-stone-300 text-stone-900 font-bold'
                        : 'bg-stone-50/50 border-stone-200 text-stone-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black">{slot.label}</div>
                      <div className="text-[10px] text-stone-400">{slot.timeRange}</div>
                    </div>
                    {isAvailable && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h4 className="font-black text-black uppercase tracking-wider text-[10px] mb-1.5">
              Verified Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(worker.skills || [worker.profession]).map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-stone-100 text-stone-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-stone-200"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-stone-200 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('medium');
              onClose();
              onBook(worker);
            }}
            disabled={!worker.isOnline}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition ${
              worker.isOnline
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Book {worker.name} on JOBit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
