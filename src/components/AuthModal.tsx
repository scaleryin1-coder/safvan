import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  HardHat,
  Lock
} from 'lucide-react';
import { UserRole } from '../types';
import { triggerHaptic, playSound } from '../utils/feedback';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, phone: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('98470 11223');
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('4829');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    triggerHaptic('medium');
    playSound('pop');
    setIsLoading(true);

    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedOtp(randomOtp);

    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setOtp(randomOtp);
      playSound('ding');
    }, 400);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    playSound('success');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(selectedRole, `+91 ${phone}`);
      onClose();
    }, 350);
  };

  const handleQuickLogin = (role: UserRole) => {
    triggerHaptic('success');
    playSound('ding');
    onLoginSuccess(role, role === 'worker' ? '+91 98471 23456' : '+91 98470 11223');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand Banner in Red & Black */}
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

          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mb-3 font-black text-sm border border-stone-200 shadow-sm">
            <span className="text-red-600">JOB</span>
            <span className="text-black">it</span>
          </div>

          <h2 className="text-lg font-black tracking-tight">
            Sign In to JOBit
          </h2>
          <p className="text-xs text-red-100 mt-0.5">
            Hyperlocal on-demand jobs in Perinthalmanna
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block mb-1.5">
              Select Profile Role:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedRole('customer');
                }}
                className={`p-3 rounded-2xl border text-left transition active:scale-98 ${
                  selectedRole === 'customer'
                    ? 'border-red-600 bg-red-50 text-black ring-2 ring-red-600/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <User className={`w-5 h-5 mb-1 ${selectedRole === 'customer' ? 'text-red-600' : 'text-stone-400'}`} />
                <div className="text-xs font-black text-black leading-tight">Hire a Worker</div>
                <div className="text-[10px] text-stone-500 mt-0.5 font-medium">Customer Mode</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedRole('worker');
                }}
                className={`p-3 rounded-2xl border text-left transition active:scale-98 ${
                  selectedRole === 'worker'
                    ? 'border-red-600 bg-red-50 text-black ring-2 ring-red-600/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <HardHat className={`w-5 h-5 mb-1 ${selectedRole === 'worker' ? 'text-red-600' : 'text-stone-400'}`} />
                <div className="text-xs font-black text-black leading-tight">Work & Earn</div>
                <div className="text-[10px] text-stone-500 mt-0.5 font-medium">Worker / Laborer</div>
              </button>
            </div>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-wider block mb-1">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-300 focus-within:border-red-600 transition">
                  <span className="text-xs font-bold text-stone-500">🇮🇳 +91</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile"
                    className="w-full text-xs font-bold focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-black text-xs shadow-xs active:scale-98 transition flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Get Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div className="bg-red-50 p-2.5 rounded-xl border border-red-200 text-xs text-red-950 font-semibold">
                <span>Verification OTP: </span>
                <span className="font-mono font-black bg-white px-2 py-0.5 rounded border border-red-300">{simulatedOtp}</span>
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-wider block mb-1">
                  Enter 4-Digit OTP
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl border border-stone-300 focus-within:border-red-600">
                  <Lock className="w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center font-mono font-black text-lg tracking-widest focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-black text-xs shadow-xs active:scale-98 transition flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Sign-In */}
          <div className="pt-2 border-t border-stone-100">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5 text-center">
              ⚡ Instant 1-Tap Demo Sign-In
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-[11px] flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <span>👤 Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('worker')}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-black text-[11px] flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <span>🛠️ Ramesh K. (Worker)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
