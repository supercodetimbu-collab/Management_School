import React, { useEffect, useState, useRef } from 'react';
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
  Users,
  CreditCard,
  GraduationCap,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface LiveToastNotificationProps {
  notification: NotificationItem | null;
  onClose: () => void;
  onAction?: (actionUrl?: string) => void;
}

const CATEGORY_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    label: string;
  }
> = {
  presensi: {
    icon: ClipboardCheck,
    bg: 'bg-emerald-50 text-emerald-700',
    border: 'border-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    badgeText: 'Presensi & Kehadiran',
    label: 'Presensi',
  },
  nilai: {
    icon: Award,
    bg: 'bg-amber-50 text-amber-700',
    border: 'border-amber-500',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    badgeText: 'Penilaian Akademik',
    label: 'Nilai',
  },
  pengumuman: {
    icon: Megaphone,
    bg: 'bg-teal-50 text-teal-700',
    border: 'border-teal-500',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
    badgeText: 'Siaran Pengumuman',
    label: 'Pengumuman',
  },
  jadwal: {
    icon: Clock,
    bg: 'bg-blue-50 text-blue-700',
    border: 'border-blue-500',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    badgeText: 'Jadwal & Kalender',
    label: 'Jadwal',
  },
  tugas: {
    icon: BookOpen,
    bg: 'bg-indigo-50 text-indigo-700',
    border: 'border-indigo-500',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    badgeText: 'Tugas & E-Learning',
    label: 'Tugas',
  },
  keuangan: {
    icon: CreditCard,
    bg: 'bg-rose-50 text-rose-700',
    border: 'border-rose-500',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    badgeText: 'Keuangan & SPP',
    label: 'Keuangan',
  },
  sistem: {
    icon: Sparkles,
    bg: 'bg-purple-50 text-purple-700',
    border: 'border-purple-500',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    badgeText: 'Pembaruan Sistem',
    label: 'Sistem',
  },
};

// Global AudioContext singleton and unlock listener to guarantee sound playback on mobile/desktop
let globalAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  return globalAudioCtx;
}

// Automatically unlock audio context on first user interaction anywhere in the app
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        isAudioUnlocked = true;
      }).catch(() => {});
    } else {
      isAudioUnlocked = true;
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

// Crisp, pleasant, bright 3-stage chime for notifications
function playCrispNotificationChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5) - warm introduction
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.28);

    // Tone 2: 880 Hz (A5) - clear chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.09);
    gain2.gain.setValueAtTime(0.22, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.45);

    // Tone 3: 1174.66 Hz (D6) - bright chime finish
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1174.66, now + 0.18);
    gain3.gain.setValueAtTime(0.16, now + 0.18);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.18);
    osc3.stop(now + 0.55);
  } catch (err) {
    console.debug('Audio chime unable to play:', err);
  }
}

export const LiveToastNotification: React.FC<LiveToastNotificationProps> = ({
  notification,
  onClose,
  onAction,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Play crisp notification chime reliably on every notification arrival
  useEffect(() => {
    if (notification) {
      playCrispNotificationChime();
      setProgress(100);
    }
  }, [notification?.id]);

  // Handle countdown progress and auto-dismiss cleanly without side-effects in setState
  useEffect(() => {
    if (!notification) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const totalDuration = 8000; // 8 seconds
    const intervalTime = 50; // smooth 50ms interval
    let remaining = totalDuration;

    const timer = setInterval(() => {
      if (isPausedRef.current) {
        return;
      }

      remaining -= intervalTime;
      const progressRatio = Math.max(0, (remaining / totalDuration) * 100);
      setProgress(progressRatio);

      if (remaining <= 0) {
        clearInterval(timer);
        onCloseRef.current();
      }
    }, intervalTime);

    return () => {
      clearInterval(timer);
    };
  }, [notification?.id]);

  if (!notification) return null;

  const cfg = CATEGORY_CONFIG[notification.category] || CATEGORY_CONFIG.sistem;
  const IconComponent = cfg.icon || Bell;

  return (
    <aside
      id="live-toast-container"
      aria-label="Pemberitahuan Real-Time Sistem"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed top-3 sm:top-5 left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] max-w-full z-[9999] pointer-events-auto transition-all animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div
        className={`bg-white rounded-2xl border-2 ${cfg.border} shadow-2xl p-3.5 sm:p-4 relative overflow-hidden backdrop-blur-md`}
      >
        {/* Animated Progress Bar at the top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
          <div
            className={`h-full transition-all duration-100 ${
              notification.category === 'presensi'
                ? 'bg-emerald-500'
                : notification.category === 'nilai'
                ? 'bg-amber-500'
                : notification.category === 'tugas'
                ? 'bg-indigo-500'
                : notification.category === 'pengumuman'
                ? 'bg-teal-500'
                : notification.category === 'keuangan'
                ? 'bg-rose-500'
                : notification.category === 'jadwal'
                ? 'bg-blue-500'
                : 'bg-purple-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-start gap-3 pt-0.5">
          {/* Category Icon */}
          <div className={`p-2.5 sm:p-3 rounded-xl ${cfg.bg} border shrink-0 shadow-2xs mt-0.5`}>
            <IconComponent className="w-5 h-5" />
          </div>

          {/* Body Content */}
          <div className="flex-1 min-w-0">
            {/* Badges Header */}
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  <span>Real-Time</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badgeBg}`}
                >
                  {cfg.badgeText}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {notification.time || 'Baru saja'}
              </span>
            </div>

            {/* Notification Title */}
            <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
              {notification.title}
            </h4>

            {/* Notification Message */}
            <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">
              {notification.message}
            </p>

            {/* Action Bar */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              {notification.linkAction ? (
                <button
                  onClick={() => {
                    if (onAction) onAction(notification.linkAction);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition cursor-pointer min-h-[34px]"
                >
                  <span>Buka Pembaruan Ini</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[10px] text-slate-400 italic">
                  Tersinkronisasi otomatis
                </span>
              )}

              <button
                onClick={onClose}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer min-h-[34px]"
              >
                Tutup
              </button>
            </div>
          </div>

          {/* Close X Button */}
          <button
            onClick={onClose}
            className="p-1.5 -mr-1 -mt-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0 cursor-pointer"
            aria-label="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
