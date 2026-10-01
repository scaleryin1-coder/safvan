import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  HardHat, 
  Phone, 
  IndianRupee, 
  Calendar, 
  Filter, 
  ArrowUpDown, 
  RefreshCw, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X,
  Sparkles,
  Zap,
  Check,
  CheckCheck,
  LogOut,
  Activity,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Power
} from 'lucide-react';
import { Booking, BookingStatus, WorkerProfile, UserAccount } from '../types';
import { JobitAvatar } from './JobitAvatar';
import { formatDisplayPhone, reassignBookingWorker, updateBookingStatus } from '../lib/supabase';
import { triggerHaptic, playSound } from '../utils/feedback';

interface AdminDashboardProps {
  bookings: Booking[];
  workers: WorkerProfile[];
  accounts?: UserAccount[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus, extra?: Partial<Booking>) => void;
  onRefreshData: () => void;
  onOpenConfigModal?: () => void;
  onLogoutAdmin?: () => void;
  onToggleWorkerVerify?: (workerId: string) => void;
  onToggleWorkerOnline?: (workerId: string) => void;
  onDeleteWorker?: (workerId: string) => void;
  onDirectCall?: (contact: { name: string; phone: string; profession: string; avatar?: string }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  bookings = [],
  workers = [],
  accounts = [],
  onUpdateBookingStatus,
  onRefreshData,
  onOpenConfigModal,
  onLogoutAdmin,
  onToggleWorkerVerify,
  onToggleWorkerOnline,
  onDeleteWorker,
  onDirectCall,
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'workers' | 'completed_alerts' | 'activity_log'>('bookings');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reassignModalBooking, setReassignModalBooking] = useState<Booking | null>(null);
  const [liveCompletionAlert, setLiveCompletionAlert] = useState<Booking | null>(null);

  // Monitor real-time completions
  useEffect(() => {
    const handleSync = (e: any) => {
      const detail = e.detail;
      if (detail && detail.type === 'booking_updated' && detail.status === 'completed') {
        setLiveCompletionAlert(detail.booking);
        playSound('ding');
        triggerHaptic('success');
      }
    };

    window.addEventListener('kaamkaro_data_sync', handleSync);
    return () => window.removeEventListener('kaamkaro_data_sync', handleSync);
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && b.status !== 'requested') return false;
      if (statusFilter === 'assigned' && !['accepted', 'scheduled_confirmed', 'on_the_way'].includes(b.status)) return false;
      if (statusFilter === 'completed' && b.status !== 'completed') return false;
      if (statusFilter === 'cancelled' && b.status !== 'cancelled') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCustomer = b.customerName?.toLowerCase().includes(q) || b.customerPhone?.includes(q);
      const matchWorker = b.workerName?.toLowerCase().includes(q) || b.workerPhone?.includes(q);
      const matchTask = b.taskTitle?.toLowerCase().includes(q) || b.id?.toLowerCase().includes(q);
      const matchCategory = b.workerProfession?.toLowerCase().includes(q);
      if (!matchCustomer && !matchWorker && !matchTask && !matchCategory) return false;
    }

