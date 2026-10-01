import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, BookingStatus, NotificationItem, UserAccount, UserRole, WorkerProfile } from '../types';
import { INITIAL_BOOKINGS, INITIAL_NOTIFICATIONS, INITIAL_WORKERS } from '../data/mockData';

// Storage keys (v4: Real database, no mock workers, one phone = one account)
const STORAGE_KEY_WORKERS = 'jobit_workers_v4';
const STORAGE_KEY_BOOKINGS = 'jobit_bookings_v4';
const STORAGE_KEY_NOTIFS = 'jobit_notifs_v4';
const STORAGE_KEY_ACCOUNTS = 'jobit_accounts_v4';
const STORAGE_KEY_SESSION = 'jobit_session_v4';
const STORAGE_KEY_CONFIG = 'jobit_supabase_config_v4';

// Phone Normalization Helper: One Phone Number = One Account
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

export function formatDisplayPhone(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  if (last10.length === 10) {
    return `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`;
  }
  return raw;
}

export function sanitizeWorker(w: any): WorkerProfile {
  return {
    id: w?.id || `worker-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: w?.name || 'Worker',
    phone: formatDisplayPhone(w?.phone || '+91 98471 00000'),
    profession: w?.profession || 'Electrician',
    subCategory: w?.subCategory || undefined,
    skills: Array.isArray(w?.skills) && w.skills.length > 0 ? w.skills : ['General Service'],
    hourlyRate: typeof w?.hourlyRate === 'number' ? w.hourlyRate : 160,
    dailyRate: typeof w?.dailyRate === 'number' ? w.dailyRate : 800,
    experience: typeof w?.experience === 'number' ? w.experience : 3,
    isOnline: typeof w?.isOnline === 'boolean' ? w.isOnline : true,
    rating: typeof w?.rating === 'number' ? w.rating : 5.0,
    reviewCount: typeof w?.reviewCount === 'number' ? w.reviewCount : 0,
    jobsCompleted: typeof w?.jobsCompleted === 'number' ? w.jobsCompleted : 0,
    location: w?.location || {
      name: 'Perinthalmanna, Kerala',
      lat: 10.9760,
      lng: 76.2254,
      address: 'Perinthalmanna, Malappuram, Kerala'
    },
    distanceKm: typeof w?.distanceKm === 'number' ? w.distanceKm : 1.0,
    verified: typeof w?.verified === 'boolean' ? w.verified : true,
    availableSlots: Array.isArray(w?.availableSlots) && w.availableSlots.length > 0
      ? w.availableSlots
      : ['morning', 'midday', 'afternoon', 'evening'],
    availableDays: Array.isArray(w?.availableDays) && w.availableDays.length > 0
      ? w.availableDays
      : ['Today', 'Tomorrow'],
    bio: w?.bio || 'Verified professional on JOBit.',
    joinedDate: w?.joinedDate || 'Recently'
  };
}

export function sanitizeBooking(b: any): Booking {
  return {
    ...b,
    timeline: Array.isArray(b?.timeline) ? b.timeline : []
  };
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export function getSavedSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey, isConnected: true };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey, isConnected: true };
      }
    }
  } catch (e) {
    console.error('Failed to read supabase config', e);
  }

  return { url: '', anonKey: '', isConnected: false };
}

export function saveSupabaseConfig(url: string, anonKey: string): boolean {
  try {
    if (!url || !anonKey) {
      localStorage.removeItem(STORAGE_KEY_CONFIG);
      supabaseInstance = null;
      notifySync();
      return true;
    }
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url, anonKey }));
    supabaseInstance = createClient(url, anonKey);
    notifySync();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// Active Supabase client if configured
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = getSavedSupabaseConfig();
  if (cfg.isConnected && cfg.url && cfg.anonKey) {
    if (!supabaseInstance) {
      supabaseInstance = createClient(cfg.url, cfg.anonKey);
    }
    return supabaseInstance;
  }
  return null;
}

// Custom event to sync views across customer, worker, and admin tabs
function notifySync(detail?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kaamkaro_data_sync', { detail }));
  }
}

// Storage Helpers
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    notifySync();
  } catch (e) {
    console.error('Storage write error', e);
  }
}

// Initialize seed data if empty
export function initLocalStore(): void {
  if (typeof window === 'undefined') return;

  // Clean legacy dummy data keys from older version
  try {
    localStorage.removeItem('kaamkaro_workers_v1');
    localStorage.removeItem('kaamkaro_bookings_v1');
    localStorage.removeItem('kaamkaro_notifs_v1');
    localStorage.removeItem('jobit_workers_v3');
    localStorage.removeItem('jobit_bookings_v3');
    localStorage.removeItem('jobit_notifs_v3');
  } catch {}

  // Initialize v4 keys if empty (strictly empty: no mock workers)
  if (!localStorage.getItem(STORAGE_KEY_WORKERS)) {
    localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEY_BOOKINGS)) {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEY_NOTIFS)) {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEY_ACCOUNTS)) {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify([]));
  }
}

// -------------------------------------------------------------
// USER ACCOUNTS API (Rule: "One Phone Number = One Account")
// -------------------------------------------------------------

export async function fetchAccounts(): Promise<UserAccount[]> {
  const localAccounts = getStored<UserAccount[]>(STORAGE_KEY_ACCOUNTS, []) || [];
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('user_accounts').select('*');
      if (!error && data && data.length > 0) {
        const remoteAccounts = data as UserAccount[];
        const map = new Map<string, UserAccount>();
        localAccounts.forEach((a) => map.set(normalizePhone(a.phone), a));
        remoteAccounts.forEach((a) => map.set(normalizePhone(a.phone), a));
        const merged = Array.from(map.values());
        setStored(STORAGE_KEY_ACCOUNTS, merged);
        return merged;
      }
    } catch (e) {
      console.warn('Supabase fetch accounts fallback to local', e);
    }
  }
  return localAccounts;
}

export async function findAccountByPhone(phone: string): Promise<UserAccount | null> {
  const norm = normalizePhone(phone);
  const accounts = await fetchAccounts();
  return accounts.find((a) => normalizePhone(a.phone) === norm) || null;
}

export async function saveAccount(account: UserAccount): Promise<UserAccount> {
  const norm = normalizePhone(account.phone);
  const current = getStored<UserAccount[]>(STORAGE_KEY_ACCOUNTS, []);
  
  const cleanAccount: UserAccount = {
    ...account,
    phone: norm,
    displayPhone: formatDisplayPhone(account.phone),
    lastLoginAt: new Date().toISOString()
  };

  // Enforce One Phone Number = One Account
  const index = current.findIndex((a) => normalizePhone(a.phone) === norm);
  let updated: UserAccount[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...current[index], ...cleanAccount };
  } else {
    updated = [cleanAccount, ...current];
  }

  setStored(STORAGE_KEY_ACCOUNTS, updated);

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('user_accounts').upsert(cleanAccount);
      if (error) {
        console.warn('Supabase save account warning:', error.message);
      }
    } catch (e) {
      console.warn('Supabase save account fallback', e);
    }
  }

  notifySync({ type: 'account_saved', account: cleanAccount });
  return cleanAccount;
}

export function getActiveSession(): UserAccount | null {
  return getStored<UserAccount | null>(STORAGE_KEY_SESSION, null);
}

export function setActiveSession(account: UserAccount | null): void {
  if (!account) {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } else {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(account));
  }
  notifySync({ type: 'session_change', account });
}

// -------------------------------------------------------------
// WORKERS API (Rule: "One Phone Number = One Worker Registration")
// -------------------------------------------------------------

export async function fetchWorkers(): Promise<WorkerProfile[]> {
  const localList = (getStored<WorkerProfile[]>(STORAGE_KEY_WORKERS, []) || []).map(sanitizeWorker);
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('workers').select('*');
      if (!error && data && data.length > 0) {
        const remoteList = (data as any[]).map(sanitizeWorker);
        const map = new Map<string, WorkerProfile>();
        localList.forEach((w) => map.set(w.id, w));
        remoteList.forEach((w) => map.set(w.id, w));
        const merged = Array.from(map.values());
        setStored(STORAGE_KEY_WORKERS, merged);
        return merged;
      }
    } catch (e) {
      console.warn('Supabase fetch workers fallback to local', e);
    }
  }
  return localList;
}

export async function upsertWorker(worker: WorkerProfile): Promise<{ success: boolean; worker?: WorkerProfile; error?: string }> {
  const cleanWorker = sanitizeWorker(worker);
  const normPhone = normalizePhone(cleanWorker.phone);

  const current = getStored<WorkerProfile[]>(STORAGE_KEY_WORKERS, []);
  const safeList = (Array.isArray(current) ? current : []).map(sanitizeWorker);

  // STRICT RULE: One Phone Number = One Worker Registration
  const existingWorker = safeList.find(
    (w) => normalizePhone(w.phone) === normPhone && w.id !== cleanWorker.id
  );

  if (existingWorker) {
    return {
      success: false,
      error: `Mobile number ${formatDisplayPhone(cleanWorker.phone)} is already registered to worker "${existingWorker.name}". Only one worker registration is permitted per phone number.`
    };
  }

  const index = safeList.findIndex((w) => w.id === cleanWorker.id || normalizePhone(w.phone) === normPhone);
  let updated: WorkerProfile[];
  if (index >= 0) {
    updated = [...safeList];
    updated[index] = { ...cleanWorker };
  } else {
    updated = [cleanWorker, ...safeList];
  }

  // Instantly save to local reactive store
  setStored(STORAGE_KEY_WORKERS, updated);

  // Instantly persist to Supabase Database
  const client = getSupabaseClient();
  if (client) {
    try {
      // Strip client-only properties like distanceKm
      const { distanceKm, ...dbWorker } = cleanWorker;
      const { error } = await client.from('workers').upsert(dbWorker);
      if (error) {
        console.warn('Supabase worker upsert note:', error.message);
      }
    } catch (e) {
      console.warn('Supabase worker upsert fallback to local', e);
    }
  }

  // Also bind to user account if one exists
  const userAcc = await findAccountByPhone(cleanWorker.phone);
  if (userAcc) {
    await saveAccount({
      ...userAcc,
      role: 'worker',
      workerProfileId: cleanWorker.id
    });
  }

  notifySync({ type: 'worker_registered', worker: cleanWorker });
  return { success: true, worker: cleanWorker };
}

export async function deleteWorker(workerId: string): Promise<boolean> {
  const current = getStored<WorkerProfile[]>(STORAGE_KEY_WORKERS, []);
  const updated = current.filter((w) => w.id !== workerId);
  setStored(STORAGE_KEY_WORKERS, updated);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('workers').delete().eq('id', workerId);
    } catch (e) {
      console.warn('Supabase delete worker fallback', e);
    }
  }

  notifySync({ type: 'worker_deleted', workerId });
  return true;
}

// -------------------------------------------------------------
// BOOKINGS API
// -------------------------------------------------------------

export async function fetchBookings(): Promise<Booking[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data) {
        return (data as any[]).map(sanitizeBooking);
      }
    } catch (e) {
      console.warn('Supabase fetch bookings fallback to local', e);
    }
  }
  const rawList = getStored<Booking[]>(STORAGE_KEY_BOOKINGS, []);
  return (Array.isArray(rawList) ? rawList : []).map(sanitizeBooking);
}

export async function createBooking(newBooking: Booking): Promise<Booking> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('bookings').insert(newBooking);
    } catch (e) {
      console.warn('Supabase create booking fallback to local', e);
    }
  }

  const current = getStored<Booking[]>(STORAGE_KEY_BOOKINGS, []);
  const updated = [newBooking, ...current];
  setStored(STORAGE_KEY_BOOKINGS, updated);

  // Auto trigger notification
  await addNotification({
    id: `notif-${Date.now()}`,
    title: '📢 Booking Request Placed!',
    message: `Your booking for ${newBooking.taskTitle} was sent to ${newBooking.workerName || 'the assigned worker'}.`,
    type: 'booking',
    timestamp: 'Just now',
    read: false,
    bookingId: newBooking.id
  });

  notifySync({ type: 'booking_created', booking: newBooking });
  return newBooking;
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  extraUpdates?: Partial<Booking>
): Promise<Booking | null> {
  const current = getStored<Booking[]>(STORAGE_KEY_BOOKINGS, []);
  const index = current.findIndex((b) => b.id === bookingId);
  if (index === -1) return null;

  const target = current[index];
  const nowStr = 'Just now';

  let stepLabel = '';
  let stepDesc = '';

  switch (status) {
    case 'accepted':
      stepLabel = `${target.workerName} Accepted`;
      stepDesc = 'Worker accepted the assignment and confirmed slot availability.';
      break;
    case 'scheduled_confirmed':
      stepLabel = 'Confirmed for Scheduled Time 📅';
      stepDesc = 'Appointment confirmed for scheduled slot. Masked direct contact unlocked.';
      break;
    case 'on_the_way':
      stepLabel = 'Worker On The Way 🛵';
      stepDesc = `${target.workerName} is travelling to your location.`;
      break;
    case 'completed':
      stepLabel = 'Job Completed 🎉';
      stepDesc = 'Work finished, verified, and payment settled.';
      break;
    case 'cancelled':
      stepLabel = 'Booking Cancelled';
      stepDesc = 'The booking request was cancelled.';
      break;
    default:
      stepLabel = 'Status Updated';
      stepDesc = `Status transitioned to ${status}`;
  }

  const updatedTimeline = [
    ...target.timeline,
    {
      status,
      time: nowStr,
      label: stepLabel,
      description: stepDesc
    }
  ];

  const updatedBooking: Booking = {
    ...target,
    ...extraUpdates,
    status,
    completedAt: status === 'completed' ? (target.completedAt || new Date().toISOString()) : target.completedAt,
    invoiceNumber: target.invoiceNumber || `INV-JOBIT-${target.id.replace(/\D/g, '').slice(0, 6) || '98231'}`,
    timeline: updatedTimeline
  };

  // When customer submits a rating, dynamically update worker's rating & review count for top visibility
  if (extraUpdates?.rating && target.workerId) {
    const currentWorkers = getStored<WorkerProfile[]>(STORAGE_KEY_WORKERS, []);
    const wIdx = currentWorkers.findIndex(w => w.id === target.workerId);
    if (wIdx >= 0) {
      const worker = currentWorkers[wIdx];
      const prevCount = worker.reviewCount || 1;
      const prevRating = worker.rating || 4.8;
      const newCount = prevCount + 1;
      const newRating = Number(((prevRating * prevCount + extraUpdates.rating) / newCount).toFixed(1));
      currentWorkers[wIdx] = {
        ...worker,
        rating: Math.min(5.0, Math.max(1.0, newRating)),
        reviewCount: newCount,
        jobsCompleted: Math.max(worker.jobsCompleted || 0, (worker.jobsCompleted || 0) + 1)
      };
      setStored(STORAGE_KEY_WORKERS, currentWorkers);
    }
  }

  current[index] = updatedBooking;
  setStored(STORAGE_KEY_BOOKINGS, current);

  // Supabase sync
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('bookings').update(updatedBooking).eq('id', bookingId);
    } catch (e) {
      console.warn('Supabase update status failed', e);
    }
  }

  // Generate notification
  await addNotification({
    id: `notif-${Date.now()}`,
    title: stepLabel,
    message: stepDesc,
    type: 'booking',
    timestamp: 'Just now',
    read: false,
    bookingId
  });

  notifySync({ type: 'booking_updated', booking: updatedBooking, status });
  return updatedBooking;
}

// Admin helper: Reassign a booking to another worker
export async function reassignBookingWorker(
  bookingId: string,
  worker: WorkerProfile
): Promise<Booking | null> {
  return updateBookingStatus(bookingId, 'accepted', {
    workerId: worker.id,
    workerName: worker.name,
    workerPhone: worker.phone,
    workerProfession: worker.profession,
    hourlyRate: worker.hourlyRate
  });
}

// -------------------------------------------------------------
// NOTIFICATIONS API
// -------------------------------------------------------------

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('notifications').select('*').order('timestamp', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as NotificationItem[];
      }
    } catch (e) {
      console.warn('Supabase fetch notifs fallback', e);
    }
  }
  return getStored<NotificationItem[]>(STORAGE_KEY_NOTIFS, []);
}

export async function addNotification(item: NotificationItem): Promise<void> {
  const current = getStored<NotificationItem[]>(STORAGE_KEY_NOTIFS, []);
  const updated = [item, ...current];
  setStored(STORAGE_KEY_NOTIFS, updated);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('notifications').insert(item);
    } catch (e) {
      console.warn('Supabase notif fallback', e);
    }
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const current = getStored<NotificationItem[]>(STORAGE_KEY_NOTIFS, []);
  const updated = current.map((n) => ({ ...n, read: true }));
  setStored(STORAGE_KEY_NOTIFS, updated);
}

// Supabase Real-time Subscription Helper
let realtimeChannel: any = null;

export function setupSupabaseRealtime(onSync: () => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    if (realtimeChannel) {
      client.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

    realtimeChannel = client
      .channel('jobit_realtime_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
        onSync();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_accounts' }, () => {
        onSync();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        onSync();
      })
      .subscribe();

    return () => {
      if (realtimeChannel && client) {
        client.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    };
  } catch (e) {
    console.warn('Supabase Realtime not enabled', e);
    return () => {};
  }
}

export const SUPABASE_SQL_SCHEMA = `-- JOBit Hyperlocal Schema for Supabase
CREATE TABLE IF NOT EXISTS user_accounts (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  "displayPhone" TEXT,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  "workerProfileId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "lastLoginAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  profession TEXT NOT NULL,
  "subCategory" TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  "dailyRate" NUMERIC DEFAULT 800,
  "hourlyRate" NUMERIC DEFAULT 160,
  experience NUMERIC DEFAULT 3,
  "isOnline" BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 5.0,
  "reviewCount" NUMERIC DEFAULT 0,
  "jobsCompleted" NUMERIC DEFAULT 0,
  location JSONB,
  verified BOOLEAN DEFAULT true,
  bio TEXT,
  "availableSlots" JSONB DEFAULT '[]'::jsonb,
  "availableDays" JSONB DEFAULT '[]'::jsonb,
  "joinedDate" TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  "customerId" TEXT,
  "customerName" TEXT,
  "customerPhone" TEXT,
  "customerAddress" TEXT,
  "customerLocation" JSONB,
  "workerId" TEXT,
  "workerName" TEXT,
  "workerPhone" TEXT,
  "workerProfession" TEXT,
  "subCategory" TEXT,
  "taskTitle" TEXT,
  "taskDescription" TEXT,
  "selectedDate" TEXT,
  "selectedSlot" TEXT,
  "selectedSlotLabel" TEXT,
  status TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "acceptedAt" TIMESTAMP WITH TIME ZONE,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  otp TEXT,
  "hourlyRate" NUMERIC,
  "estimatedHours" NUMERIC,
  "estimatedTotal" NUMERIC,
  "finalTotal" NUMERIC,
  "paymentMethod" TEXT,
  "paymentStatus" TEXT,
  rating NUMERIC,
  review TEXT,
  compliments JSONB DEFAULT '[]'::jsonb,
  "invoiceNumber" TEXT,
  "baseCharge" NUMERIC DEFAULT 99,
  "safetyFee" NUMERIC DEFAULT 29,
  "serviceFee" NUMERIC DEFAULT 0,
  timeline JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'booking',
  timestamp TEXT,
  read BOOLEAN DEFAULT false,
  "bookingId" TEXT
);

-- Permissive public policies for fast development
ALTER TABLE user_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
`;
