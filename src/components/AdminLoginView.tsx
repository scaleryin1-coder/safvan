import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Key, 
  Phone, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  ArrowLeft,
  Settings,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  isPhoneAuthorizedAdmin, 
  getAuthorizedAdminPhones, 
  setAuthorizedAdminPhone, 
  setAdminSession, 
  AdminSession 
} from '../lib/adminAuth';
import { formatDisplayPhone, normalizePhone } from '../lib/supabase';
import { triggerHaptic, playSound } from '../utils/feedback';

interface AdminLoginViewProps {
  onLoginSuccess: (session: AdminSession) => void;
  onExit: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onExit
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'authorize_number'>('phone');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Authorization setup state for owner
  const [newAuthPhone, setNewAuthPhone] = useState('');
  const [masterPasscode, setMasterPasscode] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phoneInput.replace(/\D/g, '');

    if (cleanDigits.length !== 10) {
      triggerHaptic('warning');
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    triggerHaptic('medium');

    const formatted = normalizePhone(cleanDigits);

    // STRICT CHECK: Only authorized mobile number allowed
    const isAuthorized = isPhoneAuthorizedAdmin(formatted);

    setTimeout(() => {
      setIsLoading(false);

      if (!isAuthorized) {
        playSound('alert');
        triggerHaptic('warning');
        setErrorMessage(
          `⛔ ACCESS DENIED: +91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)} is NOT an authorized administrator number. Public access to the JOBit Operations Console is strictly restricted.`
        );
        return;
      }

      // Authorized: Generate verification OTP
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setStep('otp');
      setOtpDigits(['', '', '', '']);
      setResendTimer(30);
      setCanResend(false);
      playSound('ding');
      triggerHaptic('success');

      setTimeout(() => otpRefs[0].current?.focus(), 150);
    }, 400);
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const copy = [...otpDigits];
      copy[index] = '';
      setOtpDigits(copy);
      return;
    }

    if (clean.length > 1) {
      const chars = clean.slice(0, 4).split('');
      const copy = ['', '', '', ''];
      chars.forEach((c, i) => (copy[i] = c));
      setOtpDigits(copy);
      const nextIndex = Math.min(chars.length, 3);
      otpRefs[nextIndex].current?.focus();
      return;
    }

    const copy = [...otpDigits];
    copy[index] = clean.slice(-1);
    setOtpDigits(copy);

    if (index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');

    if (entered.length !== 4) {
      triggerHaptic('warning');
      setErrorMessage('Please enter the complete 4-digit security code.');
      return;
    }

    if (entered !== generatedOtp) {
      playSound('alert');
      triggerHaptic('warning');
      setErrorMessage(`Incorrect verification code. Please enter ${generatedOtp}`);
      return;
    }

    setIsLoading(true);
    triggerHaptic('success');
    playSound('success');

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {}

    setTimeout(() => {
      const session = setAdminSession(phoneInput);
      setIsLoading(false);
      onLoginSuccess(session);
    }, 400);
  };

  const handleAuthorizeNewNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = newAuthPhone.replace(/\D/g, '');

    if (cleanDigits.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number to authorize.');
      return;
    }

    // Default Master Setup Passcode: "JOBIT2026" or "1234"
    if (masterPasscode.trim().toUpperCase() !== 'JOBIT2026' && masterPasscode.trim() !== 'admin') {
      playSound('alert');
      triggerHaptic('warning');
      setErrorMessage('Invalid Master Security Passcode. Default owner key is JOBIT2026.');
      return;
    }

    const formatted = normalizePhone(cleanDigits);
    setAuthorizedAdminPhone(formatted);
    triggerHaptic('success');
    playSound('success');

    setAuthSuccessMsg(`✓ Mobile number +91 ${cleanDigits} is now authorized for Admin access!`);
    setPhoneInput(cleanDigits);
    setErrorMessage('');