    return true;
  });

  // Analytics Metrics
  const totalBookings = bookings.length;
  const requestedBookings = bookings.filter((b) => b.status === 'requested').length;
  const activeAssignedBookings = bookings.filter((b) => ['accepted', 'scheduled_confirmed', 'on_the_way'].includes(b.status)).length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.finalTotal || b.estimatedTotal || 0), 0);

  const handleReassign = async (booking: Booking, worker: WorkerProfile) => {
    triggerHaptic('medium');
    playSound('ding');
    await reassignBookingWorker(booking.id, worker);
    setReassignModalBooking(null);
    onRefreshData();
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto text-stone-900 pb-24">
      {/* Admin Header Banner */}
      <div className="bg-stone-950 text-white rounded-3xl p-5 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight">Admin Operations Hub</h1>
                <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Admin
                </span>
              </div>
              <p className="text-[11px] text-stone-400">Real-time dispatch, worker tracking & verification</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('light');
                onRefreshData();
              }}
              title="Refresh data"
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {onOpenConfigModal && (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onOpenConfigModal();
                }}
                title="Database Settings (Admin Only)"
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
            {onLogoutAdmin && (
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onLogoutAdmin();
                }}
                title="Sign Out of Admin Console"
                className="py-1.5 px-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60 transition flex items-center gap-1.5 text-xs font-black shadow-xs active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden xs:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-stone-800/80 relative z-10 text-center">
          <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800">
            <span className="text-[10px] text-stone-400 font-bold block uppercase">Total</span>
            <span className="text-base font-black text-white">{totalBookings}</span>
          </div>
          <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800">
            <span className="text-[10px] text-amber-400 font-bold block uppercase">Incoming</span>
            <span className="text-base font-black text-amber-400">{requestedBookings}</span>
          </div>
          <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800">
            <span className="text-[10px] text-blue-400 font-bold block uppercase">Assigned</span>
            <span className="text-base font-black text-blue-400">{activeAssignedBookings}</span>
          </div>
          <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800">
            <span className="text-[10px] text-emerald-400 font-bold block uppercase">Done</span>
            <span className="text-base font-black text-emerald-400">{completedBookings}</span>
          </div>
        </div>
      </div>

      {/* Live Real-Time Completion Alert Banner */}
      {liveCompletionAlert && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 shadow-md animate-in slide-in-from-top-2 duration-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                  Live Job Completed
                </span>
                <span className="text-xs font-black text-emerald-950">ID: {liveCompletionAlert.id}</span>
              </div>
              <p className="text-xs text-emerald-900 mt-0.5 font-semibold">
                {liveCompletionAlert.workerName} finished job for {liveCompletionAlert.customerName} (₹{liveCompletionAlert.finalTotal || liveCompletionAlert.estimatedTotal})
              </p>
            </div>
          </div>
          <button
            onClick={() => setLiveCompletionAlert(null)}
            className="text-stone-400 hover:text-stone-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100 rounded-2xl border border-stone-200">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('bookings');
          }}
          className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'bookings'
              ? 'bg-white text-black shadow-xs'
              : 'text-stone-600 hover:text-black'
          }`}
        >
          <span>Jobs ({bookings.length})</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('workers');
          }}
          className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'workers'
              ? 'bg-white text-black shadow-xs'
              : 'text-stone-600 hover:text-black'
          }`}
        >
          <span>Workers ({workers.length})</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('completed_alerts');
          }}
          className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'completed_alerts'
              ? 'bg-white text-black shadow-xs'
              : 'text-stone-600 hover:text-black'
          }`}
        >
          <span>Settled ({completedBookings})</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('activity_log');
          }}
          className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'activity_log'
              ? 'bg-white text-black shadow-xs'
              : 'text-stone-600 hover:text-black'
          }`}
        >
          <span>Live Log</span>
        </button>
      </div>

      {/* TAB 1: ALL BOOKINGS DISPATCH & TRACKING */}
      {activeTab === 'bookings' && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, worker, task, ID..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-black focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'pending', label: 'Incoming / Requested' },
              { id: 'assigned', label: 'Worker Assigned' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  triggerHaptic('light');
                  setStatusFilter(f.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition border ${
                  statusFilter === f.id
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          <div className="space-y-2.5">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500">
                <Clock className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <p className="font-black text-black text-sm">No bookings found</p>
                <p className="text-xs text-stone-500 mt-1">
                  Incoming customer bookings will appear here in real-time.
                </p>
              </div>
            ) : (
              filteredBookings.map((b) => {
                const isCompleted = b.status === 'completed';
                const isRequested = b.status === 'requested';
                const isAssigned = ['accepted', 'scheduled_confirmed', 'on_the_way'].includes(b.status);

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-stone-300 shadow-xs space-y-3 transition"
                  >
                    {/* Top Row: ID, Status Badge, Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-black bg-stone-100 px-2 py-0.5 rounded-md">
                          {b.id}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRequested
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : isAssigned
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>

                      <span className="text-[10px] font-semibold text-stone-400">
                        {b.selectedDate} • {b.selectedSlot}
                      </span>
                    </div>

                    {/* Task Title & Subcategory */}
                    <div>
                      <h3 className="font-black text-sm text-black">{b.taskTitle}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-600 font-semibold">
                        <span className="text-red-600 font-extrabold">{b.workerProfession}</span>
                        {b.subCategory && (
                          <>
                            <span className="text-stone-300">•</span>
                            <span className="bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">{b.subCategory}</span>
                          </>
                        )}
                        <span className="text-stone-300">•</span>
                        <span className="font-bold text-black">₹{b.finalTotal || b.estimatedTotal}</span>
                      </div>
                    </div>

                    {/* Parties: Customer & Assigned Worker */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs">
                      {/* Customer Info */}
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-400 block uppercase mb-1">
                          👤 Customer
                        </span>
                        <p className="font-black text-black truncate">{b.customerName}</p>
                        <p className="text-[11px] text-stone-600 font-mono mt-0.5">{b.customerPhone}</p>
                        <p className="text-[10px] text-stone-500 truncate mt-1">
                          📍 {b.customerAddress}
                        </p>
                      </div>

                      {/* Assigned Worker Info */}
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-400 block uppercase mb-1">
                          ⚡ Assigned Pro
                        </span>
                        {b.workerName ? (
                          <>
                            <p className="font-black text-black truncate">{b.workerName}</p>
                            <p className="text-[11px] text-stone-600 font-mono mt-0.5">{b.workerPhone}</p>
                            <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Assigned
                            </span>
                          </>
                        ) : (
                          <div className="text-stone-400 italic text-[11px] py-1">
                            No worker assigned yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-stone-600">
                        <span>OTP:</span>
                        <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-black font-black">
                          {b.otp}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Reassign Worker Button */}
                        <button
                          onClick={() => setReassignModalBooking(b)}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-black text-xs font-black rounded-xl border border-stone-300 transition active:scale-95"
                        >
                          Reassign Pro
                        </button>

                        {/* Force Mark Complete / Verify */}
                        {!isCompleted && b.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              triggerHaptic('medium');
                              onUpdateBookingStatus(b.id, 'completed');
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REGISTERED WORKERS OVERVIEW (Strict Phone Uniqueness Rule Verified) */}
      {activeTab === 'workers' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-black">Live Worker Profiles ({workers.length})</h2>
              <p className="text-[11px] text-stone-500 font-semibold">Verified professional worker directory</p>
            </div>
            <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Real DB Verified
            </span>
          </div>

          <div className="space-y-2">
            {workers.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500">
                <HardHat className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <p className="font-black text-black text-sm">No registered workers in database</p>
                <p className="text-xs text-stone-500 mt-1">
                  Workers who register via the Worker Onboarding flow will be listed here dynamically.
                </p>
              </div>
            ) : (
              workers.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <JobitAvatar isOnline={w.isOnline} size="md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-sm text-black">{w.name}</h3>
                          {w.verified && (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono font-bold text-stone-700 mt-0.5">
                          📞 {w.phone}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-600">
                          <span className="font-extrabold text-red-600">{w.profession}</span>
                          <span>•</span>
                          <span>₹{w.hourlyRate}/hr</span>
                          <span>•</span>
                          <span>{w.experience} Yrs</span>
                          <span>•</span>
                          <span>{w.jobsCompleted} Jobs Done</span>
                        </div>
                        {Array.isArray(w.skills) && w.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {w.skills.slice(0, 3).map((s, idx) => (
                              <span key={idx} className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        w.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {w.isOnline ? 'Online' : 'Offline'}
                      </span>
                      <p className="text-[10px] text-stone-400 mt-2 font-mono">
                        📍 {w.location?.name?.split(',')[0] || 'Perinthalmanna'}
                      </p>
                    </div>
                  </div>

                  {/* Worker Quick Management Actions */}
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {onToggleWorkerVerify && (
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            onToggleWorkerVerify(w.id);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition active:scale-95 ${
                            w.verified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-stone-100 text-stone-600 border-stone-300'
                          }`}
                        >
                          {w.verified ? '✓ Verified' : '+ Verify'}
                        </button>
                      )}
                      {onToggleWorkerOnline && (
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            onToggleWorkerOnline(w.id);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition active:scale-95 ${
                            w.isOnline
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                        >
                          {w.isOnline ? 'Online' : 'Standby'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {onDirectCall && (
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            onDirectCall({ name: w.name, phone: w.phone, profession: w.profession });
                          }}
                          className="p-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          title="Call Worker"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteWorker && (
                        <button
                          onClick={() => {
                            if (confirm(`Suspend and delist worker ${w.name}?`)) {
                              triggerHaptic('warning');
                              onDeleteWorker(w.id);
                            }
                          }}
                          className="p-1 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          title="Delete Worker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    )}

      {/* TAB 3: REAL-TIME COMPLETED JOBS & ALERTS */}
      {activeTab === 'completed_alerts' && (
        <div className="space-y-3">
          <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black">Completed Jobs & Settlements</h2>
              <p className="text-[11px] text-emerald-100">Live feed of verified completed tasks</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-200 block uppercase font-bold">Total Revenue</span>
              <span className="text-base font-black">₹{totalRevenue}</span>
            </div>
          </div>

          <div className="space-y-2">
            {bookings.filter((b) => b.status === 'completed').length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500">
                <CheckCircle2 className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <p className="font-black text-black text-sm">No completed jobs yet</p>
                <p className="text-xs text-stone-500 mt-1">
                  When a worker marks a job completed, it triggers an instant real-time alert and records here.
                </p>
              </div>
            ) : (
              bookings
                .filter((b) => b.status === 'completed')
                .map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {b.id}
                      </span>
                      <span className="text-[10px] font-bold text-stone-400">
                        {b.completedAt ? new Date(b.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Completed'}
                      </span>
                    </div>

                    <h3 className="font-black text-sm text-black">{b.taskTitle}</h3>
                    <p className="text-xs text-stone-600">
                      <strong>Customer:</strong> {b.customerName} ({b.customerPhone})
                    </p>
                    <p className="text-xs text-stone-600">
                      <strong>Worker:</strong> {b.workerName} ({b.workerPhone})
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <span className="text-xs font-bold text-stone-500">
                        Paid via <strong className="text-black uppercase">{b.paymentMethod}</strong>
                      </span>
                      <span className="text-sm font-black text-emerald-700">
                        ₹{b.finalTotal || b.estimatedTotal} Settled
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REAL-TIME PLATFORM ACTIVITY AUDIT STREAM */}
      {activeTab === 'activity_log' && (
        <div className="space-y-3">
          <div className="bg-stone-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500 animate-pulse" />
              <div>
                <h2 className="text-sm font-black">Live Platform Audit Stream</h2>
                <p className="text-[11px] text-stone-400">Real-time dispatch and worker activity</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Live
            </span>
          </div>

          <div className="space-y-2">
            {bookings.length === 0 && workers.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500">
                <Activity className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <p className="font-black text-black text-sm">No activity recorded yet</p>
              </div>
            ) : (
              bookings
                .flatMap((b) =>
                  (b.timeline || []).map((t, idx) => ({
                    id: `${b.id}-${idx}`,
                    bookingId: b.id,
                    title: b.taskTitle,
                    label: t.label,
                    desc: t.description,
                    time: t.time,
                    status: t.status,
                    customer: b.customerName,
                    worker: b.workerName
                  }))
                )
                .slice(-12)
                .reverse()
                .map((evt) => (
                  <div key={evt.id} className="bg-white p-3 rounded-2xl border border-stone-200 text-xs shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[10px] text-stone-400">{evt.time}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {evt.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-black text-black">{evt.label} • {evt.bookingId}</p>
                    <p className="text-[11px] text-stone-600">{evt.desc}</p>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* REASSIGN WORKER MODAL */}
      {reassignModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-5 border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-black">Reassign Job</h3>
                <p className="text-xs text-stone-500">Booking {reassignModalBooking.id}</p>
              </div>
              <button
                onClick={() => setReassignModalBooking(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 font-semibold">
              Select any registered worker from the live database to assign to <strong>{reassignModalBooking.taskTitle}</strong>:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {workers.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">No other workers registered in database.</p>
              ) : (
                workers.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleReassign(reassignModalBooking, w)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 hover:border-red-600 hover:bg-red-50/50 flex items-center justify-between text-left transition"
                  >
                    <div>
                      <p className="text-xs font-black text-black">{w.name}</p>
                      <p className="text-[11px] text-stone-500 font-semibold">{w.profession} • ₹{w.hourlyRate}/hr • {w.phone}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded-lg">
                      Assign
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
