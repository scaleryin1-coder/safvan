export type UserRole = 'customer' | 'worker';

export type ServiceCategory = 
  | 'Electrician'
  | 'Plumber'
  | 'Carpenter'
  | 'Home Cleaner'
  | 'Painter'
  | 'Driver'
  | 'Construction Worker'
  | 'Appliance Repair'
  | 'Welder';

export type TimeSlotId = 'morning' | 'midday' | 'afternoon' | 'evening';

export interface TimeSlotOption {
  id: TimeSlotId;
  label: string;
  timeRange: string;
  iconName: string;
}

export interface LocationCoordinates {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

export interface WorkerProfile {
  id: string;
  name: string; // e.g. "Ramesh K." (Privacy first: only First name + initial)
  phone: string;
  profession: ServiceCategory;
  skills: string[];
  hourlyRate: number; // in INR ₹
  dailyRate: number; // in INR ₹
  experience: number; // in years (e.g. 5)
  isOnline: boolean;
  rating: number; // e.g. 4.8
  reviewCount: number;
  jobsCompleted: number;
  location: LocationCoordinates;
  distanceKm?: number; // relative to customer GPS
  verified: boolean;
  availableSlots: TimeSlotId[]; // e.g. ['morning', 'midday', 'afternoon']
  availableDays: string[]; // e.g. ['Today', 'Tomorrow', 'Mon', 'Tue']
  bio?: string;
  joinedDate: string;
}

export type BookingStatus = 
  | 'requested'
  | 'accepted'
  | 'scheduled_confirmed'
  | 'on_the_way'
  | 'completed'
  | 'cancelled';

export interface BookingTimelineStep {
  status: BookingStatus;
  time: string;
  label: string;
  description: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLocation: LocationCoordinates;
  workerId: string;
  workerName: string; // e.g. "Rajesh N."
  workerPhone: string;
  workerProfession: ServiceCategory;
  taskTitle: string;
  taskDescription: string;
  selectedDate: string; // e.g. "Today (Sep 27)"
  selectedSlot: TimeSlotId;
  selectedSlotLabel: string; // e.g. "Morning (08:00 AM - 11:00 AM)"
  status: BookingStatus;
  createdAt: string;
  acceptedAt?: string;
  otp: string; // 4-digit verification code
  hourlyRate: number;
  estimatedHours: number;
  estimatedTotal: number;
  finalTotal?: number;
  paymentMethod: 'cash' | 'upi';
  paymentStatus: 'pending' | 'completed';
  rating?: number;
  review?: string;
  timeline: BookingTimelineStep[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'worker' | 'system' | 'payment';
  timestamp: string;
  read: boolean;
  bookingId?: string;
}

export interface CategoryInfo {
  id: ServiceCategory;
  name: string;
  iconName: string;
  avgRate: string;
  workerCount: number;
}
