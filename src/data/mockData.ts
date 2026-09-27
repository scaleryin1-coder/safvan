import { CategoryInfo, LocationCoordinates, WorkerProfile, Booking, NotificationItem, TimeSlotOption } from '../types';

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
  }
];

export const SERVICE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'Electrician',
    name: 'Electrician',
    iconName: 'Zap',
    avgRate: '₹150/hr',
    workerCount: 8
  },
  {
    id: 'Plumber',
    name: 'Plumber',
    iconName: 'Droplet',
    avgRate: '₹160/hr',
    workerCount: 6
  },
  {
    id: 'Carpenter',
    name: 'Carpenter',
    iconName: 'Hammer',
    avgRate: '₹180/hr',
    workerCount: 5
  },
  {
    id: 'Home Cleaner',
    name: 'Home Cleaner',
    iconName: 'Sparkles',
    avgRate: '₹140/hr',
    workerCount: 7
  },
  {
    id: 'Painter',
    name: 'Painter',
    iconName: 'Paintbrush',
    avgRate: '₹160/hr',
    workerCount: 5
  },
  {
    id: 'Driver',
    name: 'Driver',
    iconName: 'Car',
    avgRate: '₹130/hr',
    workerCount: 6
  },
  {
    id: 'Construction Worker',
    name: 'Mason & Construction',
    iconName: 'Building2',
    avgRate: '₹190/hr',
    workerCount: 9
  },
  {
    id: 'Appliance Repair',
    name: 'AC & Appliances',
    iconName: 'Cpu',
    avgRate: '₹220/hr',
    workerCount: 4
  },
  {
    id: 'Welder',
    name: 'Welder',
    iconName: 'Flame',
    avgRate: '₹200/hr',
    workerCount: 3
  }
];

