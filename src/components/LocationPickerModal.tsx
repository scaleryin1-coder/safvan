import React, { useState } from 'react';
import { X, MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import { LocationCoordinates } from '../types';
import { DEFAULT_LOCATIONS } from '../data/mockData';
import { triggerHaptic, playSound } from '../utils/feedback';

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

  const handleUseCurrentGPS = () => {
    triggerHaptic('medium');
    setIsDetecting(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetecting(false);
          playSound('ding');
          onSelectLocation({
            name: 'Melattur Live GPS',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: `Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}, Melattur Area`
          });
          onClose();
        },
        () => {
          setIsDetecting(false);
          playSound('ding');
          onSelectLocation(DEFAULT_LOCATIONS[0]);
          onClose();
        },
        { timeout: 6000 }
      );
    } else {
      setIsDetecting(false);
      onSelectLocation(DEFAULT_LOCATIONS[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#FF5722]">
              <MapPin className="w-4 h-4 text-[#FF5722]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-stone-900">Choose Service Location</h3>
              <p className="text-[11px] text-stone-500">Find closest available workers</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Live GPS Button */}
          <button
            onClick={handleUseCurrentGPS}
            disabled={isDetecting}
            className="w-full p-3 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF5722] font-bold text-xs flex items-center justify-center gap-2 hover:bg-orange-100 active:scale-98 transition shadow-xs"
          >
            <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Locating Your Device...' : 'Use Device GPS (Live Auto-Match)'}</span>
          </button>

          <div className="pt-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2 px-1">
              Hyperlocal Towns in Malappuram / Kerala
            </span>
            <div className="space-y-1.5">
              {DEFAULT_LOCATIONS.map((loc, idx) => {
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
                        ? 'border-[#FF5722] bg-orange-50/60 font-bold'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-stone-900">{loc.name}</p>
                      <p className="text-[10px] text-stone-500 truncate max-w-[240px]">{loc.address}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#FF5722] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
