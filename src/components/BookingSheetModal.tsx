import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  IndianRupee, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { LocationCoordinates, WorkerProfile, Booking, TimeSlotId } from '../types';
import { JobitAvatar } from './JobitAvatar';
import { TIME_SLOT_OPTIONS } from '../data/mockData';
import { triggerHaptic, playSound } from '../utils/feedback';

interface BookingSheetModalProps {
  worker: WorkerProfile | null;
  customerLocation: LocationCoordinates;
  initialDate: string;
  initialSlot: TimeSlotId | 'any';
  onClose: () => void;
  onConfirmBooking: (bookingData: Partial<Booking>) => void;
}

const COMMON_TASKS: Record<string, string[]> = {
  Electrician: [
    'Wiring spark / Short circuit fix',
    'Ceiling fan / light fitting installation',
    'Main breaker & switchboard repair',
    'Inverter battery connection check'
  ],
  Plumber: [
    'Water tap dripping / broken pipe repair',
    'Bathroom shower valve replacement',
    'Under-sink drainage leak repair',
    'Overhead tank motor pipe fitting'
  ],
  Carpenter: [
    'Door lock latch repair / alignment',
    'Wooden cupboard hinges adjustment',
    'Furniture assembly / cot reinforcement',
    'Window wooden frame latch installation'
  ],
  'Home Cleaner': [
    'Full bathroom tile scrubbing & disinfection',
    'Kitchen countertop & chimney degrease',
    'Living room deep floor cleaning & mopping',
    'Move-in residential cleaning'
  ],
  Painter: [
    'Interior room wall dampness touch-up',
    'Ceiling scrape & primer whitewash',
    'Metal safety grill enamel paint',
    'Full room fresh emulsion coat'
  ],
  Driver: [
    'Local town standby driver (3-4 hrs)',
    'Outstation round-trip personal driver',
    'Airport pick & drop to Calicut / Cochin',
    'Daily standby errand driver'
  ],
  'Construction Worker': [
    'Floor / Bathroom ceramic tile replacement',
    'Wall plastering & crack cement filling',
    'Compound wall brick masonry repair',
    'Waterproofing terrace cement work'
  ],
  'Appliance Repair': [
    'Split AC not cooling / gas check',
    'Washing machine spinning noise / error',
    'Refrigerator continuous beep / no chill',
    'Microwave oven turntable not heating'
  ],
  Welder: [
    'Main entrance iron gate hinge welding',
    'Balcony safety grill repair & weld',
    'Roof tin sheet metal angle weld',
    'Window grill reinforcement'
  ]
};

