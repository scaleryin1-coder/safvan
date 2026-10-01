import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  ArrowUpDown, 
  HardHat, 
  User, 
  Calendar,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  Booking, 
  BookingStatus, 
  LocationCoordinates, 
  NotificationItem, 
  ServiceCategory, 
  TimeSlotId, 
  UserAccount, 
  UserRole, 
  WorkerProfile 
} from './types';
import { DEFAULT_LOCATIONS, INITIAL_WORKERS } from './data/mockData';
import { 
  fetchWorkers, 
  fetchBookings, 
  fetchNotifications, 
  createBooking, 
  updateBookingStatus, 
  upsertWorker, 
  deleteWorker,
  markAllNotificationsRead, 
  initLocalStore,
  getActiveSession,
  setActiveSession,
  setupSupabaseRealtime,
  normalizePhone
} from './lib/supabase';
import { getAdminSession, clearAdminSession, AdminSession } from './lib/adminAuth';
import { AdminLoginView } from './components/AdminLoginView';
import { HeaderTopBar } from './components/HeaderTopBar';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { CategoryFilter } from './components/CategoryFilter';
import { DateTimeSlotBar } from './components/DateTimeSlotBar';
import { WorkerCard } from './components/WorkerCard';
import { BookingSheetModal } from './components/BookingSheetModal';
import { BookingTrackingView } from './components/BookingTrackingView';
import { WorkerDashboard } from './components/WorkerDashboard';
import { WorkerRegistrationModal } from './components/WorkerRegistrationModal';
import { WorkerDetailModal } from './components/WorkerDetailModal';
import { AuthModal } from './components/AuthModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { CallModal } from './components/CallModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { BookingsListView } from './components/BookingsListView';
import { AdminDashboard } from './components/AdminDashboard';
import { AccountProfileModal } from './components/AccountProfileModal';
import { JobitAvatar } from './components/JobitAvatar';
import { usePWAInstall } from './hooks/usePWAInstall';
import { calculateDistanceKm, triggerHaptic, playSound } from './utils/feedback';

