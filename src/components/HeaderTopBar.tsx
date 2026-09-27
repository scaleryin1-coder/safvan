import React from 'react';
import { MapPin, ChevronDown, User, ShieldCheck, Download, Sliders, Bell } from 'lucide-react';
import { LocationCoordinates, UserRole } from '../types';
import { triggerHaptic } from '../utils/feedback';

interface HeaderTopBarProps {
  currentLocation: LocationCoordinates;
  onOpenLocationPicker: () => void;
  userRole: UserRole;
  onToggleRole: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  isInstallable: boolean;
  onInstallApp: () => void;
  onOpenConfig: () => void;
}

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({
  currentLocation,
  onOpenLocationPicker,
  userRole,
  onToggleRole,
  unreadCount,
  onOpenNotifications,
  isInstallable,
  onInstallApp,
  onOpenConfig,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Brand Logo & Location Selector */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Stylized Brand Logo: "JOB" in Red + "it" in Black */}
          <div className="flex items-center select-none bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1 rounded-xl border border-stone-200 transition">
            <span className="text-base font-black tracking-tight text-red-600">
              JOB<span className="text-black">it</span>
            </span>
          </div>

          {/* Current GPS Location ("Location: Perinthalmanna") */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenLocationPicker();
            }}
            className="flex items-center gap-1.5 min-w-0 text-left hover:opacity-85 active:scale-95 transition"
          >
            <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-600">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Location:
                </span>
                <ChevronDown className="w-3 h-3 text-stone-500 shrink-0" />
              </div>
              <p className="text-xs font-black text-black truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[180px]">
                {currentLocation.name.split(',')[0]}
              </p>
            </div>
          </button>
        </div>

        {/* Right Actions: Role Toggle & Alerts */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                onInstallApp();
              }}
              title="Install JOBit to Home Screen"
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-xs active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Install</span>
            </button>
          )}

          {/* Role Switcher Chip */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              onToggleRole();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold transition border active:scale-95 ${
              userRole === 'worker'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}
            title="Switch between Customer & Worker View"
          >
            {userRole === 'worker' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Worker Hub</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-red-600" />
                <span>Hire</span>
              </>
            )}
          </button>

          {/* Notifications Icon with Badge */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenNotifications();
            }}
            className="relative p-2 rounded-full text-stone-600 hover:bg-stone-100 active:scale-90 transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Settings / Database */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenConfig();
            }}
            className="p-2 rounded-full text-stone-500 hover:bg-stone-100 active:scale-90 transition"
            title="Database & Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
