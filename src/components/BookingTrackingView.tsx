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
  Unlock,
  Receipt,
  Navigation,
  Sparkles,
  ExternalLink,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, BookingStatus } from '../types';
import { JobitAvatar } from './JobitAvatar';
import { triggerHaptic, playSound } from '../utils/feedback';
import { LiveWorkerMap } from './LiveWorkerMap';
import { DigitalInvoiceModal } from './DigitalInvoiceModal';
import { ReviewModal } from './ReviewModal';
import { 
  openWhatsAppAlert, 
  formatBookingCreatedWhatsApp, 
  formatWorkerAcceptedWhatsApp, 
  formatWorkerEnRouteWhatsApp, 
  formatJobCompletedInvoiceWhatsApp 
} from '../utils/whatsapp';

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
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [simulatingSpeed, setSimulatingSpeed] = useState(false);
  const [whatsAppNotificationSent, setWhatsAppNotificationSent] = useState(false);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === booking.status);
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
      extra = { 
        finalTotal: booking.estimatedTotal, 
        paymentStatus: 'completed',
        completedAt: new Date().toISOString(),
        invoiceNumber: `INV-JOBIT-${Date.now().toString().slice(-6)}`
      };
      try {
        confetti({ particleCount: 85, spread: 65 });
      } catch {}
      playSound('success');
      setTimeout(() => setIsReviewOpen(true), 1200);
    }

    setTimeout(() => {
      onUpdateStatus(booking.id, nextStatus, extra);
      setSimulatingSpeed(false);
    }, 300);
  };

  // Instant Automated WhatsApp Alert Trigger for current status
  const handleTriggerWhatsAppAlert = () => {
    triggerHaptic('medium');
    setWhatsAppNotificationSent(true);

    let text = '';
    if (booking.status === 'requested') {
      text = formatBookingCreatedWhatsApp(booking);
    } else if (booking.status === 'accepted' || booking.status === 'scheduled_confirmed') {
      text = formatWorkerAcceptedWhatsApp(booking);
    } else if (booking.status === 'on_the_way') {
      text = formatWorkerEnRouteWhatsApp(booking, 7);
    } else {
      text = formatJobCompletedInvoiceWhatsApp(booking);
    }

    openWhatsAppAlert(booking.customerPhone || booking.workerPhone, text);
  };

  const handleShareBooking = () => {
    triggerHaptic('light');
    if (navigator.share) {
      navigator.share({
        title: `JOBit Live Booking - ${booking.taskTitle}`,
        text: `Live tracking ${booking.workerName} on JOBit. Arrival PIN: ${booking.otp}`,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  const handleSubmitReview = (bookingId: string, rating: number, review: string, compliments: string[]) => {
    onUpdateStatus(bookingId, 'completed', {
      rating,
      review,
      compliments
    });
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
          title="Share Booking"
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
                {booking.status === 'scheduled_confirmed' && `Scheduled for ${booking.selectedDate} (${booking.selectedSlotLabel}).`}
                {booking.status === 'on_the_way' && `Traveling to ${booking.customerAddress.slice(0, 30)}...`}
                {booking.status === 'completed' && 'Payment verified. Digital bill & rating available below.'}
              </p>
            </div>

            {/* OTP badge */}
            <div className="bg-white text-black rounded-2xl p-2.5 text-center shrink-0 shadow-sm border border-stone-200">
              <span className="text-[9px] font-black text-stone-400 block uppercase">Start PIN</span>
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
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`absolute top-3.5 left-1/2 w-full h-1 transition-all ${
                          currentStepIndex > idx ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    )}
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

        {/* Feature 4: Instant Automated WhatsApp Alert Card */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between gap-3 text-emerald-950">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="w-4 h-4 fill-white" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-emerald-700 block">
                Instant WhatsApp Alert
              </span>
              <p className="text-xs font-bold truncate">
                {booking.status === 'requested' && 'Send instant confirmation to WhatsApp'}
                {booking.status === 'accepted' && 'Notify worker arrival schedule on WhatsApp'}
                {booking.status === 'on_the_way' && 'Live ETA Alert ready for WhatsApp'}
                {booking.status === 'completed' && 'Official Digital Bill ready on WhatsApp'}
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerWhatsAppAlert}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black shrink-0 active:scale-95 transition flex items-center gap-1 shadow-xs"
          >
            <span>Trigger Alert</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Feature 1: Live Worker Tracking (Real-time Map feature) */}
        {booking.status !== 'cancelled' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                <span>Live Route & Worker Tracking</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {booking.status === 'on_the_way' ? 'Live Moving • 26 km/h' : 'Route Active'}
              </span>
            </div>

            <LiveWorkerMap
              booking={booking}
              onDirectCall={() =>
                onDirectCall({
                  name: booking.workerName,
                  phone: booking.workerPhone,
                  profession: booking.workerProfession,
                  avatar: ''
                })
              }
            />
          </div>
        )}

        {/* Worker Card with Privacy Logo Avatar and Masked Direct Calling / WhatsApp */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-3">
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
                    onClick={handleTriggerWhatsAppAlert}
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

        {/* Feature 2: Transparent Pricing & Schedule Details */}
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

          {/* Pricing Row with Digital Bill Button */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-600">Total Payable:</span>
              <span className="text-[10px] text-stone-400 block font-medium">
                {booking.paymentStatus === 'completed' ? 'Paid via ' + booking.paymentMethod.toUpperCase() : `Pay upon completion via ${booking.paymentMethod.toUpperCase()}`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-red-600 block">
                ₹{booking.finalTotal ?? booking.estimatedTotal}
              </span>
            </div>
          </div>

          {/* View Digital Tax Invoice button when job is completed */}
          {booking.status === 'completed' && (
            <div className="pt-2">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsInvoiceOpen(true);
                }}
                className="w-full py-2.5 px-3 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-98 transition shadow-xs"
              >
                <Receipt className="w-4 h-4 text-red-500" />
                <span>View & Download Digital Tax Invoice 🧾</span>
              </button>
            </div>
          )}
        </div>

        {/* Feature 3: Post-Service Rating & Review Card when completed */}
        {booking.status === 'completed' && (
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3 text-center text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="font-black text-stone-900 text-xs">Service Rating & Feedback</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Verified Customer
              </span>
            </div>

            {booking.rating ? (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${s <= (booking.rating || 5) ? 'fill-amber-400 text-amber-500' : 'text-stone-300'}`}
                    />
                  ))}
                </div>
                <p className="font-black text-black text-xs">"{booking.review}"</p>
                {booking.compliments && booking.compliments.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 pt-1">
                    {booking.compliments.map((c, i) => (
                      <span key={i} className="text-[10px] font-bold bg-white text-stone-700 px-2 py-0.5 rounded-full border border-stone-200">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-emerald-600 font-bold mt-1">
                  ✓ Review published to {booking.workerName}'s public profile.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-stone-600 font-semibold">
                  How was your experience with <strong>{booking.workerName}</strong>? Help neighbors find top-rated workers!
                </p>
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    setIsReviewOpen(true);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-black active:scale-98 transition shadow-xs flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>Rate & Review Worker Now ⭐</span>
                </button>
              </div>
            )}
          </div>
        )}

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
              <span>1. Worker Accepts ➔</span>
            ) : booking.status === 'accepted' ? (
              <span>2. Confirm for Scheduled Slot ➔</span>
            ) : booking.status === 'scheduled_confirmed' ? (
              <span>3. Mark as En Route 🛵 (Activates Live Map) ➔</span>
            ) : booking.status === 'on_the_way' ? (
              <span>4. Complete Work, Issue Bill & Trigger Review 🎉</span>
            ) : (
              <span>Job Completed 🎉</span>
            )}
          </button>
        </div>
      </div>

      {/* Feature 2: Digital Invoice / Bill Summary Modal */}
      {isInvoiceOpen && (
        <DigitalInvoiceModal
          booking={booking}
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          onOpenReview={() => setIsReviewOpen(true)}
        />
      )}

      {/* Feature 3: Rating & Review Popup Modal */}
      {isReviewOpen && (
        <ReviewModal
          booking={booking}
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          onSubmitReview={handleSubmitReview}
        />
      )}
    </div>
  );
};
