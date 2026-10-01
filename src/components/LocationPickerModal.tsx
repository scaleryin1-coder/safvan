import React, { useState } from 'react';
import { X, MapPin, Navigation, CheckCircle2, Search, Crosshair, AlertCircle } from 'lucide-react';
import { LocationCoordinates } from '../types';
import { DEFAULT_LOCATIONS } from '../data/mockData';
import { triggerHaptic, playSound } from '../utils/feedback';
import { getHighAccuracyGPS } from '../utils/location';

interface LocationPickerModalProps {
  currentLocation: LocationCoordinates;
  onClose: () => void;
  onSelectLocation: (loc: LocationCoordinates) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  currentLocation,
  onClose,
  onSelectLocation,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [detectedAccuracy, setDetectedAccuracy] = useState<number | null>(null);

  const handleUseCurrentGPS = async () => {
    triggerHaptic('medium');
    setIsDetecting(true);
    setGpsError(null);

    try {
      const result = await getHighAccuracyGPS();
      setIsDetecting(false);

      if (result.success) {
        playSound('ding');
        triggerHaptic('success');
        setDetectedAccuracy(result.accuracyMeters);
        onSelectLocation(result.location);
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        playSound('alert');
        triggerHaptic('warning');
        setGpsError(result.errorMessage || 'Unable to retrieve high accuracy GPS.');
      }
    } catch (err: any) {
      setIsDetecting(false);
      setGpsError(err?.message || 'GPS location request failed.');
    }
  };

  const filteredLocations = DEFAULT_LOCATIONS.filter((loc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return loc.name.toLowerCase().includes(q) || loc.address.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header in Red & Black */}
        <div className="p-4 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs shadow-xs">
              <span className="text-red-600">JOB</span>
              <span className="text-black">it</span>
            </div>
            <div>
              <h3 className="font-black text-sm">Service Location</h3>
              <p className="text-[11px] text-red-100">Pinpoint accurate distance to workers</p>
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

        <div className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {/* High-Accuracy GPS Auto-Detection Button */}
          <div>
            <button
              onClick={handleUseCurrentGPS}
              disabled={isDetecting}
              className="w-full p-3.5 rounded-2xl bg-black hover:bg-stone-900 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-md"
            >
              <Crosshair className={`w-4 h-4 text-red-500 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? 'Acquiring High-Accuracy GPS...' : 'Use Precise GPS (Auto-Detect Locality)'}</span>
            </button>
            <p className="text-[10px] text-stone-500 text-center mt-1 font-medium">
              Uses high-precision device sensors (±5m to ±15m accuracy)
            </p>
          </div>

          {gpsError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search town, junction, or pincode..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-100 text-xs font-bold text-black border border-stone-200 focus:border-red-600 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Known Town Hubs */}
          <div>
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block mb-2 px-1">
              Select or Search Town / Hub
            </span>
            <div className="space-y-1.5">
              {filteredLocations.map((loc, idx) => {
                const isSelected = currentLocation.name === loc.name;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      triggerHaptic('light');
                      playSound('pop');
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl text-left border flex items-center justify-between transition ${
                      isSelected
                        ? 'border-red-600 bg-red-50/70 font-black shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-red-600' : 'text-stone-400'}`} />
                        <p className="text-xs font-black text-stone-900 truncate">{loc.name}</p>
                      </div>
                      <p className="text-[10px] text-stone-500 truncate pl-5">{loc.address}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                  </button>
                );
              })}
              {filteredLocations.length === 0 && (
                <p className="text-xs text-stone-400 text-center py-4">No matching towns found. Try using Precise GPS.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
