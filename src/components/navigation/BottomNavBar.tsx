import React from 'react';
import { Home, TrendingUp, Gamepad2, Users, Settings } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../locales/translations';

export type TabType = 'home' | 'progress' | 'games' | 'caregiver' | 'settings';

interface BottomNavBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  language?: Language;
  className?: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  language = 'en',
  className = '',
}) => {
  const navItems = [
    { id: 'home' as TabType, labelKey: 'navHome', defaultLabel: 'Home', icon: Home },
    { id: 'progress' as TabType, labelKey: 'navHealth', defaultLabel: 'Health', icon: TrendingUp },
    { id: 'games' as TabType, labelKey: 'navGames', defaultLabel: 'Games', icon: Gamepad2 },
    { id: 'caregiver' as TabType, labelKey: 'navFamily', defaultLabel: 'Family', icon: Users },
    { id: 'settings' as TabType, labelKey: 'navSettings', defaultLabel: 'Settings', icon: Settings },
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
          const labelText = getTranslation(language, item.labelKey) || item.defaultLabel;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={labelText}
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
              <span className="text-[11px] font-semibold mt-0.5 tracking-tight truncate max-w-[64px]">
                {labelText}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
