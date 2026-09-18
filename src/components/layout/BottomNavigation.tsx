import React from 'react';
import { LayoutDashboard, Award, Clock, Bell, Menu } from 'lucide-react';
import { useSiakadData } from '../../context/SiakadDataContext';

interface BottomNavigationProps {
  currentModule: string;
  setCurrentModule: (mod: string) => void;
  onOpenMobileMenu: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentModule,
  setCurrentModule,
  onOpenMobileMenu,
}) => {
  const { notifications } = useSiakadData();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'grades', label: 'Akademik', icon: Award },
    { id: 'schedules', label: 'Jadwal', icon: Clock },
    { id: 'announcements', label: 'Notifikasi', icon: Bell, badge: unreadCount },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 w-full max-w-full overflow-hidden bg-white/95 backdrop-blur-lg border-t border-slate-200 pb-safe shadow-lg">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentModule(tab.id)}
              className={`flex flex-col items-center justify-center h-full w-full py-1 text-center transition-colors relative cursor-pointer ${
                isActive ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-9 h-7 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-teal-100/70 text-teal-800 scale-105' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-black text-white bg-emerald-500 rounded-full border border-white">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 5th button is the Android App Drawer Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center h-full w-full py-1 text-center text-slate-500 hover:text-teal-700 transition-colors cursor-pointer"
        >
          <div className="w-9 h-7 rounded-full flex items-center justify-center">
            <Menu className="w-5 h-5 text-slate-600" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Menu</span>
        </button>
      </div>
    </nav>
  );
};
