import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Star,
  Play,
  Share2,
  Calendar,
  Lock,
  Unlock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, BookingStatus } from '../types';
import { JobitAvatar } from './JobitAvatar';
import { triggerHaptic, playSound } from '../utils/feedback';

interface BookingTrackingViewProps {
  booking: Booking;
  onBack: () => void;
  onUpdateStatus: (bookingId: string, status: BookingStatus, extra?: Partial<Booking>) => void;
  onDirectCall: (worker: { name: string; phone: string; profession: string; avatar: string }) => void;
}

const STATUS_STEPS: { key: BookingStatus; label: string; icon: string }[] = [
  { key: 'requested', label: 'Requested', icon: '📝' },
  { key: 'accepted', label: 'Accepted', icon: '🤝' },
  { key: 'scheduled_confirmed', label: 'Confirmed', icon: '📅' },
  { key: 'on_the_way', label: 'En Route', icon: '🛵' },
  { key: 'completed', label: 'Done', icon: '🎉' },
];

export const BookingTrackingView: React.FC<BookingTrackingViewProps> = ({
  booking,
  onBack,
  onUpdateStatus,
  onDirectCall,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [showReviewSubmitted, setShowReviewSubmitted] = useState(false);
  const [simulatingSpeed, setSimulatingSpeed] = useState(false);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === booking.status);

  // Is worker accepted or beyond? (Unlocks direct communication)
  const isAcceptedOrConfirmed = booking.status !== 'requested' && booking.status !== 'cancelled';

  // Fast forward simulator helper to showcase status progression
  const handleAdvanceNextStep = () => {
    triggerHaptic('medium');
    playSound('pop');
    setSimulatingSpeed(true);

    let nextStatus: BookingStatus = 'accepted';
    let extra: Partial<Booking> = {};

    if (booking.status === 'requested') {
      nextStatus = 'accepted';
      extra = { acceptedAt: new Date().toISOString() };
    } else if (booking.status === 'accepted') {
      nextStatus = 'scheduled_confirmed';
    } else if (booking.status === 'scheduled_confirmed') {
      nextStatus = 'on_the_way';
    } else if (booking.status === 'on_the_way') {
      nextStatus = 'completed';
      extra = { finalTotal: booking.estimatedTotal, paymentStatus: 'completed' };
      try {
        confetti({ particleCount: 75, spread: 60 });
      } catch {}
      playSound('success');
    }

    setTimeout(() => {
      onUpdateStatus(booking.id, nextStatus, extra);
      setSimulatingSpeed(false);
    }, 300);
  };

  const handleWhatsApp = () => {
    triggerHaptic('light');
    const cleanNumber = booking.workerPhone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hi ${booking.workerName}, I am contacting you regarding JOBit Booking #${booking.id} (${booking.taskTitle}) scheduled for ${booking.selectedDate} [${booking.selectedSlotLabel}]. Address: ${booking.customerAddress}.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const handleShareBooking = () => {
    triggerHaptic('light');
    if (navigator.share) {
      navigator.share({
        title: `JOBit Booking - ${booking.taskTitle}`,
        text: `Tracking ${booking.workerName} on JOBit for ${booking.selectedSlotLabel}. OTP: ${booking.otp}`,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  const handleSubmitReview = () => {
    triggerHaptic('success');
    playSound('ding');
    onUpdateStatus(booking.id, 'completed', {
      rating,
      review: reviewText || 'Punctual & excellent service.'
    });
    setShowReviewSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => {
            triggerHaptic('light');
            onBack();
          }}
          className="flex items-center gap-1 text-stone-700 hover:text-black active:scale-95 transition"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
          <span className="text-xs font-black uppercase tracking-wider">Back</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block">
            JOB<span className="text-black">it</span> Dispatch
          </span>
          <p className="text-xs font-black text-black">
            Booking #{booking.id}
          </p>
        </div>

        <button
          onClick={handleShareBooking}
          className="p-1.5 rounded-full text-stone-600 hover:bg-stone-100 active:scale-95 transition"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Status Hero Card in Red / White theme */}
        <div className="bg-red-600 text-white rounded-3xl p-5 shadow-lg shadow-red-600/20 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full mb-1.5 uppercase tracking-wider">
                {booking.status.replace('_', ' ')}
              </span>

              <h2 className="text-lg font-black tracking-tight">
                {booking.status === 'requested' && 'Request Sent to Worker...'}
                {booking.status === 'accepted' && `${booking.workerName} Accepted! 🤝`}
                {booking.status === 'scheduled_confirmed' && 'Confirmed for Scheduled Time! 📅'}
                {booking.status === 'on_the_way' && 'Worker is On The Way! 🛵'}
                {booking.status === 'completed' && 'Job Completed Successfully! 🎉'}
                {booking.status === 'cancelled' && 'Booking Cancelled'}
              </h2>

              <p className="text-xs text-red-100 mt-1 max-w-[260px]">
                {booking.status === 'requested' && 'Awaiting worker confirmation for your slot.'}
                {booking.status === 'accepted' && 'Worker accepted the assignment. Lock in scheduled arrival.'}
                {booking.status === 'scheduled_confirmed' && `Scheduled for ${booking.selectedDate} (${booking.selectedSlotLabel}). Masked contact unlocked.`}
                {booking.status === 'on_the_way' && `Traveling to ${booking.customerAddress.slice(0, 30)}...`}
                {booking.status === 'completed' && 'Payment verified. Thank you for choosing JOBit!'}
              </p>
            </div>

            {/* OTP badge */}
            <div className="bg-white text-black rounded-2xl p-2.5 text-center shrink-0 shadow-sm border border-stone-200">
              <span className="text-[9px] font-black text-stone-400 block uppercase">OTP PIN</span>
              <span className="text-xl font-mono font-black text-red-600">{booking.otp}</span>
              <span className="text-[9px] font-bold text-stone-500 block">Share on arrival</span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-5 pt-4 border-t border-white/20 relative z-10">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                    {/* Connecting line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`absolute top-3.5 left-1/2 w-full h-1 transition-all ${
                          currentStepIndex > idx ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    )}
                    {/* Step Icon circle */}
                    <div
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-white text-red-600 scale-110 shadow-md ring-4 ring-white/30'
                          : isPassed
                          ? 'bg-white/90 text-stone-900'
                          : 'bg-white/30 text-white/70'
                      }`}
                    >
                      <span>{step.icon}</span>
                    </div>
                    <span className="text-[9px] font-extrabold mt-1 text-center truncate max-w-[65px] text-white/90">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Worker Card with Privacy Logo Avatar and Direct Calling / WhatsApp */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Strictly JOBit Brand Logo Avatar (NO user photo) */}
            <JobitAvatar isOnline={true} size="md" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base text-black truncate">
                  {booking.workerName}
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs font-semibold text-stone-600">
                {booking.workerProfession} Professional
              </p>
              <p className="text-xs font-black text-red-600 mt-0.5">
                ₹{booking.hourlyRate}/hr • Verified Partner
              </p>
            </div>
          </div>

          {/* Masked Direct Contact Actions */}
          <div className="mt-3.5 pt-3 border-t border-stone-100">
            {isAcceptedOrConfirmed ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-extrabold">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Masked Direct Contact Unlocked for Address Confirmation</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      onDirectCall({
                        name: booking.workerName,
                        phone: booking.workerPhone,
                        profession: booking.workerProfession,
                        avatar: ''
                      })
                    }
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-black text-xs active:scale-95 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Worker</span>
                  </button>

                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-green-50 text-green-900 border border-green-300 font-black text-xs active:scale-95 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                    <span>WhatsApp Chat</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2 text-xs text-stone-500">
                <Lock className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Masked call & WhatsApp will unlock once worker accepts your slot.</span>
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Service Details */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2.5 text-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                Scheduled Slot
              </span>
              <p className="text-sm font-black text-black flex items-center gap-1 mt-0.5">
                <Calendar className="w-4 h-4 text-red-600" />
                <span>{booking.selectedDate}</span>
                <span className="text-stone-300">•</span>
                <span className="text-red-600">{booking.selectedSlotLabel}</span>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
              Required Work:
            </span>
            <p className="font-extrabold text-stone-900 mt-0.5">{booking.taskTitle}</p>
            <p className="text-[11px] text-stone-500 mt-0.5">{booking.taskDescription}</p>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-start gap-1.5 text-stone-700">
            <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Service Location: </span>
              <span>{booking.customerAddress}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="font-semibold text-stone-600">Total Payable:</span>
            <div className="text-right">
              <span className="text-base font-black text-red-600">
                ₹{booking.finalTotal ?? booking.estimatedTotal}
              </span>
              <span className="text-[10px] text-stone-400 block font-medium">
                {booking.paymentStatus === 'completed' ? 'Paid' : `Pay upon completion via ${booking.paymentMethod.toUpperCase()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Fast-Forward Simulation Controller */}
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-black text-stone-300 uppercase tracking-wide">
            <div className="flex items-center gap-1">
              <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>Simulate Real-time Job Status</span>
            </div>
            <span className="text-stone-400">Step {currentStepIndex + 1} of 5</span>
          </div>

          <button
            onClick={handleAdvanceNextStep}
            disabled={simulatingSpeed || booking.status === 'completed'}
            className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-98 ${
              booking.status === 'completed'
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
            }`}
          >
            {simulatingSpeed ? (
              <span>Updating...</span>
            ) : booking.status === 'requested' ? (
              <>
                <span>1. Worker Accepts ➔</span>
              </>
            ) : booking.status === 'accepted' ? (
              <>
                <span>2. Confirm for Scheduled Slot ➔</span>
              </>
            ) : booking.status === 'scheduled_confirmed' ? (
              <>
                <span>3. Mark as En Route 🛵 ➔</span>
              </>
            ) : booking.status === 'on_the_way' ? (
              <>
                <span>4. Complete Work & Verify Payment 🎉</span>
              </>
            ) : (
              <span>Job Completed 🎉</span>
            )}
          </button>
        </div>

        {/* Rating & Review if Completed */}
        {booking.status === 'completed' && (
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2 text-center text-xs">
            <h3 className="font-black text-black">Rate {booking.workerName}'s Service</h3>
            <div className="flex items-center justify-center gap-1.5 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    triggerHaptic('light');
                    setRating(s);
                  }}
                  className="p-1 hover:scale-110 active:scale-95 transition"
                >
                  <Star
                    className={`w-6 h-6 ${s <= rating ? 'fill-amber-400 text-amber-500' : 'text-stone-300'}`}
                  />
                </button>
              ))}
            </div>

            {!showReviewSubmitted ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share a quick review..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-red-600"
                />
                <button
                  onClick={handleSubmitReview}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-black active:scale-98 transition"
                >
                  Submit Rating
                </button>
              </div>
            ) : (
              <p className="text-xs font-black text-emerald-600">Review recorded! Thank you.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
