import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Navigation, 
  HardHat,
  AlertCircle,
  Sparkles,
  Phone
} from 'lucide-react';
import { ServiceCategory, WorkerProfile, LocationCoordinates, TimeSlotId } from '../types';
import { SERVICE_CATEGORIES, TIME_SLOT_OPTIONS } from '../data/mockData';
import { JobitAvatar } from './JobitAvatar';
import { triggerHaptic, playSound } from '../utils/feedback';
import { getHighAccuracyGPS } from '../utils/location';
import { upsertWorker, formatDisplayPhone, saveAccount, setActiveSession, normalizePhone } from '../lib/supabase';
import { UserAccount } from '../types';

interface WorkerRegistrationModalProps {
  currentLocation: LocationCoordinates;
  initialPhone?: string;
  onClose: () => void;
  onRegister: (newWorker: WorkerProfile) => void;
}

export const WorkerRegistrationModal: React.FC<WorkerRegistrationModalProps> = ({
  currentLocation,
  initialPhone = '',
  onClose,
  onRegister,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastNameInitial, setLastNameInitial] = useState('');
  const [phoneInput, setPhoneInput] = useState(initialPhone ? initialPhone.replace(/\D/g, '').slice(-10) : '');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('Electrician');
  const [selectedSubSkills, setSelectedSubSkills] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState<number>(160);
  const [dailyRate, setDailyRate] = useState<number>(800);
  const [experience, setExperience] = useState<number>(4);
  const [availableSlots, setAvailableSlots] = useState<TimeSlotId[]>(['morning', 'midday', 'afternoon']);
  const [isOnline, setIsOnline] = useState(true);
  
  // Location
  const [workerLocation, setWorkerLocation] = useState<LocationCoordinates>(currentLocation);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Active category's sub-categories
  const activeCategoryInfo = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory) || SERVICE_CATEGORIES[0];

  const handleSelectCategory = (cat: ServiceCategory) => {
    triggerHaptic('light');
    setSelectedCategory(cat);
    const catInfo = SERVICE_CATEGORIES.find((c) => c.id === cat);
    if (catInfo && catInfo.subCategories.length > 0) {
      // Pick first 3 as initial default skills
      setSelectedSubSkills(catInfo.subCategories.slice(0, 3));
    } else {
      setSelectedSubSkills([]);
    }
  };

  const toggleSubSkill = (skill: string) => {
    triggerHaptic('light');
    if (selectedSubSkills.includes(skill)) {
      if (selectedSubSkills.length > 1) {
        setSelectedSubSkills(selectedSubSkills.filter((s) => s !== skill));
      }
    } else {
      setSelectedSubSkills([...selectedSubSkills, skill]);
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

  const handleHighAccuracyGpsDetect = async () => {
    triggerHaptic('medium');
    setIsDetectingGps(true);
    setErrorMessage('');

    const res = await getHighAccuracyGPS();
    setIsDetectingGps(false);

    if (res.success) {
      playSound('ding');
      setWorkerLocation(res.location);
      setGpsSuccess(true);
    } else {
      playSound('alert');
      setErrorMessage(res.errorMessage || 'Unable to get precise GPS location.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return;
    }

    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    triggerHaptic('medium');

    const formattedName = `${firstName.trim()} ${lastNameInitial.trim() ? lastNameInitial.trim().toUpperCase() + '.' : 'K.'}`;
    const skillsToSave = selectedSubSkills.length > 0 ? selectedSubSkills : [selectedCategory];

    const newProfile: WorkerProfile = {
      id: `worker-${Date.now()}`,
      name: formattedName,
      phone: formatDisplayPhone(cleanPhone),
      profession: selectedCategory,
      subCategory: selectedSubSkills[0] || undefined,
      skills: skillsToSave,
      hourlyRate: Number(hourlyRate),
      dailyRate: Number(dailyRate),
      experience: Number(experience),
      isOnline,
      rating: 5.0,
      reviewCount: 0,
      jobsCompleted: 0,
      location: workerLocation,
      distanceKm: 0.8,
      verified: true,
      availableSlots,
      availableDays: ['Today', 'Tomorrow'],
      bio: `Verified professional on JOBit with ${experience} years experience in ${selectedCategory} (${skillsToSave.slice(0, 3).join(', ')}).`,
      joinedDate: 'Recently'
    };

    // Rule: One Phone Number = One Worker Profile
    const result = await upsertWorker(newProfile);
    setIsLoading(false);

    if (!result.success) {
      triggerHaptic('warning');
      playSound('alert');
      setErrorMessage(result.error || 'Worker registration failed.');
      return;
    }

    // Save and activate persistent worker session
    const workerAccount: UserAccount = {
      id: `usr-${Date.now()}`,
      phone: normalizePhone(cleanPhone),
      displayPhone: formatDisplayPhone(cleanPhone),
      name: formattedName,
      role: 'worker',
      workerProfileId: result.worker!.id,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    await saveAccount(workerAccount);
    setActiveSession(workerAccount);

    triggerHaptic('success');
    playSound('success');
    onRegister(result.worker!);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header in Bold Red & Black */}
        <div className="p-4 bg-red-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <JobitAvatar isOnline={isOnline} size="sm" />
            <div>
              <h3 className="font-black text-sm">Register as a Worker</h3>
              <p className="text-[11px] text-red-100">Direct booking with zero commission</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Privacy Name & Mobile Number */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-black text-black">1. Identity & Mobile Contact</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-stone-600 uppercase block mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Ramesh"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-red-600 bg-white font-black text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-600 uppercase block mb-1">
                  Initial
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={lastNameInitial}
                  onChange={(e) => setLastNameInitial(e.target.value)}
                  placeholder="K."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-red-600 bg-white font-black text-xs text-center focus:outline-none uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-600 uppercase block mb-1">
                Mobile Number (Unique Phone Required)
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-300 focus-within:border-red-600 bg-white">
                <span className="font-black text-xs text-stone-700">🇮🇳 +91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98471 23456"
                  className="w-full font-black text-xs focus:outline-none bg-transparent"
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                Rule: Only one worker account can be registered with this mobile number.
              </p>
            </div>
          </div>

          {/* Section 2: Main Category & Sub-categories */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-red-600" />
                <span className="font-black text-black">2. Main Trade & Specific Skills</span>
              </div>
              <span className="text-[10px] font-bold text-red-600">{selectedCategory}</span>
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-600 uppercase block mb-1.5">
                Select Main Job Category (20 Categories Available)
              </label>
              <div className="grid grid-cols-2 xs:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {SERVICE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`p-2 rounded-xl text-left border text-[11px] font-black transition flex items-center justify-between truncate ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-200'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Category Skills Selection */}
            {activeCategoryInfo.subCategories.length > 0 && (
              <div>
                <label className="text-[10px] font-black text-stone-600 uppercase block mb-1.5">
                  Select {activeCategoryInfo.name} Sub-Services Provided:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activeCategoryInfo.subCategories.map((sub) => {
                    const isChecked = selectedSubSkills.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubSkill(sub)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition active:scale-95 flex items-center gap-1 ${
                          isChecked
                            ? 'bg-red-50 text-red-600 border-red-300 ring-1 ring-red-400/20'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <span>{sub}</span>
                        {isChecked && <CheckCircle2 className="w-3 h-3 text-red-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: High-Accuracy GPS Location */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="font-black text-black">3. Precise GPS Location & Base</span>
              </div>
              {gpsSuccess && (
                <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> GPS Locked
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleHighAccuracyGpsDetect}
              disabled={isDetectingGps}
              className="w-full p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-black text-xs border border-red-200 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Resolving High-Accuracy GPS...' : 'Auto-Detect Current GPS Coordinates'}</span>
            </button>

            <div className="p-2.5 bg-white rounded-xl border border-stone-200">
              <p className="text-xs font-black text-stone-900">{workerLocation.name}</p>
              <p className="text-[10px] text-stone-500 truncate">{workerLocation.address}</p>
            </div>
          </div>

          {/* Section 4: Rates & Availability */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-black text-black">4. Rates & Time Slot Availability</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-black text-stone-600 uppercase block mb-1">
                  Hourly Rate (₹)
                </label>
                <input
                  type="number"
                  min={80}
                  max={2000}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-stone-300 bg-white font-black text-xs text-center focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-600 uppercase block mb-1">
                  Daily Rate (₹)
                </label>
                <input
                  type="number"
                  min={400}
                  max={10000}
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-stone-300 bg-white font-black text-xs text-center focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-600 uppercase block mb-1">
                  Experience (Yrs)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-stone-300 bg-white font-black text-xs text-center focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-600 uppercase block mb-1.5">
                Working Time Slots Available:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {TIME_SLOT_OPTIONS.map((slot) => {
                  const isChecked = availableSlots.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => toggleSlot(slot.id)}
                      className={`p-2 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-red-50 text-red-600 border-red-300'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      <div>
                        <div className="font-black text-xs">{slot.label}</div>
                        <div className="text-[9px] text-stone-400">{slot.timeRange}</div>
                      </div>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading || !firstName.trim() || phoneInput.length !== 10}
            className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-2 ${
              firstName.trim() && phoneInput.length === 10 && !isLoading
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 cursor-pointer'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Register & Go Live on JOBit</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
