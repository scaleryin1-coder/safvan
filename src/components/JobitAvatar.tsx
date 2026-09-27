import React from 'react';

interface JobitAvatarProps {
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const JobitAvatar: React.FC<JobitAvatarProps> = ({
  isOnline = false,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl text-[10px]',
    md: 'w-13 h-13 rounded-2xl text-xs',
    lg: 'w-16 h-16 rounded-2xl text-sm',
    xl: 'w-20 h-20 rounded-3xl text-base',
  }[size];

  const dotSizeClasses = {
    sm: 'h-2.5 w-2.5 -top-0.5 -right-0.5',
    md: 'h-3.5 w-3.5 -top-1 -right-1',
    lg: 'h-4 w-4 -top-1 -right-1',
    xl: 'h-4.5 w-4.5 -top-1.5 -right-1.5',
  }[size];

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      {/* Privacy-First Brand Icon Container */}
      <div
        className={`${sizeClasses} bg-white border border-stone-200 shadow-xs flex flex-col items-center justify-center font-black tracking-tighter p-1 group hover:border-red-300 transition-colors`}
      >
        {/* Stylized Red Briefcase / Pin Emblem */}
        <div className="w-5 h-5 rounded-md bg-red-50 text-red-600 flex items-center justify-center mb-0.5">
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" fill="#DC2626" />
          </svg>
        </div>

        {/* Brand Text: JOB in Red (#DC2626) & it in Black (#000000) */}
        <div className="leading-none text-center font-extrabold">
          <span className="text-red-600 font-black">JOB</span>
          <span className="text-black font-black">it</span>
        </div>
      </div>

      {/* Live Online Indicator: Blinking Green Pulse Dot */}
      {isOnline ? (
        <span
          className={`absolute ${dotSizeClasses} flex items-center justify-center z-10`}
          title="Online & Available Now"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-full w-full bg-green-500 border-2 border-white shadow-xs" />
        </span>
      ) : (
        <span
          className={`absolute ${dotSizeClasses} rounded-full bg-stone-300 border-2 border-white z-10`}
          title="Offline"
        />
      )}
    </div>
  );
};
