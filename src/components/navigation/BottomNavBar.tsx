import React from 'react';
import { Home, TrendingUp, Gamepad2, Users, Settings } from 'lucide-react';

export type TabType = 'home' | 'progress' | 'games' | 'caregiver' | 'settings';

interface BottomNavBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  className = '',
}) => {
  const navItems = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'progress' as TabType, label: 'Health', icon: TrendingUp },
    { id: 'games' as TabType, label: 'Games', icon: Gamepad2 },
    { id: 'caregiver' as TabType, label: 'Family', icon: Users },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`fixed bottom-4 left-0 right-0 z-40 px-4 flex justify-center select-none ${className}`}>
      <nav
        className="w-full max-w-md backdrop-blur-xl border rounded-full px-3 py-2 shadow-2xl flex items-center justify-around transition-colors duration-300"
        style={{
          backgroundColor: 'var(--nav-background)',
          borderColor: 'var(--nav-border)',
        }}
      >
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center min-w-[54px] min-h-[50px] px-3.5 py-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/40 scale-105'
                  : 'hover:opacity-80 active:scale-95'
              }`}
              style={{
                color: isActive ? '#FFFFFF' : 'var(--secondary-text)',
              }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] font-semibold mt-0.5 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
