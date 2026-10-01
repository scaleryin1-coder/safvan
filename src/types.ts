export type UserRole = 'customer' | 'worker' | 'admin';

export type ServiceCategory = 
  | 'Electrician'
  | 'AC Service'
  | 'Plumber'
  | 'Carpenter'
  | 'Painting & Wall Work'
  | 'Construction'
  | 'Welding'
  | 'Aluminium Fabrication'
  | 'Garden & Outdoor Work'
  | 'Pest Control Service'
  | 'Bike Service'
  | 'Car Mechanic'
  | 'Moving & Labour Service'
  | 'Security & Smart Home'
  | 'Electronics Service'
  | 'Laundry Service'
  | 'Home Support Service'
  | 'Beauty & Personal Care'
  | 'Mehndi Artist'
  | 'Water Tank & Waste Service';

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
  accuracyMeters?: number;
}

export interface WorkerProfile {
  id: string;
  name: string; // Privacy first: First name + initial
  phone: string; // Unique phone number per worker
  profession: ServiceCategory;
  subCategory?: string;
  skills: string[]; // Specific sub-category skills
  hourlyRate: number; // in INR ₹
  dailyRate: number; // in INR ₹
  experience: number; // in years
  isOnline: boolean;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  location: LocationCoordinates;
  distanceKm?: number;
  verified: boolean;
  availableSlots: TimeSlotId[];
  availableDays: string[];
  bio?: string;
  joinedDate: string;
}

export interface UserAccount {
  id: string;
  phone: string; // E.164 normalized e.g. "+919847011223"
  displayPhone: string; // e.g. "+91 98470 11223"
  name: string;
  role: UserRole;
  workerProfileId?: string;
  createdAt: string;
  lastLoginAt: string;
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
  workerName: string;
  workerPhone: string;
  workerProfession: ServiceCategory;
  subCategory?: string;
  taskTitle: string;
  taskDescription: string;
  selectedDate: string;
  selectedSlot: TimeSlotId;
  selectedSlotLabel: string;
  status: BookingStatus;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  otp: string; // 4-digit verification code
  hourlyRate: number;
  estimatedHours: number;
  estimatedTotal: number;
  finalTotal?: number;
  paymentMethod: 'cash' | 'upi';
  paymentStatus: 'pending' | 'completed';
  rating?: number;
  review?: string;
  compliments?: string[];
  invoiceNumber?: string;
  baseCharge?: number;
  safetyFee?: number;
  serviceFee?: number;
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
  subCategories: string[];
}
