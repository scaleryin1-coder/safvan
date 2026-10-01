import { normalizePhone, formatDisplayPhone } from './supabase';

const STORAGE_KEY_AUTHORIZED_PHONES = 'jobit_admin_authorized_phones_v1';
const STORAGE_KEY_ADMIN_SESSION = 'jobit_admin_session_v1';

// Default authorized master admin phone (can be customized via env or in-app master setting)
const DEFAULT_AUTHORIZED_PHONES = [
  '+919847011223', // Default authorized management phone
  '+919847000000',
  '+919999999999'
];

export interface AdminSession {
  phone: string;
  displayPhone: string;
  token: string;
  authenticatedAt: string;
  expiresAt: number;
}

export function getAuthorizedAdminPhones(): string[] {
  const envPhone = import.meta.env.VITE_AUTHORIZED_ADMIN_PHONE || import.meta.env.VITE_ADMIN_PHONE;
  const list: string[] = [];

  if (envPhone) {
    list.push(normalizePhone(envPhone));
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTHORIZED_PHONES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((p) => {
          const norm = normalizePhone(p);
          if (norm && !list.includes(norm)) list.push(norm);
        });
      }
    }
  } catch (e) {
    console.error('Failed to read authorized admin phones', e);
  }

  if (list.length === 0) {
    DEFAULT_AUTHORIZED_PHONES.forEach((p) => {
      const norm = normalizePhone(p);
      if (!list.includes(norm)) list.push(norm);
    });
  }

  return list;
}

export function isPhoneAuthorizedAdmin(rawPhone: string): boolean {
  if (!rawPhone) return false;
  const normalized = normalizePhone(rawPhone);
  const authorizedList = getAuthorizedAdminPhones();
  return authorizedList.some((authPhone) => normalizePhone(authPhone) === normalized);
}

export function setAuthorizedAdminPhone(newPhone: string): void {
  const normalized = normalizePhone(newPhone);
  if (!normalized) return;
  const current = getAuthorizedAdminPhones();
  if (!current.includes(normalized)) {
    const updated = [normalized, ...current];
    localStorage.setItem(STORAGE_KEY_AUTHORIZED_PHONES, JSON.stringify(updated));
  }
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_ADMIN_SESSION) || localStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setAdminSession(phone: string): AdminSession {
  const cleanPhone = normalizePhone(phone);
  const session: AdminSession = {
    phone: cleanPhone,
    displayPhone: formatDisplayPhone(cleanPhone),
    token: `adm-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    authenticatedAt: new Date().toISOString(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours valid
  };

  sessionStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(session));
  localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(session));
  return session;
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
  localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
}
