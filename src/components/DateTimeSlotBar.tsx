import React from 'react';
import { Calendar, Clock, Sunrise, Sun, Sunset, Check } from 'lucide-react';
import { TimeSlotId } from '../types';
import { TIME_SLOT_OPTIONS } from '../data/mockData';
import { triggerHaptic } from '../utils/feedback';

interface DateTimeSlotBarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedSlot: TimeSlotId | 'any';
  onSelectSlot: (slot: TimeSlotId | 'any') => void;
  matchingCount: number;
}

const DATE_OPTIONS = [
  { id: 'Today', label: 'Today', subLabel: 'Immediate / Scheduled' },
  { id: 'Tomorrow', label: 'Tomorrow', subLabel: 'Next Day Booking' },
];

export const DateTimeSlotBar: React.FC<DateTimeSlotBarProps> = ({
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  matchingCount,
}) => {
  return (
    <div className="mx-4 my-2 p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5">
      {/* Date Header & Matching Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-black text-black">
          <Calendar className="w-3.5 h-3.5 text-red-600" />
          <span>Service Date & Time Slot</span>
        </div>
        <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          {matchingCount} {matchingCount === 1 ? 'Worker Available' : 'Workers Available'}
        </span>
      </div>

      {/* Date Selector Pills */}
      <div className="grid grid-cols-2 gap-2">
        {DATE_OPTIONS.map((d) => {
          const isSelected = selectedDate === d.id;
          return (
            <button
              key={d.id}
              onClick={() => {
                triggerHaptic('light');
                onSelectDate(d.id);
              }}
              className={`p-2 rounded-xl text-left border transition active:scale-98 ${
                isSelected
                  ? 'border-red-600 bg-white text-black ring-2 ring-red-600/20 shadow-xs'
                  : 'border-stone-200 bg-white/70 text-stone-600 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black ${isSelected ? 'text-red-600' : 'text-stone-800'}`}>
                  {d.label}
                </span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-red-600" />}
              </div>
              <span className="text-[10px] text-stone-500 block truncate mt-0.5">
                {d.subLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time Slots Carousel */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Preferred Working Hours:
          </span>
          {selectedSlot !== 'any' && (
            <button
              onClick={() => {
                triggerHaptic('light');
                onSelectSlot('any');
              }}
              className="text-[10px] font-extrabold text-red-600 hover:underline"
            >
              View All Slots
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5">
          {TIME_SLOT_OPTIONS.map((slot) => {
            const isSelected = selectedSlot === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectSlot(isSelected ? 'any' : slot.id);
                }}
                className={`p-2 rounded-xl border text-center transition active:scale-95 ${
                  isSelected
                    ? 'border-red-600 bg-red-600 text-white font-extrabold shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  {slot.id === 'morning' && <Sunrise className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-500'}`} />}
                  {slot.id === 'midday' && <Sun className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-600'}`} />}
                  {slot.id === 'afternoon' && <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-500'}`} />}
                  {slot.id === 'evening' && <Sunset className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-purple-500'}`} />}
                  <span className="text-[11px] font-bold truncate">{slot.label}</span>
                </div>
                <span className={`text-[9px] block truncate ${isSelected ? 'text-red-100' : 'text-stone-400'}`}>
                  {slot.timeRange.split(' - ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
