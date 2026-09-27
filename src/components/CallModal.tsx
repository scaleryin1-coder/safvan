import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { JobitAvatar } from './JobitAvatar';
import { triggerHaptic, playSound } from '../utils/feedback';

interface CallModalProps {
  contact: {
    name: string;
    phone: string;
    profession: string;
    avatar?: string;
  } | null;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ contact, onClose }) => {
  if (!contact) return null;

  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    playSound('ding');
    const ringTimer = setTimeout(() => {
      setCallState('connected');
      playSound('ding');
      triggerHaptic('success');
    }, 2200);

    return () => clearTimeout(ringTimer);
  }, []);

  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const handleEndCall = () => {
    triggerHaptic('warning');
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xs bg-stone-900 text-white rounded-3xl p-6 flex flex-col items-center justify-between min-h-[460px] shadow-2xl relative border border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Info */}
        <div className="text-center pt-4">
          <span className="text-[11px] font-black tracking-widest text-red-500 uppercase block mb-1">
            JOBit Masked Direct Calling
          </span>
          <h2 className="text-xl font-black text-white">{contact.name}</h2>
          <p className="text-xs text-stone-400 mt-0.5">{contact.profession} • Masked Number</p>
          
          <div className="mt-3">
            {callState === 'ringing' && (
              <span className="text-xs font-semibold text-stone-400 animate-pulse">
                Connecting securely...
              </span>
            )}
            {callState === 'connected' && (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                {formatTimer(seconds)}
              </span>
            )}
            {callState === 'ended' && (
              <span className="text-xs font-semibold text-rose-400">Call Ended</span>
            )}
          </div>
        </div>

        {/* Center Privacy-First JOBit Logo Avatar (NO user photo) */}
        <div className="my-6">
          <JobitAvatar isOnline={true} size="xl" />
        </div>

        {/* Call Controls */}
        <div className="w-full space-y-6 pb-2">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsMuted(!isMuted);
              }}
              className={`p-3.5 rounded-full transition ${
                isMuted ? 'bg-white text-stone-900' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setIsSpeaker(!isSpeaker);
              }}
              className={`p-3.5 rounded-full transition ${
                isSpeaker ? 'bg-white text-stone-900' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-900/40 active:scale-95 transition"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
