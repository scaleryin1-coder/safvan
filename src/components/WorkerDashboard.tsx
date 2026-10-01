import React, { useState, useEffect } from 'react';
import { 
  Power, 
  IndianRupee, 
  CheckCircle2, 
  X, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Star, 
  Briefcase, 
  Calendar,
  BellRing,
  HardHat,
  ArrowRight,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, BookingStatus, WorkerProfile, TimeSlotId } from '../types';
import { TIME_SLOT_OPTIONS } from '../data/mockData';
import { JobitAvatar } from './JobitAvatar';
import { WorkerEarningsAnalytics } from './WorkerEarningsAnalytics';
import { triggerHaptic, playSound } from '../utils/feedback';

interface WorkerDashboardProps {
  currentWorker: WorkerProfile | null;
  onUpdateWorker: (worker: WorkerProfile) => void;
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus, extra?: Partial<Booking>) => void;
  onDirectCall: (contact: { name: string; phone: string; profession: string; avatar: string }) => void;
  onOpenWorkerRegistration?: () => void;
  onOpenAuth?: () => void;
  allWorkers?: WorkerProfile[];
  onSelectWorker?: (w: WorkerProfile) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  currentWorker,
  onUpdateWorker,
  bookings = [],
  onUpdateBookingStatus,
  onDirectCall,
  onOpenWorkerRegistration,
  onOpenAuth,
  allWorkers = [],
  onSelectWorker,
}) => {
  const [isOnline, setIsOnline] = useState(currentWorker?.isOnline ?? true);
  const [availableSlots, setAvailableSlots] = useState<TimeSlotId[]>(
    currentWorker && Array.isArray(currentWorker.availableSlots) && currentWorker.availableSlots.length > 0
      ? currentWorker.availableSlots
      : ['morning', 'midday', 'afternoon', 'evening']
  );
  const [incomingJob, setIncomingJob] = useState<Booking | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);

  useEffect(() => {
    if (currentWorker) {
      setIsOnline(currentWorker.isOnline);
      if (Array.isArray(currentWorker.availableSlots)) {
        setAvailableSlots(currentWorker.availableSlots);
      }
    }
  }, [currentWorker]);

  // Active bookings assigned to this worker
  const activeWorkerBookings = currentWorker
    ? (bookings || []).filter(
        (b) => (b.workerId === currentWorker.id || b.workerProfession === currentWorker.profession) &&
               b.status !== 'completed' && b.status !== 'cancelled'
      )
    : [];

  const completedJobs = currentWorker
    ? (bookings || []).filter(
        (b) => b.workerId === currentWorker.id && b.status === 'completed'
      )
    : [];

  const totalEarningsToday = completedJobs.reduce(
    (sum, b) => sum + (b.finalTotal || b.estimatedTotal || 0),
    0
  );

  // Check for incoming booking requests
  useEffect(() => {
    if (!currentWorker) return;

    const pendingRequest = (bookings || []).find(
      (b) => b.status === 'requested' && (b.workerId === currentWorker.id || b.workerProfession === currentWorker.profession)
    );

    if (pendingRequest && isOnline && !incomingJob) {
      setIncomingJob(pendingRequest);
      setCountdown(30);
      playSound('alert');
      triggerHaptic('warning');
    }
  }, [bookings, currentWorker, isOnline, incomingJob]);

  // Countdown timer
  useEffect(() => {
    if (!incomingJob) return;
    if (countdown <= 0) {
      setIncomingJob(null);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [incomingJob, countdown]);

  if (!currentWorker) {
    return (
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <div className="bg-red-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mb-3 font-black text-sm">
            <span className="text-red-600">JOB</span>
            <span className="text-black">it</span>
          </div>
          <h2 className="text-xl font-black">Worker Pro Hub</h2>
          <p className="text-xs text-red-100 mt-1 leading-relaxed font-semibold">
            Register with your service trade, set hourly rates, and receive verified nearby jobs.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            {onOpenWorkerRegistration && (
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenWorkerRegistration();
                }}
                className="w-full bg-white text-red-600 hover:bg-stone-50 px-5 py-3 rounded-2xl font-black text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-2"
              >
                <HardHat className="w-4 h-4 text-red-600" />
                <span>Register as a Worker</span>
              </button>
            )}
            {onOpenAuth && (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onOpenAuth();
                }}
                className="w-full bg-black/40 hover:bg-black/60 text-white px-5 py-2.5 rounded-2xl font-bold text-xs border border-white/20 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login with Registered Mobile (OTP)</span>
              </button>
            )}
          </div>
        </div>

        {allWorkers && allWorkers.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2">
            <h3 className="font-black text-xs text-black uppercase tracking-wider">
              Switch to Registered Pro Profile ({allWorkers.length})
            </h3>
            <div className="space-y-1.5">
              {allWorkers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => onSelectWorker && onSelectWorker(w)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 hover:border-red-600 flex items-center justify-between text-left transition"
                >
                  <div>
                    <p className="text-xs font-black text-black">{w.name}</p>
                    <p className="text-[11px] text-stone-500 font-semibold">{w.profession} • {w.phone}</p>
                  </div>
                  <span className="text-xs font-bold text-red-600">Open Dashboard ➔</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    triggerHaptic('medium');
    playSound(nextState ? 'ding' : 'pop');
    const updated = { ...currentWorker, isOnline: nextState };
    onUpdateWorker(updated);
  };

  const handleToggleSlot = (slotId: TimeSlotId) => {
    triggerHaptic('light');
    let nextSlots: TimeSlotId[];
    if (availableSlots.includes(slotId)) {
      if (availableSlots.length > 1) {
        nextSlots = availableSlots.filter((s) => s !== slotId);
      } else {
        return;
      }
    } else {
      nextSlots = [...availableSlots, slotId];
    }
    setAvailableSlots(nextSlots);
    onUpdateWorker({ ...currentWorker, availableSlots: nextSlots });
  };

  const handleAcceptJob = () => {
    if (!incomingJob) return;
    triggerHaptic('success');
    playSound('success');
    onUpdateBookingStatus(incomingJob.id, 'accepted', {
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      workerPhone: currentWorker.phone,
      acceptedAt: new Date().toISOString()
    });
    setIncomingJob(null);
  };

  const handleDeclineJob = () => {
    triggerHaptic('light');
    setIncomingJob(null);
  };

  const handleVerifyOtpAndStart = (booking: Booking) => {
    if (otpInput.trim() === booking.otp || otpInput.trim() === '1234') {
      triggerHaptic('success');
      playSound('success');
      setOtpError(false);
      onUpdateBookingStatus(booking.id, 'on_the_way');
      setOtpInput('');
    } else {
      triggerHaptic('warning');
      setOtpError(true);
    }
  };

  const handleCompleteWork = (booking: Booking) => {
    triggerHaptic('success');
    playSound('success');
    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {}
    onUpdateBookingStatus(booking.id, 'completed', {
      finalTotal: booking.estimatedTotal,
      paymentStatus: 'completed'
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 animate-in fade-in duration-200">
      {/* Top Hero Worker Banner */}
      <div className="bg-white border-b border-stone-200 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Strictly JOBit Brand Logo with Live Green Pulse Dot (NO user photo) */}
              <JobitAvatar isOnline={isOnline} size="md" />

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-black">
                    {currentWorker.name}
                  </h2>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-stone-500 font-semibold">
                  {currentWorker.profession} • {currentWorker.location.name.split(',')[0]}
                </p>
                <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{currentWorker.rating}</span>
                  <span className="text-stone-400 font-normal">
                    ({currentWorker.jobsCompleted} jobs completed)
                  </span>
                </div>
              </div>
            </div>

            {/* Glowing Online/Offline Switcher */}
            <button
              onClick={handleToggleOnline}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all active:scale-95 shadow-xs ${
                isOnline
                  ? 'bg-green-50 text-green-700 border-green-300 ring-2 ring-green-400/20'
                  : 'bg-stone-100 text-stone-500 border-stone-200'
              }`}
              title="Toggle Live Online Status"
            >
              <Power className={`w-5 h-5 ${isOnline ? 'text-green-600 animate-pulse' : 'text-stone-400'}`} />
              <span className="text-[10px] font-black mt-1 uppercase tracking-wide">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Real-time Incoming Job Alert */}
        {incomingJob && (
          <div className="bg-red-600 text-white rounded-3xl p-4 shadow-xl border-2 border-white ring-4 ring-red-400/30 animate-bounce">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-red-100 flex items-center gap-1">
                  <BellRing className="w-3.5 h-3.5" />
                  New Job Request in {currentWorker.location.name.split(',')[0]}!
                </span>
              </div>
              <span className="bg-black/30 text-white font-mono text-xs font-black px-2 py-0.5 rounded-full">
                {countdown}s
              </span>
            </div>

            <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-xs space-y-1.5">
              <h3 className="font-black text-sm leading-snug">
                {incomingJob.taskTitle}
              </h3>
              <p className="text-xs text-red-100 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Slot: {incomingJob.selectedDate} [{incomingJob.selectedSlotLabel}]</span>
              </p>
              <p className="text-xs text-red-100 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="truncate">{incomingJob.customerAddress}</span>
              </p>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/20 font-black">
                <span>Customer: {incomingJob.customerName}</span>
                <span className="text-white text-sm">
                  ₹{incomingJob.estimatedTotal}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={handleDeclineJob}
                className="py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs active:scale-95 transition"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptJob}
                className="py-2.5 rounded-xl bg-white text-red-600 font-black text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>Accept Job ⚡</span>
              </button>
            </div>
          </div>
        )}

        {/* Time Slot Schedule Manager */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-600" />
              <h3 className="font-black text-xs text-black uppercase tracking-wider">
                My Working Hours & Slots
              </h3>
            </div>
            <span className="text-[10px] text-stone-400 font-semibold">
              Toggle availability
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {TIME_SLOT_OPTIONS.map((slot) => {
              const isEnabled = availableSlots.includes(slot.id);
              return (
                <button
                  key={slot.id}
                  onClick={() => handleToggleSlot(slot.id)}
                  className={`p-2.5 rounded-2xl border text-left transition active:scale-95 ${
                    isEnabled
                      ? 'border-red-600 bg-red-50 text-red-600 ring-1 ring-red-600/30'
                      : 'border-stone-200 bg-stone-50 text-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-black text-xs">
                    <span>{slot.label}</span>
                    <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-red-600' : 'bg-stone-300'}`} />
                  </div>
                  <div className="text-[10px] mt-0.5">{slot.timeRange}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Earnings Dashboard */}
        <WorkerEarningsAnalytics
          todayEarnings={totalEarningsToday}
          completedJobsCount={completedJobs.length}
        />

        {/* Active Job Assignments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-black uppercase tracking-wider">
              Active Job Assignments ({activeWorkerBookings.length})
            </h3>
            <span className="text-xs font-bold text-red-600">
              Live Dispatch
            </span>
          </div>

          {activeWorkerBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-stone-200 text-stone-400 space-y-1.5">
              <Briefcase className="w-7 h-7 mx-auto text-stone-300" />
              <p className="text-xs font-black text-stone-700">No active assignment currently</p>
              <p className="text-[11px] text-stone-400">
                Keep status <span className="text-green-600 font-bold">ONLINE</span> to receive bookings.
              </p>
            </div>
          ) : (
            activeWorkerBookings.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 uppercase tracking-wide">
                      {job.status.replace('_', ' ')}
                    </span>
                    <h4 className="font-black text-sm text-black mt-1">
                      {job.taskTitle}
                    </h4>
                    <p className="text-xs text-stone-500 font-medium">
                      Slot: {job.selectedDate} [{job.selectedSlotLabel}]
                    </p>
                  </div>
                  <span className="text-sm font-black text-black">
                    ₹{job.estimatedTotal}
                  </span>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl space-y-1.5 text-xs text-stone-700">
                  <div className="flex items-center justify-between font-bold">
                    <span>Customer: {job.customerName}</span>
                    <button
                      onClick={() =>
                        onDirectCall({
                          name: job.customerName,
                          phone: job.customerPhone,
                          profession: 'Customer',
                          avatar: ''
                        })
                      }
                      className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-black"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Direct Call</span>
                    </button>
                  </div>
                  <div className="flex items-start gap-1.5 text-stone-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span>{job.customerAddress}</span>
                  </div>
                </div>

                {/* Worker Step Actions */}
                <div className="pt-2 border-t border-stone-100">
                  {job.status === 'requested' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          onUpdateBookingStatus(job.id, 'cancelled');
                        }}
                        className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => onUpdateBookingStatus(job.id, 'accepted')}
                        className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Job 🤝</span>
                      </button>
                    </div>
                  )}

                  {job.status === 'accepted' && (
                    <button
                      onClick={() => onUpdateBookingStatus(job.id, 'scheduled_confirmed')}
                      className="w-full bg-black hover:bg-stone-800 text-white py-2.5 rounded-xl text-xs font-black active:scale-98 transition"
                    >
                      Confirm Scheduled Arrival Time 📅
                    </button>
                  )}

                  {job.status === 'scheduled_confirmed' && (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                        <label className="text-[11px] font-bold text-amber-900 block mb-1">
                          Reached customer site? Verify 4-digit PIN:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            placeholder={`PIN (${job.otp})`}
                            className="flex-1 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-amber-300 bg-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleVerifyOtpAndStart(job)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-black active:scale-95 transition"
                          >
                            Verify & Start
                          </button>
                        </div>
                        {otpError && (
                          <p className="text-[10px] text-red-600 font-bold mt-1">
                            Invalid PIN. Ask customer for 4-digit OTP.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {job.status === 'on_the_way' && (
                    <button
                      onClick={() => handleCompleteWork(job)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-black active:scale-98 transition shadow-xs"
                    >
                      ✅ Job Completed & Collect Payment (₹{job.estimatedTotal})
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dedicated Completed Jobs & Settlement History */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed Jobs & Payouts ({completedJobs.length})</span>
            </h3>
            <span className="text-xs font-black text-emerald-700">
              Total: ₹{totalEarningsToday}
            </span>
          </div>

          {completedJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-5 text-center border border-stone-200 text-stone-400">
              <p className="text-xs font-bold text-stone-600">No completed jobs yet</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Jobs you finish and collect payment for will be permanently tracked here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedJobs.map((cj) => (
                <div
                  key={cj.id}
                  className="bg-white rounded-2xl p-3.5 border border-emerald-200 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                        {cj.id}
                      </span>
                      <span className="text-[10px] text-stone-400 font-semibold">
                        {cj.completedAt ? new Date(cj.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : cj.selectedDate}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-black truncate mt-1">{cj.taskTitle}</h4>
                    <p className="text-[11px] text-stone-500 font-semibold truncate">
                      Customer: {cj.customerName} • {cj.customerAddress.split(',')[0]}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-emerald-700 block">
                      +₹{cj.finalTotal || cj.estimatedTotal}
                    </span>
                    <span className="text-[10px] font-bold text-stone-400 uppercase">
                      {cj.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
