import React from 'react';
import { Home, CalendarCheck, User, Bell, HardHat } from 'lucide-react';
import { UserRole } from '../types';
import { triggerHaptic } from '../utils/feedback';

export type NavTab = 'home' | 'bookings' | 'worker-hub' | 'notifications';

interface BottomNavBarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  userRole: UserRole;
  activeBookingsCount: number;
  unreadNotifsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  userRole,
  activeBookingsCount,
  unreadNotifsCount,
}) => {
  const handleTabClick = (tab: NavTab) => {
    triggerHaptic('light');
    onChangeTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200 py-1 px-4 safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-14">
        {/* Tab 1: Home */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
            activeTab === 'home' ? 'text-red-600' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600" />
            )}
          </div>
          <span className={`text-[11px] font-black ${activeTab === 'home' ? 'text-red-600' : ''}`}>
            Home
          </span>
        </button>

        {/* Tab 2: Bookings */}
        <button
          onClick={() => handleTabClick('bookings')}
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
            activeTab === 'bookings' ? 'text-red-600' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div className="relative">
            <CalendarCheck className={`w-5 h-5 ${activeTab === 'bookings' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            {activeBookingsCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border border-white">
                {activeBookingsCount}
              </span>
            )}
            {activeTab === 'bookings' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600" />
            )}
          </div>
          <span className={`text-[11px] font-black ${activeTab === 'bookings' ? 'text-red-600' : ''}`}>
            Bookings
          </span>
        </button>

        {/* Tab 3: Worker Hub / Register */}
        <button
          onClick={() => handleTabClick('worker-hub')}
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
            activeTab === 'worker-hub' ? 'text-red-600' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div className="relative">
            {userRole === 'worker' ? (
              <HardHat className={`w-5 h-5 ${activeTab === 'worker-hub' ? 'stroke-[2.5px] text-red-600' : 'stroke-2'}`} />
            ) : (
              <User className={`w-5 h-5 ${activeTab === 'worker-hub' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            )}
            {activeTab === 'worker-hub' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600" />
            )}
          </div>
          <span className={`text-[11px] font-black ${activeTab === 'worker-hub' ? 'text-red-600' : ''}`}>
            {userRole === 'worker' ? 'Dashboard' : 'Register'}
          </span>
        </button>

        {/* Tab 4: Notifications */}
        <button
          onClick={() => handleTabClick('notifications')}
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
            activeTab === 'notifications' ? 'text-red-600' : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <div className="relative">
            <Bell className={`w-5 h-5 ${activeTab === 'notifications' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border border-white">
                {unreadNotifsCount}
              </span>
            )}
            {activeTab === 'notifications' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600" />
            )}
          </div>
          <span className={`text-[11px] font-black ${activeTab === 'notifications' ? 'text-red-600' : ''}`}>
            Alerts
          </span>
        </button>
      </div>
    </nav>
  );
};
