import React from 'react';
import {
  LayoutDashboard,
  Home,
  Compass,
  Sparkles,
  Award,
  GraduationCap,
  BookOpen,
  FileText,
  CheckSquare,
  Clock,
  Calendar,
  CalendarDays,
  AlarmClock,
  Bell,
  MessageSquare,
  Megaphone,
  Mail,
  Menu,
  Grid,
  MoreHorizontal,
  Layers,
  Settings,
} from 'lucide-react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useTheme, DEFAULT_BOTTOM_NAV_CONFIG } from '../../context/ThemeContext';
import { BottomNavItemConfig } from '../../types';

export const BOTTOM_NAV_ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Home,
  Compass,
  Sparkles,
  Award,
  GraduationCap,
  BookOpen,
  FileText,
  CheckSquare,
  Clock,
  Calendar,
  CalendarDays,
  AlarmClock,
  Bell,
  MessageSquare,
  Megaphone,
  Mail,
  Menu,
  Grid,
  MoreHorizontal,
  Layers,
  Settings,
};

interface BottomNavigationProps {
  currentModule: string;
  setCurrentModule: (mod: string) => void;
  onOpenMobileMenu: () => void;
  isSimulatedPreview?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentModule,
  setCurrentModule,
  onOpenMobileMenu,
  isSimulatedPreview = false,
}) => {
  const { notifications } = useSiakadData();
  const { themeConfig } = useTheme();

  const unreadCount = notifications ? notifications.filter((n) => !n.read).length : 0;
  const bottomNav = themeConfig?.bottomNav || DEFAULT_BOTTOM_NAV_CONFIG;
  const items = bottomNav.items || DEFAULT_BOTTOM_NAV_CONFIG.items;
  const activeItems = items.filter((item) => item.enabled !== false);

  // If no items enabled, fallback to default items
  const displayItems: BottomNavItemConfig[] = activeItems.length > 0 ? activeItems : DEFAULT_BOTTOM_NAV_CONFIG.items;

  // Icon sizing
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[bottomNav.iconSize || 'md'];

  const iconContainerSizeClasses = {
    sm: 'w-8 h-6',
    md: 'w-9 h-7',
    lg: 'w-10 h-8',
  }[bottomNav.iconSize || 'md'];

  // Base nav bar styling according to bottomNav.style
  const getNavContainerClass = () => {
    const isDark = bottomNav.style === 'dark';
    const isFloating = bottomNav.style === 'floating' || bottomNav.floatingMargin;

    if (isSimulatedPreview) {
      // In simulator preview, we use relative/sticky inside the phone mock
      if (isFloating) {
        return 'w-[94%] mx-auto mb-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg py-1';
      }
      if (isDark) {
        return 'w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 text-white shadow-md';
      }
      if (bottomNav.style === 'colored') {
        return 'w-full border-t border-white/20 text-white shadow-md';
      }
      if (bottomNav.style === 'glassmorphism') {
        return 'w-full bg-white/70 backdrop-blur-2xl border-t border-white/60 shadow-md';
      }
      if (bottomNav.style === 'minimal') {
        return 'w-full bg-white border-t border-slate-100 shadow-2xs';
      }
      return 'w-full bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-md';
    }

    // Real device mobile bottom bar (hidden on md screens)
    if (isFloating) {
      return 'md:hidden fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 max-w-lg mx-auto z-40 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl pb-1';
    }

    if (isDark) {
      return 'md:hidden fixed bottom-0 left-0 right-0 z-40 w-full max-w-full overflow-hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 text-white pb-safe shadow-2xl';
    }

    if (bottomNav.style === 'colored') {
      return 'md:hidden fixed bottom-0 left-0 right-0 z-40 w-full max-w-full overflow-hidden border-t border-white/20 text-white pb-safe shadow-xl';
    }

    if (bottomNav.style === 'glassmorphism') {
      return 'md:hidden fixed bottom-0 left-0 right-0 z-40 w-full max-w-full overflow-hidden bg-white/70 backdrop-blur-2xl border-t border-white/60 pb-safe shadow-xl';
    }

    if (bottomNav.style === 'minimal') {
      return 'md:hidden fixed bottom-0 left-0 right-0 z-40 w-full max-w-full overflow-hidden bg-white/98 border-t border-slate-100 pb-safe shadow-sm';
    }

    // Default classic
    return 'md:hidden fixed bottom-0 left-0 right-0 z-40 w-full max-w-full overflow-hidden bg-white/95 backdrop-blur-lg border-t border-slate-200 pb-safe shadow-lg';
  };

  const getContainerInlineStyle = (): React.CSSProperties => {
    if (bottomNav.style === 'colored') {
      return {
        background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.accentColor})`,
      };
    }
    return {};
  };

  const isDarkBar = bottomNav.style === 'dark';
  const isColoredBar = bottomNav.style === 'colored';

  return (
    <nav className={getNavContainerClass()} style={getContainerInlineStyle()}>
      <div
        className="h-16 max-w-lg mx-auto items-center px-1 w-full grid"
        style={{
          gridTemplateColumns: `repeat(${displayItems.length}, minmax(0, 1fr))`,
        }}
      >
        {displayItems.map((tab) => {
          const Icon = BOTTOM_NAV_ICON_MAP[tab.iconName] || LayoutDashboard;
          const isMenuTab = tab.id === 'menu';
          const isActive = !isMenuTab && currentModule === tab.id;

          const isAnnouncements = tab.id === 'announcements' || tab.id === 'notifikasi';
          const showTabBadge = bottomNav.showBadge && isAnnouncements && unreadCount > 0;

          // Determine label visibility
          let showLabel = true;
          if (bottomNav.labelMode === 'icons-only') {
            showLabel = false;
          } else if (bottomNav.labelMode === 'active-only') {
            showLabel = isActive;
          }

          // Active indicator styles
          let activeWrapperStyle: React.CSSProperties = {};
          let activeWrapperClasses = '';
          const activeStyle = bottomNav.activeStyle || 'pill';

          if (isActive) {
            if (activeStyle === 'pill') {
              activeWrapperClasses = 'scale-105';
              activeWrapperStyle = isColoredBar
                ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }
                : isDarkBar
                ? { backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#38bdf8' }
                : { backgroundColor: `${themeConfig.primaryColor}18`, color: themeConfig.primaryColor };
            } else if (activeStyle === 'bubble') {
              activeWrapperClasses = '-translate-y-1.5 shadow-md scale-110';
              activeWrapperStyle = isColoredBar
                ? { backgroundColor: '#ffffff', color: themeConfig.primaryColor }
                : { backgroundColor: themeConfig.primaryColor, color: '#ffffff' };
            } else if (activeStyle === 'glow') {
              activeWrapperClasses = 'scale-110';
              activeWrapperStyle = {
                filter: `drop-shadow(0 0 6px ${isColoredBar ? '#ffffff' : themeConfig.primaryColor})`,
                color: isColoredBar ? '#ffffff' : themeConfig.primaryColor,
              };
            } else if (activeStyle === 'top-bar') {
              activeWrapperClasses = 'scale-105';
              activeWrapperStyle = {
                color: isColoredBar ? '#ffffff' : themeConfig.primaryColor,
              };
            } else if (activeStyle === 'minimal') {
              activeWrapperClasses = 'scale-110 font-bold';
              activeWrapperStyle = {
                color: isColoredBar ? '#ffffff' : themeConfig.primaryColor,
              };
            }
          }

          // Inactive text/icon color
          let inactiveColorClass = 'text-slate-500 hover:text-slate-800';
          if (isDarkBar) {
            inactiveColorClass = 'text-slate-400 hover:text-white';
          } else if (isColoredBar) {
            inactiveColorClass = 'text-white/70 hover:text-white';
          }

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isMenuTab) {
                  onOpenMobileMenu();
                } else {
                  setCurrentModule(tab.id);
                }
              }}
              className={`flex flex-col items-center justify-center h-full w-full py-1 text-center transition-all relative cursor-pointer group ${
                isActive ? '' : inactiveColorClass
              }`}
              style={
                isActive && activeStyle !== 'bubble' && !isColoredBar && !isDarkBar
                  ? { color: themeConfig.primaryColor }
                  : undefined
              }
              title={tab.label}
            >
              {/* Top Bar Indicator effect */}
              {isActive && activeStyle === 'top-bar' && (
                <div
                  className="absolute top-0 w-8 h-1 rounded-full transition-all"
                  style={{ backgroundColor: isColoredBar ? '#ffffff' : themeConfig.primaryColor }}
                />
              )}

              <div className="relative">
                <div
                  className={`${iconContainerSizeClasses} rounded-full flex items-center justify-center transition-all duration-200 ${activeWrapperClasses}`}
                  style={activeWrapperStyle}
                >
                  <Icon className={iconSizeClasses} />
                </div>

                {/* Notification Badge */}
                {showTabBadge && (
                  <span className="absolute -top-1 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-black text-white bg-rose-500 rounded-full border border-white shadow-xs animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>

              {/* Text Label */}
              {showLabel && (
                <span
                  className={`text-[10px] tracking-tight mt-0.5 truncate max-w-full px-1 transition-all ${
                    isActive ? 'font-bold' : 'font-medium'
                  }`}
                  style={
                    isActive && !isColoredBar && !isDarkBar
                      ? { color: themeConfig.primaryColor }
                      : undefined
                  }
                >
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
