import { LocationCoordinates, WorkerProfile, Booking, NotificationItem, TimeSlotOption } from '../types';
export { SERVICE_CATEGORIES } from './categories';

export const TIME_SLOT_OPTIONS: TimeSlotOption[] = [
  {
    id: 'morning',
    label: 'Morning',
    timeRange: '08:00 AM - 11:00 AM',
    iconName: 'Sunrise'
  },
  {
    id: 'midday',
    label: 'Midday',
    timeRange: '11:00 AM - 02:00 PM',
    iconName: 'Sun'
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    timeRange: '02:00 PM - 05:00 PM',
    iconName: 'Clock'
  },
  {
    id: 'evening',
    label: 'Evening',
    timeRange: '05:00 PM - 08:00 PM',
    iconName: 'Sunset'
  }
];

export const DEFAULT_LOCATIONS: LocationCoordinates[] = [
  {
    name: 'Perinthalmanna, Kerala',
    lat: 10.9760,
    lng: 76.2254,
    address: 'Pattambi Road Junction, Perinthalmanna, Malappuram, Kerala 679322'
  },
  {
    name: 'Melattur, Kerala',
    lat: 11.0543,
    lng: 76.2625,
    address: 'Railway Station Road, Melattur, Malappuram, Kerala 679326'
  },
  {
    name: 'Manjeri, Kerala',
    lat: 11.1205,
    lng: 76.1211,
    address: 'Kacherippadi, Manjeri, Malappuram, Kerala 676121'
  },
  {
    name: 'Angadipuram, Kerala',
    lat: 10.9856,
    lng: 76.2134,
    address: 'Near Thirumandhamkunnu Temple, Angadipuram, Kerala 679321'
  },
  {
    name: 'Malappuram Town, Kerala',
    lat: 11.0732,
    lng: 76.0740,
    address: 'Down Hill, Malappuram, Kerala 676505'
  }
];

// STRICT REAL DATABASE: No mock/dummy workers. Only freshly registered workers from live database.
export const INITIAL_WORKERS: WorkerProfile[] = [];

// STRICT REAL DATABASE: No mock/dummy bookings. Only real user bookings from live database.
export const INITIAL_BOOKINGS: Booking[] = [];

// Clean initial notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