export const BookingSheetModal: React.FC<BookingSheetModalProps> = ({
  worker,
  customerLocation,
  initialDate,
  initialSlot,
  onClose,
  onConfirmBooking,
}) => {
  if (!worker) return null;

  const defaultTasks = COMMON_TASKS[worker.profession] || [
    'General task inspection and repair',
    'On-site hourly labor assistance'
  ];

  const availableSlotsList = Array.isArray(worker.availableSlots) && worker.availableSlots.length > 0
    ? worker.availableSlots
    : (['morning', 'midday', 'afternoon', 'evening'] as TimeSlotId[]);

  const defaultSlotId: TimeSlotId = (initialSlot !== 'any' && availableSlotsList.includes(initialSlot))
    ? initialSlot
    : availableSlotsList[0] || 'morning';

  const [selectedTask, setSelectedTask] = useState(defaultTasks[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(initialDate || 'Today');
  const [selectedSlotId, setSelectedSlotId] = useState<TimeSlotId>(defaultSlotId);
  const [address, setAddress] = useState(customerLocation.address);
  const [estimatedHours, setEstimatedHours] = useState(1.5);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeSlotOption = TIME_SLOT_OPTIONS.find((s) => s.id === selectedSlotId) || TIME_SLOT_OPTIONS[0];

  const hourlyCharge = worker.hourlyRate * estimatedHours;
  const visitFee = 30; // nominal verification fee
  const discount = 30; // launch discount
  const finalTotal = Math.round(hourlyCharge);

  const handleConfirm = () => {
    triggerHaptic('success');
    playSound('pop');
    setIsSubmitting(true);

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    setTimeout(() => {
      onConfirmBooking({
        workerId: worker.id,
        workerName: worker.name,
        workerPhone: worker.phone,
        workerProfession: worker.profession,
        taskTitle: selectedTask,
        taskDescription: customNotes ? `${selectedTask} - ${customNotes}` : selectedTask,
        selectedDate,
        selectedSlot: selectedSlotId,
        selectedSlotLabel: `${activeSlotOption.label} (${activeSlotOption.timeRange})`,
        status: 'requested',
        otp: generatedOtp,
        hourlyRate: worker.hourlyRate,
        estimatedHours,
        estimatedTotal: finalTotal,
        customerAddress: address,
        customerLocation,
        paymentMethod,
        paymentStatus: 'pending'
      });
      setIsSubmitting(false);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="pt-3 pb-2.5 px-4 border-b border-stone-200 shrink-0">
          <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-2" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-black">
                Book for {selectedDate} ({activeSlotOption.label})
              </h2>
              <p className="text-xs text-stone-500 font-semibold">
                Direct booking with verified professional on JOBit
              </p>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
          {/* Privacy-First Worker Summary */}
          <div className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-2xl">
            <JobitAvatar isOnline={worker.isOnline} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-black truncate">
                  {worker.name}
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-stone-600 font-medium">
                {worker.profession} • {worker.experience} Yrs Exp • {worker.distanceKm ?? 1.5} km away
              </p>
              <p className="text-xs font-black text-red-600 mt-0.5">
                ₹{worker.hourlyRate}/hr • Verified Partner
              </p>
            </div>
          </div>

          {/* Date & Time Slot Choice */}
          <div>
            <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider block mb-1.5">
              Confirm Schedule Slot:
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {['Today', 'Tomorrow'].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedDate(day);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-black transition ${
                    selectedDate === day
                      ? 'border-red-600 bg-red-50 text-red-600 ring-2 ring-red-600/20'
                      : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {TIME_SLOT_OPTIONS.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isWorkerAvailable = availableSlotsList.includes(slot.id);
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!isWorkerAvailable}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedSlotId(slot.id);
                    }}
                    className={`p-2 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-red-600 bg-red-600 text-white font-extrabold shadow-xs'
                        : isWorkerAvailable
                        ? 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                        : 'border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-xs font-black truncate">{slot.label}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-red-100' : 'text-stone-400'}`}>
                      {slot.timeRange}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Problem Selection */}
          <div>
            <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider block mb-1.5">
              Required Task / Problem:
            </label>
            <div className="space-y-1.5">
              {defaultTasks.map((task, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedTask(task);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold border flex items-center justify-between transition ${
                    selectedTask === task
                      ? 'border-red-600 bg-red-50/50 text-black font-black'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="truncate pr-2">{task}</span>
                  {selectedTask === task ? (
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-stone-300 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Additional notes / instructions (optional)..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 mt-2 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Hours slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-black text-stone-700 uppercase tracking-wider text-[11px]">
                Estimated Hours:
              </span>
              <span className="font-black text-red-600">
                {estimatedHours} {estimatedHours === 1 ? 'hour' : 'hours'}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(parseFloat(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          {/* Customer Address */}
          <div>
            <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider block mb-1">
              Service Address:
            </label>
            <div className="flex items-start gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs text-stone-900 bg-transparent focus:outline-none font-semibold"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-[11px] font-black text-stone-700 uppercase tracking-wider block mb-1.5">
              Payment (Pay worker upon completion)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'upi'
                    ? 'border-red-600 bg-red-50 text-red-600'
                    : 'border-stone-200 bg-white text-stone-600'
                }`}
              >
                <span>📱 Pay via UPI / GPay</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'cash'
                    ? 'border-red-600 bg-red-50 text-red-600'
                    : 'border-stone-200 bg-white text-stone-600'
                }`}
              >
                <span>💵 Cash on Arrival</span>
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Labor (₹{worker.hourlyRate} × {estimatedHours} hr)</span>
              <span className="font-bold text-stone-900">₹{hourlyCharge}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Safety & Dispatch Assurance</span>
              <span className="font-bold text-stone-900">₹{visitFee}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>JOBit Promo Discount</span>
              <span>-₹{discount}</span>
            </div>
            <div className="border-t border-stone-200 pt-1.5 flex justify-between items-baseline font-black text-sm">
              <span className="text-black">Total Payable</span>
              <span className="text-red-600 text-base">₹{finalTotal}</span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-white border-t border-stone-200 shrink-0">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-98 transition disabled:opacity-75"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Book Now for {selectedDate} ({activeSlotOption.label}) • ₹{finalTotal}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
