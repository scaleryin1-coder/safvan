import React from 'react';
import { X, User, Phone, ShieldCheck, LogOut, HardHat, Calendar, CheckCircle2 } from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { triggerHaptic, playSound } from '../utils/feedback';
import { formatDisplayPhone } from '../lib/supabase';

interface AccountProfileModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  onClose: () => void;
  onLogout: () => void;
  onSwitchToWorker?: () => void;
  onOpenAdminConsole?: () => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLogout,
  onSwitchToWorker,
  onOpenAdminConsole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-600 text-white p-5 relative">
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="absolute top-3.5 right-3.5 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-black leading-tight text-white">{currentUser.name}</h2>
              <p className="text-xs text-red-100 font-mono mt-0.5">{formatDisplayPhone(currentUser.phone)}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-full text-white">
                  {currentUser.role === 'worker' ? 'Pro Worker' : currentUser.role === 'admin' ? 'Administrator' : 'Customer Account'}
                </span>
                <span className="text-[10px] bg-emerald-500/80 text-white px-1.5 py-0.5 rounded-full font-bold">
                  Active Session
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-stone-600">
              <span className="font-semibold">Persistent Login:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Enabled
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span className="font-semibold">Account Status:</span>
              <span className="font-bold text-black">Verified (OTP)</span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span className="font-semibold">Security:</span>
              <span className="font-bold text-emerald-700">OTP Protected</span>
            </div>
          </div>

          {currentUser.role === 'worker' && onSwitchToWorker && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                onSwitchToWorker();
                onClose();
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2"
            >
              <HardHat className="w-4 h-4" />
              <span>Go to My Worker Dashboard</span>
            </button>
          )}

          {onOpenAdminConsole && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                onClose();
                onOpenAdminConsole();
              }}
              className="w-full py-3 bg-stone-900 hover:bg-black text-white font-black text-xs rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Access Admin Console (/admin)</span>
            </button>
          )}

          <button
            onClick={() => {
              triggerHaptic('medium');
              playSound('pop');
              onLogout();
              onClose();
            }}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-xs rounded-2xl border border-stone-300 transition active:scale-98 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-stone-600" />
            <span>Log Out / Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
