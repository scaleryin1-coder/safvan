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
  Clock
} from 'lucide-react';
import { 
  Booking, 
  BookingStatus, 
  LocationCoordinates, 
  NotificationItem, 
  ServiceCategory, 
  TimeSlotId, 
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
  markAllNotificationsRead, 
  initLocalStore 
} from './lib/supabase';
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
import { JobitAvatar } from './components/JobitAvatar';
import { usePWAInstall } from './hooks/usePWAInstall';
import { calculateDistanceKm, triggerHaptic } from './utils/feedback';

export default function App() {
  const { isInstallable, install } = usePWAInstall();

  // App core state
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
  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotId | 'any'>('any');
  const [filterOnlyOnline, setFilterOnlyOnline] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'rate_low'>('distance');

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
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  const [isWorkerRegOpen, setIsWorkerRegOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [phoneFrameMode, setPhoneFrameMode] = useState(false);

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
    loadAppData();

    const handleDataSync = () => {
      loadAppData();
    };

    window.addEventListener('kaamkaro_data_sync', handleDataSync);
    return () => {
      window.removeEventListener('kaamkaro_data_sync', handleDataSync);
    };
  }, []);

  // Recalculate distance for each worker relative to current user GPS location
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

  // Smart Matching Feed: Filter based on Job Category + Date + Time Availability + Radius
  const matchingWorkers = useMemo(() => {
    return (workersWithDistance || []).filter((w) => {
      // Category match
      if (selectedCategory !== 'All' && w.profession !== selectedCategory) {
        return false;
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
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = w.name?.toLowerCase().includes(q);
        const matchProf = w.profession?.toLowerCase().includes(q);
        const matchSkill = Array.isArray(w.skills) && w.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchProf && !matchSkill) return false;
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
  }, [workersWithDistance, selectedCategory, selectedDate, selectedSlot, filterOnlyOnline, searchQuery, sortBy]);

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
    return (workers || []).find((w) => w && w.id === 'worker-1') || workers?.[0] || INITIAL_WORKERS[0];
  }, [workers]);

  const handleToggleRole = () => {
    const nextRole: UserRole = userRole === 'customer' ? 'worker' : 'customer';
    setUserRole(nextRole);
    if (nextRole === 'worker') {
      setActiveTab('worker-hub');
    } else {
      setActiveTab('home');
    }
  };

  const handleBookingConfirmed = async (bookingData: Partial<Booking>) => {
    const newBooking: Booking = {
      id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: 'cust-1',
      customerName: 'Anand V.',
      customerPhone: '+91 98470 11223',
      customerAddress: bookingData.customerAddress || currentLocation.address,
      customerLocation: currentLocation,
      workerId: bookingData.workerId || '',
      workerName: bookingData.workerName || '',
      workerPhone: bookingData.workerPhone || '',
      workerProfession: bookingData.workerProfession || 'Electrician',
      taskTitle: bookingData.taskTitle || 'Service Request',
      taskDescription: bookingData.taskDescription || 'Direct hyperlocal repair',
      selectedDate: bookingData.selectedDate || selectedDate,
      selectedSlot: bookingData.selectedSlot || 'morning',
      selectedSlotLabel: bookingData.selectedSlotLabel || 'Morning (08:00 AM - 11:00 AM)',
      status: 'requested',
      createdAt: new Date().toISOString(),
      otp: bookingData.otp || '4829',
      hourlyRate: bookingData.hourlyRate || 150,
      estimatedHours: bookingData.estimatedHours || 1.5,
      estimatedTotal: bookingData.estimatedTotal || 225,
      paymentMethod: bookingData.paymentMethod || 'upi',
      paymentStatus: 'pending',
      timeline: [
        {
          status: 'requested',
          time: 'Just now',
          label: 'Booking Request Placed',
          description: `Dispatched to ${bookingData.workerName} for ${bookingData.selectedDate} [${bookingData.selectedSlotLabel}].`
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
    await upsertWorker(newWorker);
    setIsWorkerRegOpen(false);
    setUserRole('worker');
    setActiveTab('worker-hub');
    await loadAppData();
  };

  const handleWorkerUpdated = async (updated: WorkerProfile) => {
    await upsertWorker(updated);
    await loadAppData();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    await loadAppData();
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

  return (
    <div className={`min-h-screen bg-stone-100 flex justify-center text-stone-900 ${phoneFrameMode ? 'p-0 sm:py-8' : ''}`}>
      {/* Mobile Shell Container */}
      <div 
        className={`w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden ${
          phoneFrameMode ? 'sm:rounded-[40px] sm:border-[8px] sm:border-black sm:min-h-[840px] sm:max-h-[92vh] sm:overflow-y-auto sm:no-scrollbar' : ''
        }`}
      >
        {/* Sticky Header Top Bar with Red/Black JOBit logo and Location */}
        <HeaderTopBar
          currentLocation={currentLocation}
          onOpenLocationPicker={() => setIsLocPickerOpen(true)}
          userRole={userRole}
          onToggleRole={handleToggleRole}
          unreadCount={unreadNotifsCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          isInstallable={isInstallable}
          onInstallApp={install}
          onOpenConfig={() => setIsConfigOpen(true)}
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
                    placeholder="Search Electrician, Plumber, Cleaner, Mason..."
                    className="w-full bg-stone-100 hover:bg-stone-200/60 focus:bg-white text-xs font-bold pl-10 pr-10 py-3 rounded-2xl border border-transparent focus:border-red-600 focus:outline-none transition shadow-inner"
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

              {/* Service Categories Carousel */}
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
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

              {/* Smart Matching Workers Feed Header */}
              <div className="flex items-center justify-between px-4 pt-1">
                <div>
                  <h2 className="text-sm font-black text-black">
                    Available Workers ({matchingWorkers.length})
                  </h2>
                  <p className="text-[11px] text-stone-500 font-semibold">
                    Matching {selectedDate} • {selectedCategory === 'All' ? 'All Services' : selectedCategory}
                  </p>
                </div>

                <button
                  onClick={() => setIsWorkerRegOpen(true)}
                  className="text-[11px] font-black text-red-600 hover:underline"
                >
                  + Register as Worker
                </button>
              </div>

              {/* Workers Feed with Strict Privacy Cards */}
              <div className="px-4 space-y-3 pb-4">
                {isLoading ? (
                  <div className="py-12 text-center text-stone-400">
                    <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold">Scanning Perinthalmanna radius for available workers...</p>
                  </div>
                ) : matchingWorkers.length === 0 ? (
                  <div className="bg-stone-50 rounded-2xl p-8 text-center border border-stone-200 space-y-2">
                    <p className="font-black text-black text-sm">No workers available for this time slot</p>
                    <p className="text-xs text-stone-500">
                      Try selecting "View All Slots" or picking another job category.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSelectedSlot('any');
                        setFilterOnlyOnline(false);
                      }}
                      className="mt-2 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-xl"
                    >
                      Reset Slot Filters
                    </button>
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
            userRole === 'worker' ? (
              <WorkerDashboard
                currentWorker={activeWorkerProfile}
                onUpdateWorker={handleWorkerUpdated}
                bookings={bookings}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onDirectCall={(c) => setCallingContact(c)}
              />
            ) : (
              <div className="p-4 space-y-4 max-w-md mx-auto">
                <div className="bg-red-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mb-3 font-black text-sm">
                    <span className="text-red-600">JOB</span>
                    <span className="text-black">it</span>
                  </div>
                  <h2 className="text-xl font-black">Become a JOBit Pro</h2>
                  <p className="text-xs text-red-100 mt-1 leading-relaxed font-semibold">
                    Work on your own terms in Perinthalmanna. Set your preferred working hours, hourly rates, and toggle online whenever available.
                  </p>
                  <button
                    onClick={() => setIsWorkerRegOpen(true)}
                    className="mt-4 bg-white text-red-600 hover:bg-stone-50 px-5 py-3 rounded-2xl font-black text-xs shadow-md active:scale-95 transition"
                  >
                    <span>Register as Worker (Laborer) ⚡</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3 text-xs">
                  <h3 className="font-black text-black text-sm">Why Join JOBit?</h3>
                  <div className="space-y-2 text-stone-700 font-semibold">
                    <p className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">✓</span> Privacy protected: No personal face photos shown to customers
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">✓</span> Time Slot Manager: Work Morning, Midday, or Evening
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">✓</span> Direct Masked Call / WhatsApp address confirmation
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">✓</span> Instant Cash or UPI payment settlement
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setUserRole('worker');
                        setActiveTab('worker-hub');
                      }}
                      className="w-full py-2.5 bg-black hover:bg-stone-800 text-white rounded-xl font-black active:scale-98 transition text-xs"
                    >
                      Switch to Ramesh K.'s Worker Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )
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
                {notifications.map((item) => (
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
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Fixed Mobile Bottom Bar */}
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
            onLoginSuccess={(role) => {
              setUserRole(role);
              if (role === 'worker') setActiveTab('worker-hub');
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
            onClose={() => setIsWorkerRegOpen(false)}
            onRegister={handleWorkerRegistered}
          />
        )}

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
