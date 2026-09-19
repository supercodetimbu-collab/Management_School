import React, { useEffect } from 'react';
import {
  Bell,
  X,
  Sparkles,
  ClipboardCheck,
  Award,
  Megaphone,
  Clock,
  BookOpen,
  Wifi,
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface LiveToastNotificationProps {
  notification: NotificationItem | null;
  onClose: () => void;
  onAction?: (actionUrl?: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  presensi: ClipboardCheck,
  nilai: Award,
  pengumuman: Megaphone,
  jadwal: Clock,
  tugas: BookOpen,
  sistem: Sparkles,
};

export const LiveToastNotification: React.FC<LiveToastNotificationProps> = ({
  notification,
  onClose,
  onAction,
}) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const IconComponent = CATEGORY_ICONS[notification.category] || Bell;

  return (
    <div
      id="live-toast-container"
      className="fixed top-20 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="bg-white rounded-2xl border-2 border-teal-500 shadow-xl p-4 flex items-start gap-3 backdrop-blur-md">
        <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 shrink-0">
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" />
              <Wifi className="w-3 h-3 text-teal-600" /> Real-Time Live
            </span>
            <span className="text-[11px] text-slate-400">{notification.time}</span>
          </div>

          <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
            {notification.title}
          </h4>
          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
            {notification.message}
          </p>

          {notification.linkAction && (
            <button
              onClick={() => {
                if (onAction) onAction(notification.linkAction);
                onClose();
              }}
              className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-800 underline flex items-center gap-1 cursor-pointer"
            >
              Lihat Detail Pembaruan →
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0 cursor-pointer"
          aria-label="Tutup Notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
