import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, X, ArrowRight, User, Hash } from 'lucide-react';
import { playChatIncomingChime } from '../../lib/sound';

export interface ChatToastItem {
  id: string;
  channelId: string;
  channelName: string;
  senderId?: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
}

interface BottomChatToastNotificationProps {
  chatToast: ChatToastItem | null;
  onClose: () => void;
  onOpenChat: (channelId?: string) => void;
}

export const BottomChatToastNotification: React.FC<BottomChatToastNotificationProps> = ({
  chatToast,
  onClose,
  onOpenChat,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastToastIdRef = useRef<string | null>(null);

  // Trigger sound and show animation when new chatToast arrives
  useEffect(() => {
    if (chatToast) {
      if (lastToastIdRef.current !== chatToast.id) {
        lastToastIdRef.current = chatToast.id;
        playChatIncomingChime();
      }

      setIsVisible(true);
      setProgress(100);

      // Clear any previous timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      const duration = 7000; // 7 seconds auto-dismiss
      const intervalStep = 100;
      let elapsed = 0;

      progressIntervalRef.current = setInterval(() => {
        elapsed += intervalStep;
        const remainingPercent = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remainingPercent);
      }, intervalStep);

      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      };
    } else {
      setIsVisible(false);
    }
  }, [chatToast]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleOpen = () => {
    if (chatToast) {
      onOpenChat(chatToast.channelId);
      handleDismiss();
    }
  };

  if (!chatToast && !isVisible) return null;

  // Format role label
  const formatRole = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'superadmin':
        return { label: 'Admin', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'guru':
        return { label: 'Guru', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'kepsek':
        return { label: 'Kepsek', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'orangtua':
        return { label: 'Wali', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Siswa', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  const roleBadge = formatRole(chatToast?.senderRole || '');

  return (
    <div
      className={`fixed z-[9990] transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      } bottom-20 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto sm:w-[380px] max-w-full`}
      role="alert"
      aria-live="polite"
      onMouseEnter={() => {
        // Pause timer on hover
        if (timerRef.current) clearTimeout(timerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }}
      onMouseLeave={() => {
        // Resume brief timer on mouse leave
        timerRef.current = setTimeout(handleDismiss, 3500);
      }}
    >
      <div className="bg-white rounded-2xl border-2 border-teal-500/80 shadow-xl shadow-teal-900/10 p-3.5 sm:p-4 overflow-hidden relative">
        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className="h-full bg-teal-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content Header */}
        <div className="flex items-start justify-between gap-2.5 mt-0.5">
          <div className="flex items-center gap-2 min-w-0">
            {/* Animated Chat Icon */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-slate-800 truncate">
                  {chatToast?.senderName || 'Pengguna'}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${roleBadge.color}`}
                >
                  {roleBadge.label}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold truncate">
                <Hash className="w-3 h-3 text-teal-500 shrink-0" />
                <span className="truncate">{chatToast?.channelName || 'Saluran Komunikasi'}</span>
              </div>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer shrink-0"
            title="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Snippet */}
        <div className="my-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 line-clamp-2 leading-relaxed font-medium">
          &ldquo;{chatToast?.content}&rdquo;
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium">
            {chatToast?.timestamp || 'Baru saja'}
          </span>
          <button
            onClick={handleOpen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <span>Buka Obrolan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
