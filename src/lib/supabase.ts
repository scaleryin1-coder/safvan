import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, BookingStatus, NotificationItem, WorkerProfile } from '../types';
import { INITIAL_BOOKINGS, INITIAL_NOTIFICATIONS, INITIAL_WORKERS } from '../data/mockData';

// Storage keys
const STORAGE_KEY_WORKERS = 'jobit_workers_v3';
const STORAGE_KEY_BOOKINGS = 'jobit_bookings_v3';
const STORAGE_KEY_NOTIFS = 'jobit_notifs_v3';
const STORAGE_KEY_CONFIG = 'jobit_supabase_config_v3';

export function sanitizeWorker(w: any): WorkerProfile {
  return {
    id: w?.id || `worker-${Math.random()}`,
    name: w?.name || 'Worker',
    phone: w?.phone || '+91 98471 00000',
    profession: w?.profession || 'Electrician',
    skills: Array.isArray(w?.skills) && w.skills.length > 0
      ? w.skills
      : ['Inspection', 'General Repair', 'Maintenance'],
    hourlyRate: typeof w?.hourlyRate === 'number' ? w.hourlyRate : 150,
    dailyRate: typeof w?.dailyRate === 'number' ? w.dailyRate : 750,
    experience: typeof w?.experience === 'number' ? w.experience : 5,
    isOnline: typeof w?.isOnline === 'boolean' ? w.isOnline : true,
    rating: typeof w?.rating === 'number' ? w.rating : 4.8,
    reviewCount: typeof w?.reviewCount === 'number' ? w.reviewCount : 50,
    jobsCompleted: typeof w?.jobsCompleted === 'number' ? w.jobsCompleted : 100,
    location: w?.location || {
      name: 'Perinthalmanna, Kerala',
      lat: 10.9760,
      lng: 76.2254,
      address: 'Pattambi Road Junction, Perinthalmanna, Kerala'
    },
    distanceKm: typeof w?.distanceKm === 'number' ? w.distanceKm : 1.2,
    verified: typeof w?.verified === 'boolean' ? w.verified : true,
    availableSlots: Array.isArray(w?.availableSlots) && w.availableSlots.length > 0
      ? w.availableSlots
      : ['morning', 'midday', 'afternoon', 'evening'],
    availableDays: Array.isArray(w?.availableDays) && w.availableDays.length > 0
      ? w.availableDays
      : ['Today', 'Tomorrow'],
    bio: w?.bio || 'Verified professional on JOBit.',
    joinedDate: w?.joinedDate || 'Jan 2023'
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
      notifySync();
      return true;
    }
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url, anonKey }));
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

// Custom event to sync views across customer and worker tabs
function notifySync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kaamkaro_data_sync'));
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

  // Clean legacy keys from older version
  try {
    localStorage.removeItem('kaamkaro_workers_v1');
    localStorage.removeItem('kaamkaro_bookings_v1');
    localStorage.removeItem('kaamkaro_notifs_v1');
  } catch {}

  if (!localStorage.getItem(STORAGE_KEY_WORKERS)) {
    localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(INITIAL_WORKERS));
  }
  if (!localStorage.getItem(STORAGE_KEY_BOOKINGS)) {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  }
  if (!localStorage.getItem(STORAGE_KEY_NOTIFS)) {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
}

// Data API: Workers
export async function fetchWorkers(): Promise<WorkerProfile[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('workers').select('*');
      if (!error && data && data.length > 0) {
        return (data as any[]).map(sanitizeWorker);
      }
    } catch (e) {
      console.warn('Supabase fetch workers failed, falling back to local store', e);
    }
  }
  const rawList = getStored<WorkerProfile[]>(STORAGE_KEY_WORKERS, INITIAL_WORKERS);
  return (Array.isArray(rawList) ? rawList : INITIAL_WORKERS).map(sanitizeWorker);
}