// STRICT PRIVACY-FIRST WORKERS: Only first name + initial, NO personal photos
export const INITIAL_WORKERS: WorkerProfile[] = [
  {
    id: 'worker-1',
    name: 'Ramesh K.',
    phone: '+91 98471 23456',
    profession: 'Electrician',
    skills: ['Wiring Repair', 'Fan/Light Fix', 'MCB Tripping', 'Inverter Setup'],
    hourlyRate: 150,
    dailyRate: 750,
    experience: 5,
    isOnline: true,
    rating: 4.8,
    reviewCount: 92,
    jobsCompleted: 185,
    location: {
      name: 'Perinthalmanna Bypass',
      lat: 10.9780,
      lng: 76.2270,
      address: 'Near Jubilee Mission Hospital, Perinthalmanna'
    },
    distanceKm: 0.9,
    verified: true,
    availableSlots: ['morning', 'midday', 'afternoon', 'evening'],
    availableDays: ['Today', 'Tomorrow'],
    bio: 'Government certified domestic electrician with safety gear and full tool kit.',
    joinedDate: 'Jan 2023'
  },
  {
    id: 'worker-2',
    name: 'Manoj K.',
    phone: '+91 94472 88912',
    profession: 'Plumber',
    skills: ['Pipe Leakage', 'Tap Replacement', 'Motor Pump', 'Overhead Tank'],
    hourlyRate: 160,
    dailyRate: 800,
    experience: 8,
    isOnline: true,
    rating: 4.9,
    reviewCount: 114,
    jobsCompleted: 240,
    location: {
      name: 'Pattambi Road, Perinthalmanna',
      lat: 10.9740,
      lng: 76.2230,
      address: 'Near Old Bus Stand, Perinthalmanna'
    },
    distanceKm: 1.4,
    verified: true,
    availableSlots: ['morning', 'midday', 'afternoon'],
    availableDays: ['Today', 'Tomorrow'],
    bio: 'Specialist in sanitary fittings, PVC pressure joints, and pump installations.',
    joinedDate: 'Mar 2023'
  },
  {
    id: 'worker-3',
    name: 'Suresh B.',
    phone: '+91 97455 11209',
    profession: 'Carpenter',
    skills: ['Door Lock Fix', 'Furniture Assembly', 'Cabinet Hinges', 'Wood Polishing'],
    hourlyRate: 180,
    dailyRate: 900,
    experience: 6,
    isOnline: true,
    rating: 4.7,
    reviewCount: 68,
    jobsCompleted: 145,
    location: {
      name: 'Kozhikode Road, Perinthalmanna',
      lat: 10.9800,
      lng: 76.2290,
      address: 'Opposite Town Hall, Perinthalmanna'
    },
    distanceKm: 1.8,
    verified: true,
    availableSlots: ['morning', 'midday', 'afternoon', 'evening'],
    availableDays: ['Today', 'Tomorrow'],
    bio: 'Fine craftsmanship in wooden cot repair, kitchen cupboards, and lock replacement.',
    joinedDate: 'Nov 2022'
  },
  {
    id: 'worker-4',
    name: 'Priya M.',
    phone: '+91 98466 77410',
    profession: 'Home Cleaner',
    skills: ['Deep Bathroom Scrubbing', 'Kitchen Degreasing', 'Floor Mopping', 'Dusting'],
    hourlyRate: 140,
    dailyRate: 700,
    experience: 4,
    isOnline: true,
    rating: 4.9,
    reviewCount: 86,
    jobsCompleted: 190,
    location: {
      name: 'Angadipuram Junction',
      lat: 10.9840,
      lng: 76.2150,
      address: 'Railway Station Road, Angadipuram'
    },
    distanceKm: 2.1,
    verified: true,
    availableSlots: ['morning', 'midday'],
    availableDays: ['Today', 'Tomorrow'],
    bio: 'Professional home hygiene and deep stain scrubbing with eco-safe cleaners.',
    joinedDate: 'Feb 2023'
  },
  {
    id: 'worker-5',
    name: 'Prasanth V.',
    phone: '+91 99478 33501',
    profession: 'Construction Worker',
    skills: ['Tile Laying', 'Plastering', 'Masonry Repair', 'Waterproofing'],
    hourlyRate: 190,
    dailyRate: 950,
    experience: 10,
    isOnline: false,
    rating: 4.8,
    reviewCount: 130,
    jobsCompleted: 310,
    location: {
      name: 'Manjeri Road, Perinthalmanna',
      lat: 10.9790,
      lng: 76.2240,
      address: 'Near Poly Clinic, Perinthalmanna'
    },
    distanceKm: 1.2,
    verified: true,
    availableSlots: ['morning', 'midday', 'afternoon'],
    availableDays: ['Today', 'Tomorrow'],
    bio: 'Experienced in brickwork, floor tiles, and crack repair.',
    joinedDate: 'Aug 2022'
  },
  {
    id: 'worker-6',
    name: 'Shaji M.',
    phone: '+91 94461 44872',
    profession: 'Painter',
    skills: ['Interior Emulsion', 'Exterior Weather Coat', 'Wall Putty', 'Enamel Paint'],
    hourlyRate: 160,
    dailyRate: 800,
    experience: 7,
    isOnline: true,
    rating: 4.6,
    reviewCount: 52,
    jobsCompleted: 110,
    location: {
      name: 'Ooty Road, Perinthalmanna',
      lat: 10.9755,
      lng: 76.2260,
      address: 'Near District Hospital, Perinthalmanna'
    },
    distanceKm: 0.7,
    verified: true,
    availableSlots: ['morning', 'midday', 'afternoon', 'evening'],
    availableDays: ['Today', 'Tomorrow'],
    bio: 'Neat and dust-free interior repainting, ceiling dampness fix, and touch-ups.',
    joinedDate: 'May 2023'
  },
  {
    id: 'worker-7',
    name: 'Abdul K.',
    phone: '+91 97440 99812',
    profession: 'Driver',
    skills: ['Car Driver Standby', 'Manual & Automatic', 'Outstation Trips', 'Airport Drop'],
    hourlyRate: 130,
    dailyRate: 650,
    experience: 9,
    isOnline: true,
    rating: 4.8,
    reviewCount: 78,
    jobsCompleted: 160,
    location: {
      name: 'Valanchery Road, Perinthalmanna',
      lat: 10.9720,
      lng: 76.2210,
      address: 'Near Bus Stand, Perinthalmanna'
    },
    distanceKm: 1.6,
    verified: true,
    availableSlots: ['morning', 'midday', 'afternoon', 'evening'],
    availableDays: ['Today', 'Tomorrow'],
    bio: 'Licensed experienced commercial driver for local errands or outstation routes.',
    joinedDate: 'Jan 2023'
  },
  {
    id: 'worker-8',
    name: 'Sunil K.',
    phone: '+91 98472 65431',
    profession: 'Appliance Repair',
    skills: ['AC Gas Charging', 'Washing Machine Repair', 'Refrigerator Chilling'],
    hourlyRate: 220,
    dailyRate: 900,
    experience: 6,
    isOnline: true,
    rating: 4.9,
    reviewCount: 95,
    jobsCompleted: 205,
    location: {
      name: 'Cherpulassery Road, Perinthalmanna',
      lat: 10.9710,
      lng: 76.2200,
      address: 'Near Post Office, Perinthalmanna'
    },
    distanceKm: 2.3,
    verified: true,
    availableSlots: ['afternoon', 'evening'],
    availableDays: ['Today', 'Tomorrow'],
    bio: 'Certified technician for AC, washing machines, and refrigerators.',
    joinedDate: 'Dec 2022'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'JOB-7041',
    customerId: 'cust-1',
    customerName: 'Anand V.',
    customerPhone: '+91 98470 11223',
    customerAddress: 'Rose Villa, Near Junction, Perinthalmanna, 679322',
    customerLocation: {
      name: 'Perinthalmanna, Kerala',
      lat: 10.9760,
      lng: 76.2254,
      address: 'Pattambi Road Junction, Perinthalmanna'
    },
    workerId: 'worker-1',
    workerName: 'Ramesh K.',
    workerPhone: '+91 98471 23456',
    workerProfession: 'Electrician',
    taskTitle: 'Main MCB Spark & Switchboard Wiring',
    taskDescription: 'Living room light flickering and breaker tripping on high load.',
    selectedDate: 'Today (Sep 27)',
    selectedSlot: 'morning',
    selectedSlotLabel: 'Morning (08:00 AM - 11:00 AM)',
    status: 'scheduled_confirmed',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    acceptedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    otp: '5921',
    hourlyRate: 150,
    estimatedHours: 1.5,
    estimatedTotal: 225,
    paymentMethod: 'upi',
    paymentStatus: 'pending',
    timeline: [
      {
        status: 'requested',
        time: '25m ago',
        label: 'Booking Requested',
        description: 'Selected slot: Morning (08:00 AM - 11:00 AM).'
      },
      {
        status: 'accepted',
        time: '18m ago',
        label: 'Accepted by Ramesh K.',
        description: 'Worker confirmed appointment for the scheduled slot.'
      },
      {
        status: 'scheduled_confirmed',
        time: '10m ago',
        label: 'Confirmed for Scheduled Time',
        description: 'Arrival planned for 09:30 AM. Masked direct contact unlocked.'
      }
    ]
  },
  {
    id: 'JOB-6890',
    customerId: 'cust-1',
    customerName: 'Anand V.',
    customerPhone: '+91 98470 11223',
    customerAddress: 'Rose Villa, Near Junction, Perinthalmanna, 679322',
    customerLocation: {
      name: 'Perinthalmanna, Kerala',
      lat: 10.9760,
      lng: 76.2254,
      address: 'Rose Villa, Perinthalmanna'
    },
    workerId: 'worker-2',
    workerName: 'Manoj K.',
    workerPhone: '+91 94472 88912',
    workerProfession: 'Plumber',
    taskTitle: 'Bathroom Tap Replacement',
    taskDescription: 'Replaced leaking quarter-turn tap cartridge and checked valve.',
    selectedDate: 'Yesterday',
    selectedSlot: 'midday',
    selectedSlotLabel: 'Midday (11:00 AM - 02:00 PM)',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    acceptedAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    otp: '8214',
    hourlyRate: 160,
    estimatedHours: 1.5,
    estimatedTotal: 240,
    finalTotal: 240,
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    rating: 5,
    review: 'Punctual, respectful and very fast work. Highly recommend JOBit!',
    timeline: [
      {
        status: 'requested',
        time: 'Yesterday 10:15 AM',
        label: 'Requested',
        description: 'Slot: Midday.'
      },
      {
        status: 'accepted',
        time: 'Yesterday 10:20 AM',
        label: 'Accepted by Manoj K.',
        description: 'Worker confirmed scheduled visit.'
      },
      {
        status: 'scheduled_confirmed',
        time: 'Yesterday 10:25 AM',
        label: 'Confirmed for Slot',
        description: 'Appointment locked.'
      },
      {
        status: 'completed',
        time: 'Yesterday 12:40 PM',
        label: 'Completed',
        description: 'Task completed cleanly and payment received.'
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '✅ Booking Confirmed for Morning Slot',
    message: 'Ramesh K. (Electrician) confirmed your booking for Today Morning (08:00 AM - 11:00 AM).',
    type: 'booking',
    timestamp: '10m ago',
    read: false,
    bookingId: 'JOB-7041'
  },
  {
    id: 'notif-2',
    title: '🟢 7 Workers Currently Online',
    message: 'Verified pros in Perinthalmanna are online with active green status.',
    type: 'worker',
    timestamp: '1h ago',
    read: true
  }
];
