import React from 'react';
import { MapPin, ChevronDown, User, ShieldCheck, Download, Bell, LogIn, HardHat, Shield } from 'lucide-react';
import { LocationCoordinates, UserAccount, UserRole } from '../types';
import { triggerHaptic } from '../utils/feedback';

interface HeaderTopBarProps {
  currentLocation: LocationCoordinates;
  onOpenLocationPicker: () => void;
  userRole: UserRole;
  onToggleRole: () => void;
  onSelectRole?: (role: UserRole) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  isInstallable: boolean;
  onInstallApp: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
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
  currentUser,
  onOpenAuth,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Brand Logo & Location Selector */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Stylized Brand Logo: "JOB" in Red + "it" in Black */}
          <div className="flex items-center select-none bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1 rounded-xl border border-stone-200 transition shrink-0">
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
            title="Change service location"
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
              <p className="text-xs font-black text-black truncate max-w-[95px] xs:max-w-[130px] sm:max-w-[170px]">
                {currentLocation.name.split(',')[0]}
              </p>
            </div>
          </button>
        </div>

        {/* Right Actions: Role Toggle, Auth Login/Profile, and Alerts */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                onInstallApp();
              }}
              title="Install JOBit to Home Screen"
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2 py-1.5 rounded-full shadow-xs active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">App</span>
            </button>
          )}

          {/* Role Switcher Chip: Customer / Worker / Admin */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              onToggleRole();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black transition border active:scale-95 ${
              userRole === 'admin'
                ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-xs'
                : userRole === 'worker'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}
            title="Toggle Role View (Customer, Worker, Admin)"
          >
            {userRole === 'admin' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                <span>Admin</span>
              </>
            ) : userRole === 'worker' ? (
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

          {/* User Account / Login Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              if (currentUser && onOpenProfile) {
                onOpenProfile();
              } else {
                onOpenAuth();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border transition active:scale-95 ${
              currentUser
                ? 'bg-stone-100 hover:bg-stone-200/80 text-black border-stone-300'
                : 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-xs'
            }`}
            title={currentUser ? `Logged in as ${currentUser.name} (Click for Profile/Logout)` : 'Login to your account'}
          >
            {currentUser ? (
              <>
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[70px] truncate hidden xs:inline">{currentUser.name.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
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
        </div>
      </div>
    </header>
  );
};
