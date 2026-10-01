import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  HardHat,
  Lock,
  Phone,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Smartphone
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { triggerHaptic, playSound } from '../utils/feedback';
import { 
  findAccountByPhone, 
  saveAccount, 
  setActiveSession, 
  normalizePhone, 
  formatDisplayPhone,
  fetchWorkers
} from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (account: UserAccount) => void;
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultRole = 'customer'
}) => {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  
  // 4-box OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [generatedOtp, setGeneratedOtp] = useState('4829');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingAccount, setExistingAccount] = useState<UserAccount | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('credentials');
      setOtpDigits(['', '', '', '']);
      setErrorMessage('');
    }
  }, [isOpen]);

  // When phone number reaches 10 digits, check if account already exists to auto-fill name
  useEffect(() => {
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length === 10) {
      findAccountByPhone(cleanDigits).then((acc) => {
        if (acc) {
          setExistingAccount(acc);
          if (!userName.trim()) {
            setUserName(acc.name);
          }
          if (acc.role) {
            setSelectedRole(acc.role);
          }
        }
      });
    } else {
      setExistingAccount(null);
    }
  }, [phoneNumber]);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      triggerHaptic('warning');
      setErrorMessage('Please enter your User Name.');
      return;
    }

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      triggerHaptic('warning');
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    triggerHaptic('medium');

    try {
      // Check if account exists
      const account = await findAccountByPhone(cleanDigits);
      setExistingAccount(account);

      // Generate random 4-digit OTP
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(newOtp);

      setTimeout(() => {
        setIsLoading(false);
        setStep('otp');
        setOtpDigits(['', '', '', '']);
        setResendTimer(30);
        setCanResend(false);
        playSound('ding');
        triggerHaptic('light');

        // Focus first OTP box
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      }, 350);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Authentication request failed. Please retry.');
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    triggerHaptic('medium');
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setResendTimer(30);
    setCanResend(false);
    setOtpDigits(['', '', '', '']);
    playSound('ding');
    otpInputRefs.current[0]?.focus();
  };

  const handleOtpBoxChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // Handle paste of 4 digits
    if (clean.length > 1) {
      const pasted = clean.slice(0, 4).split('');
      const updated = ['', '', '', ''];
      pasted.forEach((ch, i) => {
        if (i < 4) updated[i] = ch;
      });
      setOtpDigits(updated);
      const nextIndex = Math.min(pasted.length, 3);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = clean.slice(-1);
    setOtpDigits(updated);

    // Auto focus next box
    if (index < 3 && clean) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length !== 4) {
      triggerHaptic('warning');
      setErrorMessage('Please enter all 4 digits of the OTP.');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      triggerHaptic('warning');
      playSound('alert');
      setErrorMessage(`Incorrect verification code. Please enter ${generatedOtp}`);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    triggerHaptic('success');
    playSound('success');

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    const normPhone = normalizePhone(cleanDigits);

    // Cross-check if phone belongs to a registered worker in Supabase/store
    const allWorkers = await fetchWorkers();
    const matchedWorker = allWorkers.find(
      (w) => normalizePhone(w.phone) === normPhone
    );

    // Build unique user account with persistent session
    const resolvedAccount: UserAccount = {
      id: existingAccount?.id || `usr-${Date.now()}`,
      phone: normPhone,
      displayPhone: formatDisplayPhone(cleanDigits),
      name: userName.trim(),
      role: matchedWorker ? 'worker' : (existingAccount?.role || selectedRole),
      workerProfileId: matchedWorker?.id || existingAccount?.workerProfileId,
      createdAt: existingAccount?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const saved = await saveAccount(resolvedAccount);
    // Secure persistent session in storage
    setActiveSession(saved);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(saved);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand Banner in Red & Black */}
        <div className="bg-red-600 text-white p-5 relative select-none">
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="absolute top-3.5 right-3.5 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xs border border-stone-200 shadow-sm">
              <span className="text-red-600">JOB</span>
              <span className="text-black">it</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-full text-white">
                Verified Sign In
              </span>
            </div>
          </div>

          <h2 className="text-lg font-black tracking-tight">
            {step === 'credentials' ? 'Login to JOBit' : 'Verify Mobile OTP'}
          </h2>
          <p className="text-xs text-red-100 mt-0.5">
            {step === 'credentials' 
              ? 'Enter User Name & Mobile Number to sign in' 
              : `4-digit code sent to ${formatDisplayPhone(phoneNumber)}`}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Enter User Name & Mobile Number */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
              {/* Field 1: User Name */}
              <div>
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-wider block mb-1">
                  User Name
                </label>
                <div className="flex items-center gap-2 p-3 rounded-2xl border-2 border-stone-200 focus-within:border-red-600 bg-stone-50 transition">
                  <User className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="e.g. Anand V."
                    className="w-full text-xs font-black focus:outline-none bg-transparent text-black"
                  />
                </div>
              </div>

              {/* Field 2: Mobile Number */}
              <div>
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-wider block mb-1">
                  10-Digit Mobile Number
                </label>
                <div className="flex items-center gap-2 p-3 rounded-2xl border-2 border-stone-200 focus-within:border-red-600 bg-stone-50 transition">
                  <span className="text-xs font-black text-stone-800">🇮🇳 +91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setErrorMessage('');
                    }}
                    placeholder="98470 12345"
                    className="w-full text-xs font-black tracking-wider focus:outline-none bg-transparent text-black"
                  />
                </div>
                {existingAccount && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Existing account recognized for this mobile number.</span>
                  </p>
                )}
              </div>

              {/* Account Type Selector */}
              <div>
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-wider block mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedRole('customer');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition flex items-center justify-center gap-1.5 ${
                      selectedRole === 'customer'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedRole('worker');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition flex items-center justify-center gap-1.5 ${
                      selectedRole === 'worker'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <HardHat className="w-3.5 h-3.5" />
                    <span>Worker (Pro)</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !userName.trim() || phoneNumber.replace(/\D/g, '').length !== 10}
                className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-2 mt-2 ${
                  userName.trim() && phoneNumber.replace(/\D/g, '').length === 10 && !isLoading
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 cursor-pointer'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-2 text-stone-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-black">Persistent Login:</strong> You will remain automatically logged in on this browser until you choose to log out.
                </p>
              </div>
            </form>
          )}

          {/* STEP 2: 4-Box OTP Verification with Timer */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Simulated OTP Notification Banner for Easy Test */}
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl text-emerald-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Simulated SMS Received</span>
                    <span className="text-xs font-bold">JOBit Verification Code:</span>
                  </div>
                </div>
                <span className="font-mono font-black text-base bg-white px-2.5 py-1 rounded-xl border border-emerald-300 text-emerald-800 shadow-xs">
                  {generatedOtp}
                </span>
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-700 uppercase tracking-wider block mb-2 text-center">
                  Enter 4-Digit Code
                </label>

                {/* 4 Distinct OTP Input Boxes */}
                <div className="flex items-center justify-center gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="tel"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-14 h-14 text-center font-mono font-black text-2xl rounded-2xl border-2 transition focus:outline-none ${
                        digit 
                          ? 'border-red-600 bg-red-50/50 text-black' 
                          : 'border-stone-300 bg-stone-50 focus:border-red-600 focus:bg-white text-black'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Timer and Resend Row */}
              <div className="flex items-center justify-between text-xs px-1">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="text-stone-500 font-bold hover:text-black hover:underline"
                >
                  Edit Name & Mobile
                </button>

                <div>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-red-600 font-black flex items-center gap-1 hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  ) : (
                    <span className="text-stone-400 font-semibold">
                      Resend in <strong className="text-stone-700">{resendTimer}s</strong>
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length !== 4}
                className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-2 ${
                  otpDigits.join('').length === 4 && !isLoading
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 cursor-pointer'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Code & Login</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
