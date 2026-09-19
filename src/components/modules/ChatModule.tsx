import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Users,
  Shield,
  GraduationCap,
  HeartHandshake,
  School,
  CheckCircle2,
  Sparkles,
  Wifi,
  Smile,
  Hash,
  Clock,
  Lock,
  ArrowLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import { ChatMessage, UserRole } from '../../types';
import { subscribeToRealtimeChat, sendChatMessageToFirebase, isFirebaseReady } from '../../lib/firebase';

interface ChannelConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
}

const CHANNELS: ChannelConfig[] = [
  {
    id: 'general',
    name: 'Ruang Umum Sekolah',
    description: 'Saluran obrolan terbuka untuk seluruh warga sekolah (Admin, Guru, Siswa, Orang Tua, Kepsek)',
    icon: School,
    allowedRoles: ['superadmin', 'admin', 'guru', 'siswa', 'orangtua', 'kepsek'],
  },
  {
    id: 'teachers',
    name: 'Forum Guru & Tenaga Pendidik',
    description: 'Koordinasi internal kurikulum, jadwal, dan kegiatan pembelajaran bapak/ibu guru',
    icon: Users,
    allowedRoles: ['superadmin', 'admin', 'guru', 'kepsek'],
  },
  {
    id: 'parents',
    name: 'Komunikasi Wali Murid',
    description: 'Forum konsultasi, pengumuman kegiatan siswa, dan diskusi orang tua bersama pihak sekolah',
    icon: HeartHandshake,
    allowedRoles: ['superadmin', 'admin', 'guru', 'orangtua', 'kepsek'],
  },
  {
    id: 'classes',
    name: 'Diskusi Siswa & Tugas',
    description: 'Tanya jawab materi pelajaran, koordinasi tugas kelompok, dan kegiatan kesiswaan',
    icon: GraduationCap,
    allowedRoles: ['superadmin', 'admin', 'guru', 'siswa', 'kepsek'],
  },
];