export async function upsertWorker(worker: WorkerProfile): Promise<WorkerProfile> {
  const cleanWorker = sanitizeWorker(worker);
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('workers').upsert(cleanWorker);
    } catch (e) {
      console.warn('Supabase worker upsert fallback to local', e);
    }
  }

  const current = getStored<WorkerProfile[]>(STORAGE_KEY_WORKERS, INITIAL_WORKERS);
  const safeList = (Array.isArray(current) ? current : INITIAL_WORKERS).map(sanitizeWorker);
  const index = safeList.findIndex((w) => w.id === cleanWorker.id);
  let updated: WorkerProfile[];
  if (index >= 0) {
    updated = [...safeList];
    updated[index] = { ...cleanWorker };
  } else {
    updated = [cleanWorker, ...safeList];
  }
  setStored(STORAGE_KEY_WORKERS, updated);
  return cleanWorker;
}

// Data API: Bookings
export async function fetchBookings(): Promise<Booking[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) {
        return (data as any[]).map(sanitizeBooking);
      }
    } catch (e) {
      console.warn('Supabase fetch bookings fallback to local', e);
    }
  }
  const rawList = getStored<Booking[]>(STORAGE_KEY_BOOKINGS, INITIAL_BOOKINGS);
  return (Array.isArray(rawList) ? rawList : INITIAL_BOOKINGS).map(sanitizeBooking);
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

  const current = getStored<Booking[]>(STORAGE_KEY_BOOKINGS, INITIAL_BOOKINGS);
  const updated = [newBooking, ...current];
  setStored(STORAGE_KEY_BOOKINGS, updated);

  // Auto trigger notification
  await addNotification({
    id: `notif-${Date.now()}`,
    title: '📢 Booking Request Placed!',
    message: `Your booking for ${newBooking.taskTitle} was sent to ${newBooking.workerName}.`,
    type: 'booking',
    timestamp: 'Just now',
    read: false,
    bookingId: newBooking.id
  });

  return newBooking;
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  extraUpdates?: Partial<Booking>
): Promise<Booking | null> {
  const current = getStored<Booking[]>(STORAGE_KEY_BOOKINGS, INITIAL_BOOKINGS);
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
    timeline: updatedTimeline
  };

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

  return updatedBooking;
}

// Data API: Notifications
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
  return getStored<NotificationItem[]>(STORAGE_KEY_NOTIFS, INITIAL_NOTIFICATIONS);
}

export async function addNotification(item: NotificationItem): Promise<void> {
  const current = getStored<NotificationItem[]>(STORAGE_KEY_NOTIFS, INITIAL_NOTIFICATIONS);
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
  const current = getStored<NotificationItem[]>(STORAGE_KEY_NOTIFS, INITIAL_NOTIFICATIONS);
  const updated = current.map((n) => ({ ...n, read: true }));
  setStored(STORAGE_KEY_NOTIFS, updated);
}

export const SUPABASE_SQL_SCHEMA = `-- JOBit Hyperlocal Schema for Supabase
CREATE TABLE IF NOT EXISTS workers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar TEXT,
  profession TEXT NOT NULL,
  skills JSONB DEFAULT '[]'::jsonb,
  "dailyRate" NUMERIC DEFAULT 800,
  "hourlyRate" NUMERIC DEFAULT 150,
  experience NUMERIC DEFAULT 5,
  "isOnline" BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 4.8,
  "reviewCount" NUMERIC DEFAULT 10,
  "jobsCompleted" NUMERIC DEFAULT 50,
  location JSONB,
  verified BOOLEAN DEFAULT true,
  badge TEXT,
  bio TEXT,
  equipment JSONB DEFAULT '[]'::jsonb,
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
  "workerAvatar" TEXT,
  "workerProfession" TEXT,
  "taskTitle" TEXT,
  "taskDescription" TEXT,
  "scheduledType" TEXT,
  "scheduledTimeText" TEXT,
  status TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "acceptedAt" TIMESTAMP WITH TIME ZONE,
  "etaMinutes" NUMERIC,
  otp TEXT,
  "hourlyRate" NUMERIC,
  "estimatedHours" NUMERIC,
  "estimatedTotal" NUMERIC,
  "finalTotal" NUMERIC,
  "paymentMethod" TEXT,
  "paymentStatus" TEXT,
  rating NUMERIC,
  review TEXT,
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
`;
