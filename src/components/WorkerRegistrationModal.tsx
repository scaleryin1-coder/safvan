import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Power, 
  Navigation,
  HardHat,
  Calendar,
  Clock
} from 'lucide-react';
import { ServiceCategory, WorkerProfile, LocationCoordinates, TimeSlotId } from '../types';
import { SERVICE_CATEGORIES, TIME_SLOT_OPTIONS } from '../data/mockData';
import { JobitAvatar } from './JobitAvatar';
import { triggerHaptic, playSound } from '../utils/feedback';

interface WorkerRegistrationModalProps {
  currentLocation: LocationCoordinates;
  onClose: () => void;
  onRegister: (newWorker: WorkerProfile) => void;
}

export const WorkerRegistrationModal: React.FC<WorkerRegistrationModalProps> = ({
  currentLocation,
  onClose,
  onRegister,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastNameInitial, setLastNameInitial] = useState('');
  const [phone, setPhone] = useState('+91 9');
  const [selectedProfessions, setSelectedProfessions] = useState<ServiceCategory[]>(['Electrician']);
  const [hourlyRate, setHourlyRate] = useState<number>(160);
  const [dailyRate, setDailyRate] = useState<number>(800);
  const [experience, setExperience] = useState<number>(5);
  const [availableSlots, setAvailableSlots] = useState<TimeSlotId[]>(['morning', 'midday', 'afternoon']);
  const [isOnline, setIsOnline] = useState(true);
  const [locName, setLocName] = useState(currentLocation.name);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  const toggleProfession = (prof: ServiceCategory) => {
    triggerHaptic('light');
    if (selectedProfessions.includes(prof)) {
      if (selectedProfessions.length > 1) {
        setSelectedProfessions(selectedProfessions.filter((p) => p !== prof));
      }
    } else {
      setSelectedProfessions([...selectedProfessions, prof]);
    }
  };

  const toggleSlot = (slot: TimeSlotId) => {
    triggerHaptic('light');
    if (availableSlots.includes(slot)) {
      if (availableSlots.length > 1) {
        setAvailableSlots(availableSlots.filter((s) => s !== slot));
      }
    } else {
      setAvailableSlots([...availableSlots, slot]);
    }
  };

  const handleGpsDetect = () => {
    triggerHaptic('medium');
    setIsDetectingGps(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingGps(false);
          setGpsSuccess(true);
          setLocName(`Perinthalmanna Sector (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`);
          playSound('ding');
        },
        () => {
          setIsDetectingGps(false);
          setGpsSuccess(true);
          setLocName('Perinthalmanna Central, Kerala');
          playSound('ding');
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetectingGps(false);
      setGpsSuccess(true);
      setLocName('Perinthalmanna Central, Kerala');
      playSound('ding');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    triggerHaptic('success');
    playSound('success');

    const formattedName = `${firstName.trim()} ${lastNameInitial.trim() ? lastNameInitial.trim().toUpperCase() + '.' : 'K.'}`;

    const newProfile: WorkerProfile = {
      id: `worker-${Date.now()}`,
      name: formattedName,
      phone: phone.trim(),
      profession: selectedProfessions[0],
      skills: selectedProfessions,
      hourlyRate: Number(hourlyRate),
      dailyRate: Number(dailyRate),
      experience: Number(experience),
      isOnline,
      rating: 5.0,
      reviewCount: 1,
      jobsCompleted: 0,
      location: {
        name: locName,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        address: `${locName}, Kerala`
      },
      distanceKm: 0.8,
      verified: true,
      availableSlots,
      availableDays: ['Today', 'Tomorrow'],
      bio: `Verified professional on JOBit with ${experience} years of hands-on experience in ${selectedProfessions.join(', ')}.`,
      joinedDate: 'Today'
    };

    onRegister(newProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header in Bold Red & Black */}
        <div className="p-4 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <JobitAvatar isOnline={isOnline} size="sm" />
            <div>
              <h2 className="text-base font-black">Register as Worker (Laborer)</h2>
              <p className="text-xs text-red-100">Privacy-First Hyperlocal Job Network</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Shield Banner */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-2.5 flex items-center gap-2 text-xs text-stone-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Privacy-First: No personal photos required. Only your first name is displayed to customers.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar text-xs">
          {/* Worker Name (First Name + Initial) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="font-black text-stone-800 block mb-1 uppercase tracking-wider text-[10px]">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Ramesh"
                className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="font-black text-stone-800 block mb-1 uppercase tracking-wider text-[10px]">
                Initial *
              </label>
              <input
                type="text"
                maxLength={2}
                value={lastNameInitial}
                onChange={(e) => setLastNameInitial(e.target.value)}
                placeholder="K"
                className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-red-600 uppercase text-center"
              />
            </div>
          </div>

          {/* Mobile Phone */}
          <div>
            <label className="font-black text-stone-800 block mb-1 uppercase tracking-wider text-[10px]">
              Mobile Number (Kept masked until job is confirmed) *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98470 00000"
              className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Skills / Profession Multi-Select */}
          <div>
            <label className="font-black text-stone-800 block mb-1.5 uppercase tracking-wider text-[10px]">
              Skills & Professions Multi-Select *
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SERVICE_CATEGORIES.map((cat) => {
                const isSelected = selectedProfessions.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleProfession(cat.id)}
                    className={`p-2 rounded-xl text-left border text-[11px] font-black truncate transition ${
                      isSelected
                        ? 'border-red-600 bg-red-50 text-red-600 ring-1 ring-red-600'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rates & Experience */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-black text-stone-800 block mb-1 uppercase tracking-wider text-[10px]">
                Hourly Rate (₹)
              </label>
              <input
                type="number"
                min="50"
                max="2000"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full text-xs font-black px-2.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="font-black text-stone-800 block mb-1 uppercase tracking-wider text-[10px]">
                Daily Rate (₹)
              </label>
              <input
                type="number"
                min="300"
                max="10000"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full text-xs font-black px-2.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="font-black text-stone-800 block mb-1 uppercase tracking-wider text-[10px]">
                Exp (Yrs)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="w-full text-xs font-black px-2.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Time Slot Schedule Manager */}
          <div>
            <label className="font-black text-stone-800 block mb-1.5 uppercase tracking-wider text-[10px]">
              Available Working Hours / Slots:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOT_OPTIONS.map((slot) => {
                const isSelected = availableSlots.includes(slot.id);
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => toggleSlot(slot.id)}
                    className={`p-2 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-red-600 bg-red-50 text-red-600 ring-1 ring-red-600'
                        : 'border-stone-200 bg-white text-stone-500'
                    }`}
                  >
                    <div className="font-black text-xs">
                      {isSelected ? '✓ ' : ''}{slot.label}
                    </div>
                    <div className="text-[10px]">{slot.timeRange}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GPS Location Setup */}
          <div>
            <label className="font-black text-stone-800 block mb-1 uppercase tracking-wider text-[10px]">
              Base Location / Town
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={locName}
                onChange={(e) => setLocName(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-red-600 font-semibold"
              />
              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={isDetectingGps}
                className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-2 rounded-xl font-bold active:scale-95 transition"
              >
                <Navigation className={`w-3.5 h-3.5 text-red-600 ${isDetectingGps ? 'animate-spin' : ''}`} />
                <span>GPS</span>
              </button>
            </div>
          </div>

          {/* Online/Offline Status Switch */}
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <span className="font-black text-black block text-xs">
                Live Online Status
              </span>
              <span className="text-[11px] text-stone-500">
                Shows blinking green pulse dot on your JOBit avatar
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsOnline(!isOnline);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isOnline ? 'bg-green-500' : 'bg-stone-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  isOnline ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/30 active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Worker Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