export default function App() {
  const { isInstallable, install } = usePWAInstall();

  // App core state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getActiveSession());
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates>(DEFAULT_LOCATIONS[0]); // Perinthalmanna
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active tracking view
  const [activeTrackingBooking, setActiveTrackingBooking] = useState<Booking | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | 'All'>('All');
  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotId | 'any'>('any');
  const [filterOnlyOnline, setFilterOnlyOnline] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'rate_low'>('distance');

  // Selected worker override for worker dashboard
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  // Modals state
  const [bookingWorker, setBookingWorker] = useState<WorkerProfile | null>(null);
  const [detailsWorker, setDetailsWorker] = useState<WorkerProfile | null>(null);
  const [callingContact, setCallingContact] = useState<{
    name: string;
    phone: string;
    profession: string;
    avatar?: string;
  } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  const [isWorkerRegOpen, setIsWorkerRegOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [phoneFrameMode, setPhoneFrameMode] = useState(false);
  const [justRegisteredWorker, setJustRegisteredWorker] = useState<WorkerProfile | null>(null);

  // Dedicated Secure /admin Route & Authentication State
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/') || window.location.hash === '#admin';
  });
  const [adminSession, setAdminSessionState] = useState<AdminSession | null>(() => getAdminSession());

  const loadAppData = async () => {
    try {
      const [w, b, n] = await Promise.all([
        fetchWorkers(),
        fetchBookings(),
        fetchNotifications()
      ]);
      setWorkers(w);
      setBookings(b);
      setNotifications(n);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initLocalStore();

    // Secure persistent session restore across page reloads
    const savedSession = getActiveSession();
    if (savedSession) {
      setCurrentUser(savedSession);
      if (savedSession.role === 'worker') {
        setUserRole('worker');
        setActiveTab('worker-hub');
        if (savedSession.workerProfileId) {
          setSelectedWorkerId(savedSession.workerProfileId);
        }
      } else if (savedSession.role === 'admin') {
        setUserRole('admin');
        setActiveTab('admin');
      }
    }

    loadAppData();

    const handleDataSync = () => {
      loadAppData();
      setCurrentUser(getActiveSession());
    };

    window.addEventListener('kaamkaro_data_sync', handleDataSync);
    window.addEventListener('storage', handleDataSync);

    const cleanupRealtime = setupSupabaseRealtime(() => {
      handleDataSync();
    });

    return () => {
      window.removeEventListener('kaamkaro_data_sync', handleDataSync);
      window.removeEventListener('storage', handleDataSync);
      cleanupRealtime();
    };
  }, []);

  // Synchronize dedicated /admin URL with router
  useEffect(() => {
    const handleUrlChange = () => {
      const isAdm = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/') || window.location.hash === '#admin';
      setIsAdminRoute(isAdm);
      setAdminSessionState(getAdminSession());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Recalculate distance for each worker relative to current user GPS location using Haversine formula
  const workersWithDistance = useMemo(() => {
    return (workers || []).map((w) => {
      const dist = calculateDistanceKm(
        currentLocation.lat,
        currentLocation.lng,
        w.location?.lat ?? 10.9760,
        w.location?.lng ?? 76.2254
      );
      return {
        ...w,
        distanceKm: dist
      };
    });
  }, [workers, currentLocation]);

  // Smart Matching Feed: Filter based on Main Category + Sub-Category + Date + Time Availability + Radius
  const matchingWorkers = useMemo(() => {
    return (workersWithDistance || []).filter((w) => {
      // Main Category match
      if (selectedCategory !== 'All' && w.profession !== selectedCategory) {
        return false;
      }

      // Sub-Category match (Requirement: Clicking main category allows selecting specific sub-category)
      if (selectedSubCategory !== 'All' && selectedCategory !== 'All') {
        const matchesSub = w.subCategory === selectedSubCategory;
        const matchesSkills = Array.isArray(w.skills) && w.skills.some(
          (s) => s.toLowerCase() === selectedSubCategory.toLowerCase()
        );
        if (!matchesSub && !matchesSkills) {
          return false;
        }
      }

      // Date availability
      if (selectedDate && Array.isArray(w.availableDays) && !w.availableDays.includes(selectedDate)) {
        return false;
      }

      // Time Slot availability
      if (selectedSlot !== 'any' && Array.isArray(w.availableSlots) && !w.availableSlots.includes(selectedSlot)) {
        return false;
      }

      // Online filter
      if (filterOnlyOnline && !w.isOnline) {
        return false;
      }

      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = w.name?.toLowerCase().includes(q);
        const matchProf = w.profession?.toLowerCase().includes(q);
        const matchSub = w.subCategory?.toLowerCase().includes(q);
        const matchSkill = Array.isArray(w.skills) && w.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchProf && !matchSub && !matchSkill) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'rate_low') {
        return a.hourlyRate - b.hourlyRate;
      }
      return 0;
    });
  }, [workersWithDistance, selectedCategory, selectedSubCategory, selectedDate, selectedSlot, filterOnlyOnline, searchQuery, sortBy]);

  // Active bookings count
  const activeBookingsCount = useMemo(() => {
    return (bookings || []).filter((b) => b && b.status !== 'completed' && b.status !== 'cancelled').length;
  }, [bookings]);

  // Unread notifications count
  const unreadNotifsCount = useMemo(() => {
    return (notifications || []).filter((n) => n && !n.read).length;
  }, [notifications]);

  // Active worker profile for Worker mode
  const activeWorkerProfile = useMemo(() => {
    if (selectedWorkerId) {
      const match = (workers || []).find((w) => w.id === selectedWorkerId);
      if (match) return match;
    }
    if (currentUser?.workerProfileId) {
      const match = (workers || []).find((w) => w.id === currentUser.workerProfileId);
      if (match) return match;
    }
    if (currentUser?.phone) {
      const cleanPhone = currentUser.phone.replace(/\D/g, '').slice(-10);
      const match = (workers || []).find((w) => w.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
      if (match) return match;
    }
    return (workers || [])[0] || null;
  }, [workers, currentUser, selectedWorkerId]);

  // Public role toggle strictly cycles between Customer and Worker (Admin is restricted to /admin route)
  const handleToggleRole = () => {
    triggerHaptic('medium');
    const nextRole: UserRole = userRole === 'customer' ? 'worker' : 'customer';
    setUserRole(nextRole);
    setActiveTab(nextRole === 'worker' ? 'worker-hub' : 'home');
  };

  const navigateToAdmin = () => {
    triggerHaptic('medium');
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
  };

  const navigateToPublic = () => {
    triggerHaptic('light');
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  const handleToggleWorkerVerify = async (workerId: string) => {
    const target = workers.find((w) => w.id === workerId);
    if (!target) return;
    const updated = { ...target, verified: !target.verified };
    await upsertWorker(updated);
    setWorkers((prev) => prev.map((w) => (w.id === workerId ? updated : w)));
  };

  const handleToggleWorkerOnline = async (workerId: string) => {
    const target = workers.find((w) => w.id === workerId);
    if (!target) return;
    const updated = { ...target, isOnline: !target.isOnline };
    await upsertWorker(updated);
    setWorkers((prev) => prev.map((w) => (w.id === workerId ? updated : w)));
  };

  const handleDeleteWorker = async (workerId: string) => {
    await deleteWorker(workerId);
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
  };

  const handleBookingConfirmed = async (bookingData: Partial<Booking>) => {
    const customerDisplayName = currentUser?.name || 'Verified Customer';
    const customerPhoneNum = currentUser?.displayPhone || currentUser?.phone || '+91 98470 11223';
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking: Booking = {
      id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: currentUser?.id || `cust-${Date.now()}`,
      customerName: customerDisplayName,
      customerPhone: customerPhoneNum,
      customerAddress: bookingData.customerAddress || currentLocation.address,
      customerLocation: currentLocation,
      workerId: bookingData.workerId || '',
      workerName: bookingData.workerName || '',
      workerPhone: bookingData.workerPhone || '',
      workerProfession: bookingData.workerProfession || (selectedCategory !== 'All' ? selectedCategory : 'Electrician'),
      subCategory: bookingData.subCategory || (selectedSubCategory !== 'All' ? selectedSubCategory : undefined),
      taskTitle: bookingData.taskTitle || 'Service Request',
      taskDescription: bookingData.taskDescription || 'Direct hyperlocal repair',
      selectedDate: bookingData.selectedDate || selectedDate,
      selectedSlot: bookingData.selectedSlot || 'morning',
      selectedSlotLabel: bookingData.selectedSlotLabel || 'Morning (08:00 AM - 11:00 AM)',
      status: 'requested',
      createdAt: new Date().toISOString(),
      otp: randomOtp,
      hourlyRate: bookingData.hourlyRate || 160,
      estimatedHours: bookingData.estimatedHours || 1.5,
      estimatedTotal: bookingData.estimatedTotal || 240,
      invoiceNumber: `INV-JOBIT-${Math.floor(100000 + Math.random() * 900000)}`,
      baseCharge: 99,
      safetyFee: 29,
      serviceFee: 0,
      paymentMethod: bookingData.paymentMethod || 'upi',
      paymentStatus: 'pending',
      timeline: [
        {
          status: 'requested',
          time: 'Just now',
          label: 'Booking Request Placed',
          description: `Dispatched to ${bookingData.workerName || 'assigned worker'} for ${bookingData.selectedDate} [${bookingData.selectedSlotLabel}].`
        }
      ]
    };

    setBookingWorker(null);
    await createBooking(newBooking);
    await loadAppData();
    setActiveTrackingBooking(newBooking);
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: BookingStatus,
    extra?: Partial<Booking>
  ) => {
    const updated = await updateBookingStatus(bookingId, status, extra);
    if (updated) {
      if (activeTrackingBooking && activeTrackingBooking.id === bookingId) {
        setActiveTrackingBooking(updated);
      }
      await loadAppData();
    }
  };

  const handleWorkerRegistered = async (newWorker: WorkerProfile) => {
    // 1. Instantly inject into local React state so it immediately reflects on the main interface without manual refresh!
    setWorkers((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const filtered = safePrev.filter(
        (w) => w.id !== newWorker.id && normalizePhone(w.phone) !== normalizePhone(newWorker.phone)
      );
      return [newWorker, ...filtered];
    });

    // 2. Select this worker and close registration modal
    setSelectedWorkerId(newWorker.id);
    setIsWorkerRegOpen(false);

    // 3. Set filters so the newly registered worker is immediately visible on the main interface
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setFilterOnlyOnline(false);
    setJustRegisteredWorker(newWorker);

    // 4. Set active user session to worker role
    const freshSession = getActiveSession();
    if (freshSession) {
      setCurrentUser(freshSession);
      setUserRole('worker');
    }

    // 5. Navigate to main interface so user sees their new worker profile dynamically in the feed
    setActiveTab('home');

    // 6. Reload full app data asynchronously in background
    await loadAppData();
    playSound('success');
    triggerHaptic('success');
  };

  const handleLogout = () => {
    setActiveSession(null);
    setCurrentUser(null);
    setUserRole('customer');
    setActiveTab('home');
    setSelectedWorkerId(null);
    loadAppData();
    triggerHaptic('medium');
    playSound('pop');
  };

  const handleWorkerUpdated = async (updated: WorkerProfile) => {
    await upsertWorker(updated);
    await loadAppData();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    await loadAppData();
  };

  const handleLoginSuccess = (account: UserAccount) => {
    setCurrentUser(account);
    setActiveSession(account);
    setUserRole(account.role);
    if (account.role === 'worker') {
      setActiveTab('worker-hub');
    } else if (account.role === 'admin') {
      setActiveTab('admin');
    }
    loadAppData();
  };

  // If viewing active live tracker
  if (activeTrackingBooking) {
    return (
      <div className="min-h-screen bg-stone-100 flex justify-center">
        <div className="w-full max-w-md bg-stone-50 min-h-screen shadow-2xl relative">
          <BookingTrackingView
            booking={activeTrackingBooking}
            onBack={() => setActiveTrackingBooking(null)}
            onUpdateStatus={handleUpdateBookingStatus}
            onDirectCall={(w) => setCallingContact(w)}
          />
          {callingContact && (
            <CallModal
              contact={callingContact}
              onClose={() => setCallingContact(null)}
            />
          )}
        </div>
      </div>
    );
  }

  // Dedicated Secure /admin Route
  if (isAdminRoute) {
    if (!adminSession) {
      return (
        <AdminLoginView
          onLoginSuccess={(session) => {
            setAdminSessionState(session);
            setUserRole('admin');
            loadAppData();
          }}
          onExit={navigateToPublic}
        />
      );
    }

    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex justify-center">
        <div className="w-full max-w-md bg-stone-900 min-h-screen shadow-2xl relative flex flex-col">
          <AdminDashboard
            bookings={bookings}
            workers={workers}
            accounts={[]}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onRefreshData={loadAppData}
            onOpenConfigModal={() => setIsConfigOpen(true)}
            onLogoutAdmin={() => {
              clearAdminSession();
              setAdminSessionState(null);
              setUserRole('customer');
              navigateToPublic();
            }}
            onToggleWorkerVerify={handleToggleWorkerVerify}
            onToggleWorkerOnline={handleToggleWorkerOnline}
            onDeleteWorker={handleDeleteWorker}
            onDirectCall={(w) => setCallingContact(w)}
          />
          {callingContact && (
            <CallModal
              contact={callingContact}
              onClose={() => setCallingContact(null)}
            />
          )}
          {isConfigOpen && (
            <SupabaseConfigModal
              onClose={() => setIsConfigOpen(false)}
              onConfigSaved={loadAppData}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-stone-100 flex justify-center text-stone-900 ${phoneFrameMode ? 'p-0 sm:py-8' : ''}`}>
      {/* Mobile Shell Container */}
      <div 
        className={`w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden ${
          phoneFrameMode ? 'sm:rounded-[40px] sm:border-[8px] sm:border-black sm:min-h-[840px] sm:max-h-[92vh] sm:overflow-y-auto sm:no-scrollbar' : ''
        }`}
      >
        {/* Sticky Header Top Bar - Backend Debug Text Hidden from Normal Users */}
        <HeaderTopBar
          currentLocation={currentLocation}
          onOpenLocationPicker={() => setIsLocPickerOpen(true)}
          userRole={userRole}
          onToggleRole={handleToggleRole}
          unreadCount={unreadNotifsCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          isInstallable={isInstallable}
          onInstallApp={install}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onLogout={handleLogout}
        />

        {/* PWA Banner */}
        <PWAInstallBanner />

        {/* Main Content Body */}
        <main className="flex-1 pb-20">
          {activeTab === 'home' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="px-4 pt-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Electrician, Plumber, AC Repair, Mason..."
                    className="w-full bg-stone-100 hover:bg-stone-200/60 focus:bg-white text-xs font-bold pl-10 pr-10 py-3 rounded-2xl border border-transparent focus:border-red-600 focus:outline-none transition shadow-inner text-black"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Service Categories Carousel & Sub-Category Pill Selector */}
              <CategoryFilter
                selectedCategory={selectedCategory}
                selectedSubCategory={selectedSubCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setSelectedSubCategory('All');
                }}
                onSelectSubCategory={(sub) => setSelectedSubCategory(sub)}
              />

              {/* Interactive Date & Time Slot Picker */}
              <DateTimeSlotBar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                matchingCount={matchingWorkers.length}
              />

              {/* Filter Chips Bar */}
              <div className="flex items-center gap-1.5 px-4 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setFilterOnlyOnline(!filterOnlyOnline);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border transition whitespace-nowrap active:scale-95 ${
                    filterOnlyOnline
                      ? 'bg-green-50 text-green-700 border-green-300'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${filterOnlyOnline ? 'bg-green-500 animate-pulse' : 'bg-stone-300'}`} />
                  <span>Online Only</span>
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setSortBy((prev) => (prev === 'distance' ? 'rate_low' : prev === 'rate_low' ? 'rating' : 'distance'));
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black border border-stone-200 bg-white text-black whitespace-nowrap active:scale-95"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-red-600" />
                  <span>
                    Sort: {sortBy === 'distance' ? 'Nearest Distance' : sortBy === 'rate_low' ? 'Lowest Hourly' : 'Highest Rated'}
                  </span>
                </button>
              </div>

              {/* Dynamic Live Registration Success Banner */}
              {justRegisteredWorker && (
                <div className="mx-4 mb-2 p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl shadow-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-black text-xs shadow-xs mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black text-emerald-950">
                          Worker Profile Live in Directory!
                        </p>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <p className="text-[11px] text-emerald-800 font-bold mt-0.5">
                        {justRegisteredWorker.name} ({justRegisteredWorker.profession}) was saved to the database and is now live on the main interface.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setJustRegisteredWorker(null)}
                    className="p-1 rounded-full text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 transition shrink-0"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Workers Feed Header */}
              <div className="flex items-center justify-between px-4 pt-1">
                <div>
                  <h2 className="text-sm font-black text-black">
                    Available Workers ({matchingWorkers.length})
                  </h2>
                  <p className="text-[11px] text-stone-500 font-semibold">
                    Matching {selectedDate} • {selectedCategory === 'All' ? 'All Services' : selectedCategory}
                    {selectedSubCategory !== 'All' ? ` > ${selectedSubCategory}` : ''}
                  </p>
                </div>

                <button
                  onClick={() => setIsWorkerRegOpen(true)}
                  className="text-[11px] font-black text-red-600 hover:underline flex items-center gap-0.5"
                >
                  <span>+ Register as a Worker</span>
                </button>
              </div>

              {/* Workers Feed with Real Database Profiles */}
              <div className="px-4 space-y-3 pb-4">
                {isLoading ? (
                  <div className="py-12 text-center text-stone-400">
                    <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold">Scanning {currentLocation.name.split(',')[0]} radius for available workers...</p>
                  </div>
                ) : matchingWorkers.length === 0 ? (
                  <div className="bg-stone-50 rounded-3xl p-6 text-center border border-stone-200 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                      <HardHat className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-black text-black text-sm">
                        {selectedCategory !== 'All' ? `No ${selectedCategory} workers registered yet` : 'No workers registered in this area yet'}
                      </p>
                      <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                        Be the first verified professional to join JOBit in {currentLocation.name.split(',')[0]}!
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-1 max-w-xs mx-auto">
                      <button
                        onClick={() => setIsWorkerRegOpen(true)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4 py-3 rounded-2xl shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
                      >
                        <HardHat className="w-4 h-4 text-white" />
                        <span>Register as a Worker</span>
                      </button>

                      {(selectedCategory !== 'All' || selectedSlot !== 'any') && (
                        <button
                          onClick={() => {
                            setSelectedCategory('All');
                            setSelectedSubCategory('All');
                            setSelectedSlot('any');
                            setFilterOnlyOnline(false);
                          }}
                          className="text-xs text-stone-600 font-bold hover:underline"
                        >
                          Reset Filters & View All
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  matchingWorkers.map((worker) => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      selectedDate={selectedDate}
                      selectedSlot={selectedSlot}
                      onBook={(w) => setBookingWorker(w)}
                      onViewDetails={(w) => setDetailsWorker(w)}
                    />
                  ))
                )}

                {/* Discrete Admin Console access link */}
                <div className="pt-8 pb-3 text-center border-t border-stone-100">
                  <button
                    onClick={navigateToAdmin}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-400 hover:text-red-600 transition px-3 py-1.5 rounded-full hover:bg-stone-50"
                  >
                    <Shield className="w-3.5 h-3.5 text-stone-400" />
                    <span>Administrator Console (/admin)</span>
                  </button>
                  <p className="text-[10px] text-stone-300 font-mono mt-0.5">Strict OTP Verification Required</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <BookingsListView
              bookings={bookings}
              onSelectBooking={(b) => setActiveTrackingBooking(b)}
              onExploreServices={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'worker-hub' && (
            <WorkerDashboard
              currentWorker={activeWorkerProfile}
              onUpdateWorker={handleWorkerUpdated}
              bookings={bookings}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onDirectCall={(c) => setCallingContact(c)}
              onOpenWorkerRegistration={() => setIsWorkerRegOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
              allWorkers={workers}
              onSelectWorker={(w) => setSelectedWorkerId(w.id)}
            />
          )}

          {/* Dedicated Admin Dashboard View */}
          {activeTab === 'admin' && (
            <AdminDashboard
              bookings={bookings}
              workers={workers}
              accounts={[]}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onRefreshData={loadAppData}
              onOpenConfigModal={() => setIsConfigOpen(true)}
            />
          )}

          {activeTab === 'notifications' && (
            <div className="p-4 max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-black text-black">Notifications & Alerts</h1>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-black text-red-600 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-400">
                    <Clock className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                    <p className="text-xs font-bold text-stone-600">No notifications yet</p>
                    <p className="text-[11px] text-stone-400 mt-1">Booking updates and job alerts will appear here.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.bookingId) {
                          const match = bookings.find((b) => b.id === item.bookingId);
                          if (match) setActiveTrackingBooking(match);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition ${
                        item.read
                          ? 'bg-white border-stone-200 text-stone-600'
                          : 'bg-red-50/70 border-red-200 text-black font-semibold shadow-xs'
                      } ${item.bookingId ? 'cursor-pointer hover:border-red-300' : ''}`}
                    >
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-black text-xs text-black">{item.title}</h4>
                        <span className="text-[10px] text-stone-400">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 font-medium">{item.message}</p>
                      {item.bookingId && (
                        <span className="inline-block mt-2 text-[10px] font-black text-red-600">
                          View Tracking ➔
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>

        {/* Fixed Mobile Bottom Bar with Admin support */}
        <BottomNavBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          userRole={userRole}
          activeBookingsCount={activeBookingsCount}
          unreadNotifsCount={unreadNotifsCount}
        />

        {/* Desktop Phone Mockup Toggle */}
        <div className="hidden sm:block fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setPhoneFrameMode(!phoneFrameMode)}
            className="flex items-center gap-1.5 bg-black text-white text-xs font-black px-3 py-2 rounded-full shadow-xl hover:bg-stone-800 transition"
          >
            <Smartphone className="w-4 h-4 text-red-500" />
            <span>{phoneFrameMode ? 'Full Screen' : 'Phone Frame'}</span>
          </button>
        </div>

        {/* Modals */}
        {bookingWorker && (
          <BookingSheetModal
            worker={bookingWorker}
            customerLocation={currentLocation}
            initialDate={selectedDate}
            initialSlot={selectedSlot}
            onClose={() => setBookingWorker(null)}
            onConfirmBooking={handleBookingConfirmed}
          />
        )}

        {detailsWorker && (
          <WorkerDetailModal
            worker={detailsWorker}
            onClose={() => setDetailsWorker(null)}
            onBook={(w) => {
              setDetailsWorker(null);
              setBookingWorker(w);
            }}
          />
        )}

        {callingContact && (
          <CallModal
            contact={callingContact}
            onClose={() => setCallingContact(null)}
          />
        )}

        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            defaultRole={userRole}
          />
        )}

        {currentUser && isProfileOpen && (
          <AccountProfileModal
            isOpen={isProfileOpen}
            currentUser={currentUser}
            onClose={() => setIsProfileOpen(false)}
            onLogout={handleLogout}
            onOpenAdminConsole={navigateToAdmin}
            onSwitchToWorker={() => {
              setUserRole('worker');
              setActiveTab('worker-hub');
            }}
          />
        )}

        {isLocPickerOpen && (
          <LocationPickerModal
            currentLocation={currentLocation}
            onClose={() => setIsLocPickerOpen(false)}
            onSelectLocation={(loc) => setCurrentLocation(loc)}
          />
        )}

        {isWorkerRegOpen && (
          <WorkerRegistrationModal
            currentLocation={currentLocation}
            initialPhone={currentUser?.phone || ''}
            onClose={() => setIsWorkerRegOpen(false)}
            onRegister={handleWorkerRegistered}
          />
        )}

        {/* Supabase Config Modal - only opened by admin from Admin Dashboard */}
        {isConfigOpen && (
          <SupabaseConfigModal
            onClose={() => setIsConfigOpen(false)}
            onConfigSaved={loadAppData}
          />
        )}

        {isNotificationsOpen && (
          <NotificationsModal
            notifications={notifications}
            onClose={() => setIsNotificationsOpen(false)}
            onMarkAllRead={handleMarkAllRead}
            onSelectBooking={(bId) => {
              const match = bookings.find((b) => b.id === bId);
              if (match) setActiveTrackingBooking(match);
            }}
          />
        )}
      </div>
    </div>
  );
}