const ROLE_BADGES: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
  superadmin: { label: 'Super Admin', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  admin: { label: 'Admin TU', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  guru: { label: 'Guru', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  siswa: { label: 'Siswa', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  orangtua: { label: 'Orang Tua / Wali', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  kepsek: { label: 'Kepala Sekolah', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
};

const QUICK_PROMPTS = [
  "Assalamu'alaikum wr. wb.",
  'Selamat pagi bapak/ibu sekalian',
  'Mohon izin bertanya terkait jadwal akademik',
  'Terima kasih atas informasinya',
  'Baik, kami tindak lanjuti segera',
];

export const ChatModule: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { schoolProfile } = useSiakadData();

  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessNotice, setSendSuccessNotice] = useState(false);
  // Mobile view mode: 'chat' for conversation stream, 'channels' for channel picker
  const [mobileView, setMobileView] = useState<'chat' | 'channels'>('chat');
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine channels the current user is allowed into
  const accessibleChannels = CHANNELS.filter(
    (c) => !currentRole || c.allowedRoles.includes(currentRole)
  );

  const activeChannel =
    accessibleChannels.find((c) => c.id === activeChannelId) || accessibleChannels[0] || CHANNELS[0];

  // Subscribe to real-time chat messages via Firebase Firestore
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeChat(activeChannel.id, (incoming) => {
      setMessages(incoming);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [activeChannel.id]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const content = inputText.trim();
    setInputText('');

    const newMsg: Omit<ChatMessage, 'id' | 'createdAt'> = {
      channelId: activeChannel.id,
      channelName: activeChannel.name,
      senderId: currentUser?.id || 'guest-01',
      senderName: currentUser?.name || 'Pengguna SIAKAD',
      senderRole: (currentUser?.role || currentRole || 'siswa') as UserRole,
      senderSchoolName: schoolProfile?.name || 'SMA Negeri 1 Jakarta',
      content,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    // Optimistically update local message stream
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      ...newMsg,
      id: tempId,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await sendChatMessageToFirebase(newMsg);
      setSendSuccessNotice(true);
      setTimeout(() => setSendSuccessNotice(false), 2000);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.content.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col space-y-3 sm:space-y-4">
      {/* Top Banner Header - compact on mobile */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black text-slate-800 tracking-tight truncate">
              Ruang Obrolan Real-Time
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              Terhubung langsung dengan civitas akademika {schoolProfile?.name || 'Sekolah'}
            </p>
          </div>
        </div>

        {/* Live Firebase Sync Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-700 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi className="w-3 h-3 text-emerald-600 hidden sm:inline" />
          <span>Live Real-Time</span>
        </div>
      </div>

      {/* Main Chat Interface Layout */}
      <div className="w-full h-[calc(100dvh-185px)] sm:h-[calc(100vh-215px)] min-h-[480px] max-h-[820px] flex flex-col lg:grid lg:grid-cols-12 lg:gap-4">
        {/* Left Column: Channels List (On mobile: only visible when mobileView === 'channels') */}
        <div
          className={`${
            mobileView === 'channels' ? 'flex' : 'hidden'
          } lg:flex lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 flex-col shadow-2xs h-full overflow-hidden`}
        >
          {/* Header on Channels view */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Daftar Saluran Komunikasi
              </h3>
              <p className="text-[11px] text-slate-400 px-1">
                Pilih ruang obrolan untuk berkoordinasi:
              </p>
            </div>
            {/* Mobile close channels button */}
            <button
              onClick={() => setMobileView('chat')}
              className="lg:hidden text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 cursor-pointer"
            >
              Ke Obrolan →
            </button>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {CHANNELS.map((ch) => {
              const isAllowed = !currentRole || ch.allowedRoles.includes(currentRole);
              const isSelected = ch.id === activeChannel.id;
              const Icon = ch.icon;

              return (
                <button
                  key={ch.id}
                  disabled={!isAllowed}
                  onClick={() => {
                    setActiveChannelId(ch.id);
                    setSearchQuery('');
                    setMobileView('chat'); // automatically switch back to chat on mobile
                  }}
                  className={`w-full text-left p-3 rounded-xl transition flex items-start gap-3 border cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-xs ring-1 ring-teal-200'
                      : isAllowed
                      ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-teal-600 text-white'
                        : isAllowed
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isAllowed ? <Icon className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold truncate">{ch.name}</h4>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 ml-1.5" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {ch.description}
                    </p>
                    {!isAllowed && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        Khusus {ch.allowedRoles.join(', ')}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* User Status Card at bottom of channels */}
          <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {currentUser?.name || 'Pengguna'}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {currentUser?.role || currentRole || 'siswa'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Online
            </span>
          </div>
        </div>

        {/* Right Column: Chat Conversation Stream (On mobile: visible when mobileView === 'chat') */}
        <div
          className={`${
            mobileView === 'chat' ? 'flex' : 'hidden'
          } lg:flex lg:col-span-8 bg-white rounded-2xl border border-slate-200 flex-col shadow-2xs h-full overflow-hidden`}
        >
          {/* Channel Header & Mobile Switcher */}
          <div className="p-2.5 sm:p-3.5 border-b border-slate-200 bg-slate-50/80 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* Mobile Button to View All Channels */}
                <button
                  type="button"
                  onClick={() => setMobileView('channels')}
                  className="lg:hidden p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
                  title="Ganti Saluran"
                >
                  <Menu className="w-4 h-4 text-teal-600" />
                  <span className="text-[11px]">Saluran</span>
                </button>

                <div className="p-1.5 sm:p-2 rounded-lg bg-teal-100 text-teal-800 shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                    <span>{activeChannel.name}</span>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                    {activeChannel.description}
                  </p>
                </div>
              </div>

              {/* In-chat search trigger */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSearchMobile(!showSearchMobile)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 sm:hidden cursor-pointer"
                  title="Cari pesan"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Desktop search */}
                <div className="relative hidden sm:block w-48 lg:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari pesan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Expandable Search Bar */}
            {showSearchMobile && (
              <div className="mt-2 sm:hidden relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari dalam obrolan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-700"
                  autoFocus
                />
              </div>
            )}

            {/* Quick Horizontal Channel Switcher Tabs (Accessible on both mobile and desktop) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider hidden sm:inline">
                Pindah:
              </span>
              {accessibleChannels.map((ch) => {
                const isSelected = ch.id === activeChannel.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveChannelId(ch.id);
                      setSearchQuery('');
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border transition cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-teal-50 hover:text-teal-700 border-slate-200'
                    }`}
                  >
                    #{ch.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3 bg-slate-50/50">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-700">
                  {searchQuery ? 'Tidak ada pesan yang cocok' : 'Belum ada percakapan'}
                </h4>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  {searchQuery
                    ? 'Coba gunakan kata kunci pencarian yang lain.'
                    : `Mulai pesan pertama di #${activeChannel.name}. Tersinkronisasi secara real-time.`}
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isOwn = msg.senderId === currentUser?.id;
                const roleBadge = ROLE_BADGES[msg.senderRole] || {
                  label: msg.senderRole,
                  bg: 'bg-slate-100',
                  text: 'text-slate-600',
                  border: 'border-slate-200',
                };

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-xl ${
                      isOwn ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    {/* Sender Info */}
                    <div className="flex items-center gap-1.5 mb-1 px-1 flex-wrap">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-700">
                        {isOwn ? 'Saya' : msg.senderName}
                      </span>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                      >
                        {roleBadge.label}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isOwn
                          ? 'bg-teal-600 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply suggestion chips */}
          <div className="px-2.5 sm:px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Balas Cepat:
            </span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(prompt)}
                className="text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 transition cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box Form */}
          <form onSubmit={handleSendMessage} className="p-2 sm:p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Tulis pesan di #${activeChannel.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800 placeholder-slate-400 transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="px-3 sm:px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer min-h-[40px] shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>
            {sendSuccessNotice && (
              <p className="text-[10px] font-bold text-teal-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Pesan tersinkronisasi ke Firebase secara real-time
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