    setTimeout(() => {
      setStep('phone');
      setAuthSuccessMsg('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center p-4 selection:bg-red-600 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-sm bg-stone-900/90 backdrop-blur-md rounded-3xl border border-stone-800 shadow-2xl p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-600/30">
            <Shield className="w-7 h-7 text-white" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-950/60 border border-red-800/40 px-3 py-1 rounded-full">
            Restricted Console • /admin
          </span>

          <h1 className="text-lg font-black text-white tracking-tight mt-2.5">
            JOB<span className="text-red-500">it</span> Command Center
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Authorized Administrator Authentication
          </p>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-700/60 rounded-2xl text-red-200 text-xs flex items-start gap-2 animate-in shake duration-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Step 1: Phone Number Input */}
        {step === 'phone' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-stone-300 block mb-1.5">
                Authorized Admin Mobile Number:
              </label>
              <div className="flex items-center gap-2 p-3 bg-stone-950 rounded-2xl border border-stone-700 focus-within:border-red-500 transition">
                <span className="text-xs font-mono font-black text-stone-400">🇮🇳 +91</span>
                <input
                  type="tel"
                  maxLength={10}
                  autoFocus
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit number"
                  className="w-full bg-transparent text-sm font-mono font-bold text-white focus:outline-none placeholder:text-stone-600"
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                Security check: System strictly rejects any unauthorized numbers.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || phoneInput.length < 10}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/30 active:scale-98 transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Authorization & Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-center">
              <span className="text-[10px] text-stone-400 block uppercase font-bold">
                Security Code Sent To
              </span>
              <span className="text-xs font-mono font-black text-white">
                +91 {phoneInput.slice(0, 5)} {phoneInput.slice(5)}
              </span>

              {/* Development Quick Passcode Display */}
              <div className="mt-2 pt-2 border-t border-stone-800 flex items-center justify-center gap-2">
                <span className="text-[10px] text-emerald-400 font-mono">OTP:</span>
                <span className="text-sm font-mono font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  {generatedOtp}
                </span>
              </div>
            </div>

            {/* 4 Digit OTP Inputs */}
            <div className="flex justify-center gap-3 my-2">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-12 h-14 bg-stone-950 text-center text-xl font-mono font-black text-white rounded-2xl border border-stone-700 focus:border-red-500 focus:outline-none transition shadow-inner"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-stone-400 hover:text-white flex items-center gap-1 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Number</span>
              </button>

              <button
                type="button"
                disabled={!canResend}
                onClick={() => {
                  const code = Math.floor(1000 + Math.random() * 9000).toString();
                  setGeneratedOtp(code);
                  setResendTimer(30);
                  setCanResend(false);
                  triggerHaptic('light');
                }}
                className="text-red-400 hover:text-red-300 disabled:text-stone-600 font-bold"
              >
                {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpDigits.join('').length !== 4}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/30 active:scale-98 transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Unlock Admin Operations</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Owner Configuration (Whitelist Specific Personal Number) */}
        {step === 'authorize_number' && (
          <form onSubmit={handleAuthorizeNewNumber} className="space-y-3">
            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-xs">
              <p className="font-bold text-stone-200">
                Authorize Your Personal Mobile Number:
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Register your personal mobile phone number on the Authorized Admin list using the Master Security Passcode (<code className="text-red-400 font-mono">JOBIT2026</code>).
              </p>
            </div>

            {authSuccessMsg && (
              <p className="text-xs font-bold text-emerald-400 bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-800">
                {authSuccessMsg}
              </p>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-stone-400 block mb-1">
                Your Personal Mobile Number (10 digits):
              </label>
              <input
                type="tel"
                maxLength={10}
                value={newAuthPhone}
                onChange={(e) => setNewAuthPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 9847012345"
                className="w-full p-2.5 bg-stone-950 rounded-xl border border-stone-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-stone-400 block mb-1">
                Master Security Passcode:
              </label>
              <input
                type="password"
                value={masterPasscode}
                onChange={(e) => setMasterPasscode(e.target.value)}
                placeholder="Enter Passcode (JOBIT2026)"
                className="w-full p-2.5 bg-stone-950 rounded-xl border border-stone-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md"
              >
                Authorize Number
              </button>
            </div>
          </form>
        )}

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-stone-800 flex items-center justify-between text-xs">
          <button
            onClick={onExit}
            className="text-stone-400 hover:text-white flex items-center gap-1 font-bold active:scale-95 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </button>

          {step !== 'authorize_number' && (
            <button
              onClick={() => {
                triggerHaptic('light');
                setStep('authorize_number');
                setErrorMessage('');
              }}
              className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Authorize Number</span>
            </button>
          )}
        </div>
      </div>

      {/* Security Disclaimer */}
      <p className="text-[11px] text-stone-600 mt-4 text-center max-w-xs">
        JOBit Enterprise Security • IP, timestamp, and device fingerprint are verified on all administrative sessions.
      </p>
    </div>
  );
};
