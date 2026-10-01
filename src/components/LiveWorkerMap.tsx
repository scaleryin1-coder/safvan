import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  Maximize2, 
  Minimize2, 
  Phone, 
  MessageCircle, 
  Clock, 
  ShieldCheck, 
  Layers, 
  RotateCw,
  LocateFixed,
  Zap
} from 'lucide-react';
import { Booking } from '../types';
import { triggerHaptic } from '../utils/feedback';
import { openWhatsAppAlert, formatWorkerEnRouteWhatsApp } from '../utils/whatsapp';

interface LiveWorkerMapProps {
  booking: Booking;
  onDirectCall?: () => void;
  className?: string;
}

export const LiveWorkerMap: React.FC<LiveWorkerMapProps> = ({
  booking,
  onDirectCall,
  className = ''
}) => {
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0.25); // 0 = start at worker hub, 1 = customer doorstep
  const [isSimulatingMove, setIsSimulatingMove] = useState(true);

  // Calculate dynamic ETA and remaining distance
  const totalDistanceKm = 2.4;
  const remainingDistance = Math.max(0.1, ((1 - progress) * totalDistanceKm)).toFixed(1);
  const remainingMinutes = Math.max(1, Math.round((1 - progress) * 12));

  // Worker vehicle position calculation on SVG path:
  // Waypoints along a curvy road from (60, 60) to (320, 240)
  const workerX = 60 + progress * (320 - 60) + Math.sin(progress * Math.PI * 2) * 28;
  const workerY = 60 + progress * (240 - 60) + Math.cos(progress * Math.PI * 2) * 18;

  // Smooth movement ticker when worker is on the way
  useEffect(() => {
    if (booking.status !== 'on_the_way' && !isSimulatingMove) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.95) return 0.95; // Stop right at doorstep
        return prev + 0.015;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [booking.status, isSimulatingMove]);

  const handleRecenter = () => {
    triggerHaptic('light');
    setProgress(0.35);
  };

  const handleSendWhatsAppEnRoute = () => {
    triggerHaptic('medium');
    const msg = formatWorkerEnRouteWhatsApp(booking, remainingMinutes);
    openWhatsAppAlert(booking.customerPhone || booking.workerPhone, msg);
  };

  return (
    <div className={`relative bg-stone-900 rounded-3xl overflow-hidden border border-stone-200 shadow-md ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-80'} ${className}`}>
      {/* SVG Map Canvas */}
      <svg 
        viewBox="0 0 400 300" 
        className="w-full h-full object-cover select-none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Map background pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={mapMode === 'street' ? '#e2e8f0' : '#1e293b'} strokeWidth="1" />
          </pattern>
          {/* Linear gradient for route */}
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Base Map Terrain */}
        <rect width="400" height="300" fill={mapMode === 'street' ? '#f8fafc' : '#0f172a'} />
        <rect width="400" height="300" fill="url(#grid)" opacity="0.6" />

        {/* City Park / River features */}
        <path 
          d="M 0,180 Q 120,160 200,210 T 400,190" 
          fill="none" 
          stroke={mapMode === 'street' ? '#e0f2fe' : '#0369a1'} 
          strokeWidth="24" 
          strokeLinecap="round"
        />
        <path 
          d="M 280,30 Q 340,60 360,120 T 310,160 Z" 
          fill={mapMode === 'street' ? '#dcfce7' : '#064e3b'} 
          opacity="0.7"
        />

        {/* Streets & Roads network */}
        <path d="M 0,80 L 400,80" stroke={mapMode === 'street' ? '#cbd5e1' : '#334155'} strokeWidth="12" />
        <path d="M 0,220 L 400,220" stroke={mapMode === 'street' ? '#cbd5e1' : '#334155'} strokeWidth="10" />
        <path d="M 120,0 L 120,300" stroke={mapMode === 'street' ? '#cbd5e1' : '#334155'} strokeWidth="10" />
        <path d="M 300,0 L 300,300" stroke={mapMode === 'street' ? '#cbd5e1' : '#334155'} strokeWidth="14" />
        <path d="M 0,80 Q 180,110 300,220" stroke={mapMode === 'street' ? '#fde047' : '#ca8a04'} strokeWidth="14" strokeLinecap="round" />

        {/* Road Labels */}
        <text x="310" y="40" fill={mapMode === 'street' ? '#64748b' : '#94a3b8'} fontSize="9" fontWeight="bold" transform="rotate(90, 310, 40)">MAIN BYPASS</text>
        <text x="140" y="74" fill={mapMode === 'street' ? '#64748b' : '#94a3b8'} fontSize="8" fontWeight="bold">TOWN ROAD</text>
        <text x="130" y="214" fill={mapMode === 'street' ? '#64748b' : '#94a3b8'} fontSize="8" fontWeight="bold">COLONY ROAD</text>

        {/* Active Navigation Route */}
        <path 
          id="serviceRoute"
          d="M 60,60 C 100,120 180,90 220,180 S 290,200 320,240" 
          fill="none" 
          stroke={mapMode === 'street' ? '#ef4444' : '#f87171'} 
          strokeWidth="6" 
          strokeDasharray="6,4"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Customer Location (Destination Pin) */}
        <g transform="translate(320, 240)">
          {/* Radar ripple */}
          <circle r="22" fill="#ef4444" opacity="0.15" className="animate-ping" />
          <circle r="14" fill="#ef4444" opacity="0.3" />
          <circle r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
          <text x="0" y="3" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">🏠</text>
          
          <rect x="-42" y="-32" width="84" height="18" rx="9" fill="#000000" opacity="0.85" />
          <text x="0" y="-20" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle">Your Location</text>
        </g>

        {/* Worker Location (Live Animated Scooter) */}
        <g transform={`translate(${workerX}, ${workerY})`} className="transition-all duration-700 ease-out">
          {/* Moving GPS Radar Pulse */}
          <circle r="20" fill="#10b981" opacity="0.2" className="animate-ping" />
          <circle r="14" fill="#10b981" opacity="0.4" />
          <circle r="11" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
          <text x="0" y="3" fill="#ffffff" fontSize="10" textAnchor="middle">🛵</text>

          {/* Pro Label bubble */}
          <rect x="-35" y="-32" width="70" height="18" rx="9" fill="#10b981" />
          <text x="0" y="-20" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle">
            {booking.workerName.split(' ')[0]} (Live)
          </text>
        </g>
      </svg>

      {/* Floating Status & ETA Top Card */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-stone-200 pointer-events-auto flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 animate-pulse">
            <Navigation className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-black">
                {booking.status === 'on_the_way' ? `Arriving in ~${remainingMinutes} mins` : 'Live Worker Tracking'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-[10px] text-stone-500 font-bold">
              {remainingDistance} km away • {booking.workerName} en route
            </p>
          </div>
        </div>

        {/* Map Control Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setMapMode(mapMode === 'street' ? 'satellite' : 'street')}
            className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-stone-700 hover:text-black shadow-md border border-stone-200 active:scale-90 transition"
            title="Toggle Map Style"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={handleRecenter}
            className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-stone-700 hover:text-black shadow-md border border-stone-200 active:scale-90 transition"
            title="Recenter Tracking"
          >
            <LocateFixed className="w-4 h-4 text-emerald-600" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-stone-700 hover:text-black shadow-md border border-stone-200 active:scale-90 transition"
            title="Fullscreen Map"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Bottom Card: Real-time Movement Ticker & One-Click Contact */}
      <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-stone-200 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[11px] font-black text-emerald-700">
            <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>GPS Beacon Active</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500 font-mono text-[10px]">Speed: 26 km/h</span>
          </div>
          <p className="text-[11px] text-stone-600 font-bold truncate mt-0.5">
            Destination: {booking.customerAddress.split(',')[0]}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onDirectCall && (
            <button
              onClick={onDirectCall}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 active:scale-95 transition"
              title="Call Worker Directly"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleSendWhatsAppEnRoute}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            title="Send WhatsApp ETA alert"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span className="hidden xs:inline">WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
