import React, { useState } from 'react';
import {
  useTheme,
  THEME_PRESETS,
  DEFAULT_BOTTOM_NAV_CONFIG,
  DEFAULT_BOTTOM_NAV_ITEMS,
} from '../../context/ThemeContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  BottomNavigation,
  BOTTOM_NAV_ICON_MAP,
} from '../layout/BottomNavigation';
import {
  Palette,
  Sparkles,
  Layout,
  Layers,
  Square,
  Sun,
  Moon,
  Check,
  RotateCcw,
  RotateCw,
  Save,
  Download,
  Upload,
  Eye,
  CheckCircle2,
  Shield,
  Sliders,
  ChevronRight,
  Maximize2,
  Minimize2,
  Smartphone,
  Monitor,
  Copy,
  Info,
  School,
  GraduationCap,
  Users,
  Award,
  Search,
  Calendar,
  Clock,
  Flame,
  Zap,
  Navigation,
  ArrowUpDown,
  MoveVertical,
  SlidersHorizontal,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Home,
  BookOpen,
  MessageSquare,
  Megaphone,
  Grid,
  LayoutDashboard,
  Bell,
} from 'lucide-react';
import {
  ThemePresetId,
  CardRadiusType,
  CardBorderStyle,
  CardShadowType,
  CardBgType,
  CardSpacingType,
  CardPaddingYType,
  BackgroundStyleType,
  SidebarStyleType,
  HeaderStyleType,
  UiDensityType,
  BottomNavConfig,
  BottomNavStyleType,
  BottomNavActiveStyleType,
  BottomNavLabelModeType,
  BottomNavIconSizeType,
  BottomNavItemConfig,
} from '../../types';

export const ThemeCustomizerModule: React.FC = () => {
  const {
    themeConfig,
    updateThemeConfig,
    applyPreset,
    resetTheme,
    saveTheme,
    isDirty,
    isCloudSynced,
    isSavingToCloud,
    lastSyncedAt,
    exportThemeJSON,
    importThemeJSON,
    activePresetInfo,
  } = useTheme();

  const { schoolProfile, updateSchoolProfile, logAction } = useSiakadData();
  const { currentUser, currentRole } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'presets' | 'colors' | 'cards' | 'background' | 'navigation' | 'bottomNav' | 'density'
  >('presets');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedJson, setCopiedJson] = useState(false);
  const [simulatedCurrentModule, setSimulatedCurrentModule] = useState('dashboard');
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);

  // Common quick palette colors
  const primarySwatches = [
    { label: 'Zamrud', hex: '#0f766e' },
    { label: 'Hijau Daun', hex: '#16a34a' },
    { label: 'Royal Blue', hex: '#1d4ed8' },
    { label: 'Sky Blue', hex: '#0284c7' },
    { label: 'Cyan Laut', hex: '#0891b2' },
    { label: 'Indigo', hex: '#4f46e5' },
    { label: 'Ungu Prestise', hex: '#7c3aed' },
    { label: 'Sunset Amber', hex: '#d97706' },
    { label: 'Orange Hangat', hex: '#ea580c' },
    { label: 'Crimson Ruby', hex: '#be123c' },
    { label: 'Rose Pink', hex: '#e11d48' },
    { label: 'Nordic Slate', hex: '#334155' },
    { label: 'Charcoal Gelap', hex: '#1e293b' },
  ];

  const accentSwatches = [
    { label: 'Emerald Glow', hex: '#10b981' },
    { label: 'Cyan Terang', hex: '#06b6d4' },
    { label: 'Sky Cerah', hex: '#38bdf8' },
    { label: 'Blue Ice', hex: '#60a5fa' },
    { label: 'Violet Neon', hex: '#a855f7' },
    { label: 'Pink Fuchsia', hex: '#ec4899' },
    { label: 'Amber Terang', hex: '#f59e0b' },
    { label: 'Oranye Neon', hex: '#f97316' },
    { label: 'Kuning Emas', hex: '#eab308' },
    { label: 'Slate Soft', hex: '#64748b' },
  ];

  const handleSave = async () => {
    await saveTheme({
      id: currentUser?.id,
      name: currentUser?.name,
      role: currentRole,
    });
    // Also sync primary theme color & config to SchoolProfile
    updateSchoolProfile({
      themeColor: themeConfig.primaryColor,
      themeConfig: themeConfig,
    });
    if (currentUser) {
      logAction('UPDATE_THEME', 'Tema & Tampilan', `Kustomisasi tema tersinkronisasi ke seluruh akun: preset ${themeConfig.preset}, warna ${themeConfig.primaryColor}`, currentUser);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleReset = async () => {
    if (confirm('Kembalikan seluruh tema ke pengaturan bawaan Zamrud SIAKAD untuk seluruh akun?')) {
      await resetTheme({
        id: currentUser?.id,
        name: currentUser?.name,
        role: currentRole,
      });
      updateSchoolProfile({
        themeColor: '#0f766e',
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleCopyJson = () => {
    const json = exportThemeJSON();
    navigator.clipboard.writeText(json);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleImportJson = () => {
    setJsonError(null);
    if (!jsonInput.trim()) {
      setJsonError('Harap tempel teks format JSON konfigurasi tema.');
      return;
    }
    const ok = importThemeJSON(jsonInput);
    if (ok) {
      setShowJsonModal(false);
      setJsonInput('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setJsonError('Format JSON tidak valid atau struktur data tema tidak sesuai.');
    }
  };

  const bottomNavConfig = themeConfig.bottomNav || DEFAULT_BOTTOM_NAV_CONFIG;
  const bottomNavItems = bottomNavConfig.items || DEFAULT_BOTTOM_NAV_ITEMS;

  const handleUpdateBottomNavConfig = (updates: Partial<BottomNavConfig>) => {
    updateThemeConfig({
      bottomNav: {
        ...bottomNavConfig,
        ...updates,
      },
    });
  };

  const handleUpdateBottomNavItem = (id: string, updates: Partial<BottomNavItemConfig>) => {
    const updatedItems = bottomNavItems.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    updateThemeConfig({
      bottomNav: {
        ...bottomNavConfig,
        items: updatedItems,
      },
    });
  };

  const handleResetBottomNavToDefault = () => {
    updateThemeConfig({
      bottomNav: DEFAULT_BOTTOM_NAV_CONFIG,
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6">
      {/* Top Banner & Header - Compact & Sticky Compatible */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs relative overflow-hidden">
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-10 pointer-events-none blur-2xl"
          style={{ backgroundColor: themeConfig.primaryColor }}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-colors"
              style={{ backgroundColor: themeConfig.primaryColor }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-800">
                  Kustomisasi Tema, Warna & Tampilan
                </h1>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                >
                  {themeConfig.preset === 'custom' ? 'Kustom Manual' : activePresetInfo?.name || themeConfig.preset}
                </span>
                {isDirty && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                    Belum Disimpan
                  </span>
                )}
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud Sync Aktif (Guru, Murid, Ortu, Kepsek)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                Kustomisasi warna tema institusi, bentuk & jarak kartu atas-bawah, dan bilah menu ikon bawah.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-center shrink-0">
            <button
              onClick={() => {
                setJsonInput(exportThemeJSON());
                setShowJsonModal(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              title="Ekspor atau Impor konfigurasi tema JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition flex items-center gap-1.5 cursor-pointer"
              title="Reset ke tema bawaan SIAKAD"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSavingToCloud}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition flex items-center gap-1.5 transform active:scale-95 cursor-pointer disabled:opacity-75"
              style={{ backgroundColor: themeConfig.primaryColor }}
            >
              {isSavingToCloud ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Menyinkronkan...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Tersinkronisasi!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-white" />
                  <span>Simpan & Sinkronkan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Unsaved Feedback Banner */}
        {isDirty && (
          <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-[11px] text-amber-800">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Perubahan belum disinkronkan ke cloud. Klik <strong>Simpan & Sinkronkan</strong> agar akun Guru, Murid, Ortu, dan Kepsek ikut berubah.</span>
            </div>
            <button
              onClick={handleSave}
              className="font-bold underline hover:text-amber-900 shrink-0 ml-2 cursor-pointer"
            >
              Simpan Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left Controls (Tabs) & Right Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Customization Controls with Independent Smooth Scrolling */}
        <div className="lg:col-span-7 space-y-4 lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-2.5 sidebar-scroll overscroll-contain">
          {/* Mobile Quick Preview Banner (< lg) */}
          <div className="lg:hidden p-2.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs text-teal-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-600 animate-pulse shrink-0" />
              <span className="font-medium">Pratinjau tampilan tidak perlu di-scroll naik turun</span>
            </div>
            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Buka Pratinjau</span>
            </button>
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar border border-slate-200/70">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'presets'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preset Siap Pakai</span>
            </button>

            <button
              onClick={() => setActiveTab('colors')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'colors'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Warna & Palet</span>
            </button>

            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'cards'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Bentuk & Gaya Kartu</span>
            </button>

            <button
              onClick={() => setActiveTab('background')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'background'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Latar Belakang</span>
            </button>

            <button
              onClick={() => setActiveTab('navigation')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'navigation'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bilah Samping & Atas</span>
            </button>

            <button
              onClick={() => setActiveTab('bottomNav')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'bottomNav'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-teal-600" />
              <span>Menu Ikon Bawah (Mobile)</span>
            </button>

            <button
              onClick={() => setActiveTab('density')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'density'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Kepadatan UI</span>
            </button>
          </div>

          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Koleksi Preset Desain Institusi</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih salah satu tema profesional yang telah dikurasi dengan perpaduan warna, radius kartu, dan bayangan yang harmonis.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = themeConfig.preset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition relative overflow-hidden group hover:scale-[1.01] ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      style={{
                        borderColor: isSelected ? preset.config.primaryColor : undefined,
                      }}
                    >
                      {/* Color Preview Bar */}
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-7 h-7 rounded-xl shadow-xs flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: preset.config.primaryColor }}
                        >
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                        <div
                          className="w-4 h-4 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: preset.config.accentColor }}
                          title={`Aksen: ${preset.config.accentColor}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-800 truncate">{preset.name}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 shrink-0">
                              {preset.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {preset.description}
                      </p>

                      {/* Specs Mini Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono">
                          Radius: {preset.config.cardRadius}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono">
                          Bayangan: {preset.config.cardShadow}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100">
                          {preset.config.backgroundStyle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: COLORS */}
          {activeTab === 'colors' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-teal-600" />
                  <span>Kustomisasi Palet Warna Institusi</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Atur warna identitas sekolah, tombol utama, pendaran kartu, dan warna aksen notifikasi.
                </p>
              </div>

              {/* Primary Color Picker */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800">Warna Utama (Primary Brand Color)</label>
                    <p className="text-[11px] text-slate-500">Digunakan untuk tombol utama, sorotan aktif bilah samping, header tema, dan branding sekolah.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="color"
                      value={themeConfig.primaryColor}
                      onChange={(e) => updateThemeConfig({ primaryColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                      title="Pilih warna bebas"
                    />
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700">
                      {themeConfig.primaryColor}
                    </span>
                  </div>
                </div>

                {/* Quick Swatches for Primary */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Pilihan Cepat Warna Utama:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {primarySwatches.map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => updateThemeConfig({ primaryColor: swatch.hex })}
                        className={`w-7 h-7 rounded-xl transition transform hover:scale-110 flex items-center justify-center shadow-xs border ${
                          themeConfig.primaryColor.toLowerCase() === swatch.hex.toLowerCase()
                            ? 'ring-2 ring-offset-2 ring-slate-800 border-white'
                            : 'border-black/10'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                        title={`${swatch.label} (${swatch.hex})`}
                      >
                        {themeConfig.primaryColor.toLowerCase() === swatch.hex.toLowerCase() && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Accent Color Picker */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800">Warna Aksen (Secondary / Accent Color)</label>
                    <p className="text-[11px] text-slate-500">Digunakan untuk garis gradasi atas kartu, badge sorotan, dan elemen grafis tambahan.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="color"
                      value={themeConfig.accentColor}
                      onChange={(e) => updateThemeConfig({ accentColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                      title="Pilih warna aksen bebas"
                    />
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700">
                      {themeConfig.accentColor}
                    </span>
                  </div>
                </div>

                {/* Quick Swatches for Accent */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Pilihan Cepat Warna Aksen:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {accentSwatches.map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => updateThemeConfig({ accentColor: swatch.hex })}
                        className={`w-7 h-7 rounded-xl transition transform hover:scale-110 flex items-center justify-center shadow-xs border ${
                          themeConfig.accentColor.toLowerCase() === swatch.hex.toLowerCase()
                            ? 'ring-2 ring-offset-2 ring-slate-800 border-white'
                            : 'border-black/10'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                        title={`${swatch.label} (${swatch.hex})`}
                      >
                        {themeConfig.accentColor.toLowerCase() === swatch.hex.toLowerCase() && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Header Stripe Accent Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Garis Gradasi Aksen Pada Bagian Atas Kartu</h3>
                  <p className="text-[11px] text-slate-500">Menambahkan garis aksen tipis elegan (gradasi warna utama & aksen) di setiap kartu modul.</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateThemeConfig({ enableCardHeaderStripe: !themeConfig.enableCardHeaderStripe })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ease-in-out cursor-pointer ${
                    themeConfig.enableCardHeaderStripe ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                  style={{
                    backgroundColor: themeConfig.enableCardHeaderStripe ? themeConfig.primaryColor : undefined,
                  }}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ease-in-out ${
                      themeConfig.enableCardHeaderStripe ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CARDS (Shape, Radius, Shadow, Background, Border) */}
          {activeTab === 'cards' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Square className="w-4 h-4 text-indigo-600" />
                  <span>Bentuk, Model & Penampilan Kartu</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Atur sudut kelengkungan (border-radius), bayangan kedalaman (shadow), warna latar kartu, dan ketebalan garis tepi.
                </p>
              </div>

              {/* 1. Card Corner Radius */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Kelengkungan Sudut Kartu (Border Radius)</label>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    {themeConfig.cardRadius === 'none' && '0px (Sharp Tajam)'}
                    {themeConfig.cardRadius === 'sm' && '6px (Kompak/Subtle)'}
                    {themeConfig.cardRadius === 'md' && '12px (Klasik)'}
                    {themeConfig.cardRadius === 'lg' && '16px (Modern Standar)'}
                    {themeConfig.cardRadius === 'xl' && '24px (Soft Rounded)'}
                    {themeConfig.cardRadius === 'full' && '32px (Super Soft Pill)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'none', label: 'Tajam / Brutalis', radius: '0px', shapeClass: 'rounded-none' },
                    { id: 'sm', label: 'Kompak (6px)', radius: '6px', shapeClass: 'rounded-sm' },
                    { id: 'md', label: 'Klasik (12px)', radius: '12px', shapeClass: 'rounded-md' },
                    { id: 'lg', label: 'Modern (16px)', radius: '16px', shapeClass: 'rounded-2xl' },
                    { id: 'xl', label: 'Lembut (24px)', radius: '24px', shapeClass: 'rounded-3xl' },
                    { id: 'full', label: 'Kapsul (32px)', radius: '32px', shapeClass: 'rounded-[28px]' },
                  ].map((item) => {
                    const isSelected = themeConfig.cardRadius === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateThemeConfig({ cardRadius: item.id as CardRadiusType })}
                        className={`p-3 border-2 transition text-left relative flex flex-col justify-between h-20 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/20 text-slate-800 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                        style={{
                          borderRadius: item.radius,
                          borderColor: isSelected ? themeConfig.primaryColor : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs">{item.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />}
                        </div>
                        <div className="w-full h-3 border border-dashed border-slate-300 bg-slate-100" style={{ borderRadius: item.radius }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Card Shadow / Elevation */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-800 block">Efek Bayangan & Kedalaman (Card Shadow)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'none', label: 'Datar (Flat)', desc: 'Tanpa bayangan' },
                    { id: 'sm', label: 'Halus (Subtle)', desc: 'Elevasi lembut' },
                    { id: 'md', label: 'Medium', desc: 'Kedalaman seimbang' },
                    { id: 'lg', label: 'Tinggi (Deep)', desc: 'Efek melayang' },
                    { id: 'glow', label: 'Pendaran (Glow)', desc: 'Neon warna tema' },
                  ].map((item) => {
                    const isSelected = themeConfig.cardShadow === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateThemeConfig({ cardShadow: item.id as CardShadowType })}
                        className={`p-3 rounded-2xl border-2 transition text-center flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/20 text-slate-900 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                        style={{
                          borderColor: isSelected ? themeConfig.primaryColor : undefined,
                        }}
                      >
                        <span className="text-xs">{item.label}</span>
                        <span className="text-[10px] text-slate-400">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Card Background Style / Color */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-800 block">Warna & Bahan Latar Kartu (Card Background)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'pure-white', label: 'Putih Murni', desc: 'Standar #FFFFFF bersih', bg: 'bg-white' },
                    { id: 'frosted-glass', label: 'Kaca Buram', desc: 'Frosted Glassmorphism', bg: 'bg-white/70 backdrop-blur-md' },
                    { id: 'soft-tint', label: 'Sentuhan Aksen', desc: 'Tint warna tema 4%', bg: 'bg-teal-50/40' },
                    { id: 'off-white', label: 'Off-White Halus', desc: 'Slate-50 #F8FAFC', bg: 'bg-slate-50' },
                    { id: 'dark-slate', label: 'Dark Slate', desc: 'Kontras gelap #1E293B', bg: 'bg-slate-800 text-white' },
                  ].map((item) => {
                    const isSelected = themeConfig.cardBg === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateThemeConfig({ cardBg: item.id as CardBgType })}
                        className={`p-3 rounded-2xl border-2 transition text-left flex flex-col justify-between h-20 ${
                          isSelected
                            ? 'border-teal-600 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        } ${item.bg}`}
                        style={{
                          borderColor: isSelected ? themeConfig.primaryColor : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${item.id === 'dark-slate' ? 'text-white' : 'text-slate-800'}`}>
                            {item.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />}
                        </div>
                        <span className={`text-[10px] ${item.id === 'dark-slate' ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Card Border Style */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-800 block">Gaya Garis Tepi Kartu (Card Border)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'none', label: 'Tanpa Border', desc: 'Border 0px (Frameless)' },
                    { id: 'subtle', label: 'Halus Minimalis', desc: '1px Slate-200' },
                    { id: 'tinted', label: 'Berwarna Aksen', desc: '1px Tint Warna Tema' },
                    { id: 'prominent', label: 'Tegas / Solid', desc: '2px Slate-300' },
                  ].map((item) => {
                    const isSelected = themeConfig.cardBorderStyle === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateThemeConfig({ cardBorderStyle: item.id as CardBorderStyle })}
                        className={`p-3 rounded-2xl border-2 transition text-center flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/20 text-slate-900 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                        style={{
                          borderColor: isSelected ? themeConfig.primaryColor : undefined,
                        }}
                      >
                        <span className="text-xs">{item.label}</span>
                        <span className="text-[10px] text-slate-400">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Jarak Vertikal Kartu (Atas & Bawah) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MoveVertical className="w-4 h-4 text-teal-600" />
                      <span>Pengaturan Jarak Kartu: Atas & Bawah (Card Spacing & Margins)</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Atur jarak renggang vertikal antar kartu, margin atas-bawah, serta padding isi kartu. Bisa diatur hingga 0px (menempel rapat tanpa celah kosong).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      Jarak: {themeConfig.cardMarginBottom ?? 14}px ({themeConfig.cardSpacingY || 'normal'})
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi Cepat Jarak Kartu */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      updateThemeConfig({
                        cardMarginBottom: 0,
                        cardMarginTop: 0,
                        cardSpacingY: 'ultra',
                        cardPaddingY: 'ultra',
                      })
                    }
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Nolkan semua jarak kartu agar menempel rapat tanpa ruang sisa kosong"
                  >
                    <span>⚡ Nolkan Jarak (0px Super Rapat)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateThemeConfig({
                        cardMarginBottom: 6,
                        cardMarginTop: 0,
                        cardSpacingY: 'compact',
                        cardPaddingY: 'compact',
                      })
                    }
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🌱 Rapat Padat (6px)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateThemeConfig({
                        cardMarginBottom: 14,
                        cardMarginTop: 0,
                        cardSpacingY: 'normal',
                        cardPaddingY: 'normal',
                      })
                    }
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⚖️ Standar (14px)</span>
                  </button>
                </div>

                {/* 5a. Preset Jarak Cepat */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">Pilihan Preset Jarak Cepat:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'ultra', label: 'Ultra (0px)', desc: 'Kartu menempel rapat, 0 celah kosong', gap: 0, top: 0, btm: 0, pad: 'ultra' },
                      { id: 'compact', label: 'Kompak (6px)', desc: 'Hemat ruang layar, efisien padat', gap: 6, top: 0, btm: 6, pad: 'compact' },
                      { id: 'normal', label: 'Standar (14px)', desc: 'Seimbang & proporsional harian', gap: 14, top: 0, btm: 14, pad: 'normal' },
                      { id: 'relaxed', label: 'Renggang (22px)', desc: 'Lega & santai dibaca', gap: 22, top: 4, btm: 22, pad: 'normal' },
                      { id: 'spacious', label: 'Lapang (32px)', desc: 'Gaya editorial ekstra luas', gap: 32, top: 8, btm: 32, pad: 'relaxed' },
                    ].map((sp) => {
                      const isSelected =
                        (themeConfig.cardSpacingY === sp.id) ||
                        (themeConfig.cardMarginBottom === sp.btm);
                      return (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() =>
                            updateThemeConfig({
                              cardSpacingY: sp.id as CardSpacingType,
                              cardMarginTop: sp.top,
                              cardMarginBottom: sp.btm,
                              cardPaddingY: sp.pad as CardPaddingYType,
                            })
                          }
                          className={`p-2.5 rounded-xl border-2 transition text-left flex flex-col justify-between ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50/20 text-slate-900 font-bold shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                          }`}
                          style={{
                            borderColor: isSelected ? themeConfig.primaryColor : undefined,
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs">{sp.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">{sp.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5b. Slider Kontrol Presisi: Jarak Antar Kartu & Margin Atas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  {/* Margin Bawah / Jarak Antar Kartu (Bisa Sampai 0px) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Jarak Vertikal Antar Kartu (Margin Bawah)</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                        {themeConfig.cardMarginBottom ?? 14} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={36}
                      step={1}
                      value={themeConfig.cardMarginBottom ?? 14}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const spacingType: CardSpacingType =
                          val <= 2 ? 'ultra' : val <= 8 ? 'compact' : val <= 18 ? 'normal' : val <= 26 ? 'relaxed' : 'spacious';
                        updateThemeConfig({
                          cardMarginBottom: val,
                          cardSpacingY: spacingType,
                        });
                      }}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-emerald-600 font-bold">0px (Menempel Rapat)</span>
                      <span>14px (Standar)</span>
                      <span>36px (Maksimal)</span>
                    </div>
                  </div>

                  {/* Margin Atas (Margin Top) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Margin Atas Kartu (Margin Top)</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                        {themeConfig.cardMarginTop ?? 0} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      step={1}
                      value={themeConfig.cardMarginTop ?? 0}
                      onChange={(e) => updateThemeConfig({ cardMarginTop: Number(e.target.value) })}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>0px (Rapat)</span>
                      <span>12px</span>
                      <span>24px (Maksimal)</span>
                    </div>
                  </div>
                </div>

                {/* 5c. Padding Vertikal Isi Kartu (Padding Y) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Padding Vertikal Dalam Kartu (Tinggi Ruang Isi):</span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      {(themeConfig.cardPaddingY || 'normal') === 'ultra' && '6px (py-1.5 - Sangat Rapat)'}
                      {(themeConfig.cardPaddingY || 'normal') === 'compact' && '12px (py-3 - Ringkas)'}
                      {(themeConfig.cardPaddingY || 'normal') === 'normal' && '18px (py-4.5 - Standar)'}
                      {(themeConfig.cardPaddingY || 'normal') === 'relaxed' && '26px (py-6.5 - Lapang)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'ultra', label: 'Ultra Padat (6px)', desc: 'Ruang minimal, data rapat' },
                      { id: 'compact', label: 'Ringkas (12px)', desc: 'Hemat tinggi kartu' },
                      { id: 'normal', label: 'Standar (18px)', desc: 'Proporsional seimbang' },
                      { id: 'relaxed', label: 'Luas (26px)', desc: 'Ekstra lapang santai' },
                    ].map((pad) => {
                      const isSelected = (themeConfig.cardPaddingY || 'normal') === pad.id;
                      return (
                        <button
                          key={pad.id}
                          type="button"
                          onClick={() => updateThemeConfig({ cardPaddingY: pad.id as CardPaddingYType })}
                          className={`p-2.5 rounded-xl border-2 transition text-center flex flex-col items-center justify-center ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50/20 text-slate-900 font-bold'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                          }`}
                          style={{
                            borderColor: isSelected ? themeConfig.primaryColor : undefined,
                          }}
                        >
                          <span className="text-xs">{pad.label}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{pad.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Visual Inter-card Spacing Illustration Box */}
                <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-dashed border-slate-300 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Ilustrasi Visual Jarak Kartu</span>
                    <span className="font-mono text-slate-700">
                      Top: {themeConfig.cardMarginTop ?? 0}px • Bottom: {themeConfig.cardMarginBottom ?? 16}px
                    </span>
                  </div>
                  <div className="space-y-1">
                    {/* Simulated Card 1 */}
                    <div
                      className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs text-slate-700"
                      style={{
                        marginTop: `${themeConfig.cardMarginTop ?? 0}px`,
                        marginBottom: `${Math.max(4, (themeConfig.cardMarginBottom ?? 16) / 2)}px`,
                      }}
                    >
                      <span className="font-bold">Kartu Atas (Contoh Elemen)</span>
                      <span className="text-[10px] text-slate-400">Card 1</span>
                    </div>

                    {/* Gap indicator line */}
                    <div className="flex items-center justify-center py-0.5">
                      <div className="w-full border-t border-dashed border-teal-500/50 relative">
                        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-600 text-white font-mono text-[9px] px-2 py-0.5 rounded-full shadow-2xs">
                          Jarak Antar Kartu: {themeConfig.cardMarginBottom ?? 16}px
                        </span>
                      </div>
                    </div>

                    {/* Simulated Card 2 */}
                    <div
                      className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs text-slate-700"
                      style={{
                        marginTop: `${Math.max(4, (themeConfig.cardMarginBottom ?? 16) / 2)}px`,
                        marginBottom: `${themeConfig.cardMarginBottom ?? 16}px`,
                      }}
                    >
                      <span className="font-bold">Kartu Bawah (Contoh Elemen)</span>
                      <span className="text-[10px] text-slate-400">Card 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BACKGROUND (App Background, Textures, Patterns) */}
          {activeTab === 'background' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-emerald-600" />
                  <span>Latar Belakang Aplikasi (App Canvas Background)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih nuansa warna dasar atau motif geometris untuk kanvas keseluruhan antarmuka.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: 'neutral-slate',
                    label: 'Slate Netral (Standar)',
                    desc: 'Warna abu-abu lembut #F8FAFC bersih dan nyaman dipandang.',
                    previewStyle: { backgroundColor: '#f8fafc' },
                  },
                  {
                    id: 'warm-cream',
                    label: 'Kertas Hangat (Warm Paper)',
                    desc: 'Nuansa krem lembut #FAF7F2 bergaya kertas buku klasik.',
                    previewStyle: { backgroundColor: '#faf7f2' },
                  },
                  {
                    id: 'cool-gray',
                    label: 'Abu-abu Modern (Cool Zinc)',
                    desc: 'Warna abu modern #F1F5F9 dengan kontras tinggi terhadap kartu.',
                    previewStyle: { backgroundColor: '#f1f5f9' },
                  },
                  {
                    id: 'subtle-mesh',
                    label: 'Gradasi Cahaya (Ambient Mesh)',
                    desc: 'Cahaya ambient lembut di sudut layar sesuai warna tema institusi.',
                    previewStyle: {
                      background: `radial-gradient(at 0% 0%, ${themeConfig.primaryColor}22 0px, transparent 50%), radial-gradient(at 100% 100%, ${themeConfig.accentColor}22 0px, transparent 50%), #f8fafc`,
                    },
                  },
                  {
                    id: 'dot-matrix',
                    label: 'Titik Geometris (Dot Matrix)',
                    desc: 'Pola titik halus arsitektural bernuansa modern tech.',
                    previewStyle: {
                      backgroundColor: '#f8fafc',
                      backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                      backgroundSize: '16px 16px',
                    },
                  },
                  {
                    id: 'micro-grid',
                    label: 'Kisi Garis Mikro (Micro Grid)',
                    desc: 'Pola kotak-kotak mikro presisi khas lembar kerja akademik.',
                    previewStyle: {
                      backgroundColor: '#ffffff',
                      backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    },
                  },
                  {
                    id: 'midnight-dark',
                    label: 'Midnight Obsidian (Dark Canvas)',
                    desc: 'Kanvas gelap mendalam #0F172A untuk mode malam.',
                    previewStyle: { backgroundColor: '#0f172a' },
                  },
                ].map((item) => {
                  const isSelected = themeConfig.backgroundStyle === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => updateThemeConfig({ backgroundStyle: item.id as BackgroundStyleType })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between h-28 relative overflow-hidden ${
                        isSelected
                          ? 'border-teal-600 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      style={{
                        ...item.previewStyle,
                        borderColor: isSelected ? themeConfig.primaryColor : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between w-full relative z-10">
                        <span className={`text-xs font-bold ${item.id === 'midnight-dark' ? 'text-white' : 'text-slate-800'}`}>
                          {item.label}
                        </span>
                        {isSelected && (
                          <div
                            className="w-5 h-5 rounded-full text-white flex items-center justify-center text-xs shadow-xs"
                            style={{ backgroundColor: themeConfig.primaryColor }}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className={`text-[11px] relative z-10 ${item.id === 'midnight-dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: NAVIGATION (Sidebar & Header Styles) */}
          {activeTab === 'navigation' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Model Bilah Samping (Sidebar) & Bilah Atas (Header)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tentukan corak tampilan bilah navigasi utama untuk menghadirkan kesan formal atau kontemporer.
                </p>
              </div>

              {/* Sidebar Styles */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 block">Model Bilah Samping (Sidebar)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'white-clean',
                      label: 'Putih Bersih (Clean White)',
                      desc: 'Latar putih terang minimalis dengan pemisah garis tipis.',
                    },
                    {
                      id: 'dark-navy',
                      label: 'Obsidian Gelap (Dark Navy)',
                      desc: 'Latar gelap eksklusif #0F172A dengan ikon kontras tinggi.',
                    },
                    {
                      id: 'frosted-glass',
                      label: 'Kaca Transparan (Glassmorphism)',
                      desc: 'Efek semi transparan tembus pandang dengan blur halus.',
                    },
                    {
                      id: 'primary-gradient',
                      label: 'Gradasi Warna Institusi',
                      desc: 'Gradasi halus dari warna utama sekolah ke warna aksen.',
                    },
                  ].map((item) => {
                    const isSelected = themeConfig.sidebarStyle === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateThemeConfig({ sidebarStyle: item.id as SidebarStyleType })}
                        className={`p-3.5 rounded-2xl border-2 transition text-left flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/20 text-slate-800'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                        style={{
                          borderColor: isSelected ? themeConfig.primaryColor : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-slate-800">{item.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />}
                        </div>
                        <span className="text-[11px] text-slate-500">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Header Styles */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 block">Model Bilah Atas (App Header)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'white-clean',
                      label: 'Putih Solid (Solid White)',
                      desc: 'Header putih klasik tanpa efek tembus pandang.',
                    },
                    {
                      id: 'glass-blur',
                      label: 'Kaca Buram (Glass Blur)',
                      desc: 'Transparan dengan backdrop-blur modern.',
                    },
                    {
                      id: 'primary-tint',
                      label: 'Sentuhan Warna Tema (Tinted)',
                      desc: 'Header diberi nuansa warna tema sekolah secara transparan.',
                    },
                    {
                      id: 'dark-slate',
                      label: 'Gelap Elegan (Dark Header)',
                      desc: 'Header abu gelap kontras tinggi untuk suasana malam.',
                    },
                  ].map((item) => {
                    const isSelected = themeConfig.headerStyle === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateThemeConfig({ headerStyle: item.id as HeaderStyleType })}
                        className={`p-3.5 rounded-2xl border-2 transition text-left flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/20 text-slate-800'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                        style={{
                          borderColor: isSelected ? themeConfig.primaryColor : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-slate-800">{item.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />}
                        </div>
                        <span className="text-[11px] text-slate-500">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: BOTTOM NAVIGATION & ICON CUSTOMIZATION */}
          {activeTab === 'bottomNav' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-teal-600" />
                    <span>Kustomisasi Bilah & Menu Ikon Bawah (Bottom Navigation)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Atur model bilah navigasi ponsel, efek aktif, mode teks label, ukuran ikon, serta sesuaikan teks dan ikon untuk 5 menu utama (Beranda, Akademik, Jadwal, Notifikasi, Menu).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetBottomNavToDefault}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                  title="Kembalikan nama & ikon bilah bawah ke pengaturan bawaan"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Menu Bawah</span>
                </button>
              </div>

              {/* 1. Model Desain Bilah Navigasi Bawah */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  1. Model Desain Bilah Bawah (Bar Style)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'classic', label: 'Bilah Klasik Menempel', desc: 'Dock penuh di bawah layar dengan garis pemisah atas.' },
                    { id: 'floating', label: 'Melayang (Floating Island)', desc: 'Mengambang elegan dengan rounded kapsul & bayangan mewah.' },
                    { id: 'glassmorphism', label: 'Kaca Tembus Pandang', desc: 'Efek frosted glass transparan dengan blur tinggi.' },
                    { id: 'colored', label: 'Aksen Warna Tema', desc: 'Gradasi dinamis mengikuti warna identitas sekolah.' },
                    { id: 'dark', label: 'Midnight Dark Dock', desc: 'Latar gelap obsidian #0F172A dengan ikon kontras tinggi.' },
                    { id: 'minimal', label: 'Minimalis Ramping', desc: 'Tampilan bersih tanpa bayangan atau border mencolok.' },
                  ].map((styleOption) => {
                    const isSelected = (bottomNavConfig.style || 'classic') === styleOption.id;
                    return (
                      <button
                        key={styleOption.id}
                        type="button"
                        onClick={() => handleUpdateBottomNavConfig({ style: styleOption.id as BottomNavStyleType })}
                        className={`p-3 rounded-2xl border-2 transition text-left flex flex-col justify-between h-22 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/20 text-slate-900 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                        style={{
                          borderColor: isSelected ? themeConfig.primaryColor : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-slate-800">{styleOption.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">{styleOption.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Gaya Efek Menu Aktif */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  2. Gaya Efek Indikator Menu Aktif (Active Indicator Effect)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'pill', label: 'Kapsul Melengkung', desc: 'Pill lembut di balik ikon' },
                    { id: 'bubble', label: 'Bubble Terangkat', desc: 'Ikon terangkat naik bulat' },
                    { id: 'top-bar', label: 'Garis Aksen Atas', desc: 'Garis horizontal di atas menu' },
                    { id: 'glow', label: 'Pendaran Neon Glow', desc: 'Pendaran cahaya warna tema' },
                    { id: 'minimal', label: 'Sederhana (Scale)', desc: 'Skala pembesaran & warna' },
                  ].map((act) => {
                    const isSelected = (bottomNavConfig.activeStyle || 'pill') === act.id;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => handleUpdateBottomNavConfig({ activeStyle: act.id as BottomNavActiveStyleType })}
                        className={`p-3 rounded-2xl border-2 transition text-center flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/20 text-slate-900 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                        style={{
                          borderColor: isSelected ? themeConfig.primaryColor : undefined,
                        }}
                      >
                        <span className="text-xs">{act.label}</span>
                        <span className="text-[10px] text-slate-400">{act.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Mode Teks Label & Ukuran Ikon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 3a. Mode Label */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    3. Mode Teks Label Menu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: 'Semua Tampil', desc: 'Teks selalu ada' },
                      { id: 'active-only', label: 'Hanya Aktif', desc: 'Modern ala iOS/Android' },
                      { id: 'icons-only', label: 'Ikon Saja', desc: 'Super bersih tanpa teks' },
                    ].map((mode) => {
                      const isSelected = (bottomNavConfig.labelMode || 'all') === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => handleUpdateBottomNavConfig({ labelMode: mode.id as BottomNavLabelModeType })}
                          className={`p-2.5 rounded-xl border-2 transition text-center flex flex-col items-center justify-center ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50/20 text-slate-900 font-bold'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                          }`}
                          style={{
                            borderColor: isSelected ? themeConfig.primaryColor : undefined,
                          }}
                        >
                          <span className="text-xs">{mode.label}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{mode.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3b. Ukuran Ikon */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    4. Ukuran Ikon Navigasi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'sm', label: 'Kecil (18px)', desc: 'Ramping & ringkas' },
                      { id: 'md', label: 'Sedang (22px)', desc: 'Standar seimbang' },
                      { id: 'lg', label: 'Besar (26px)', desc: 'Mudah disentuh' },
                    ].map((sz) => {
                      const isSelected = (bottomNavConfig.iconSize || 'md') === sz.id;
                      return (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => handleUpdateBottomNavConfig({ iconSize: sz.id as BottomNavIconSizeType })}
                          className={`p-2.5 rounded-xl border-2 transition text-center flex flex-col items-center justify-center ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50/20 text-slate-900 font-bold'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                          }`}
                          style={{
                            borderColor: isSelected ? themeConfig.primaryColor : undefined,
                          }}
                        >
                          <span className="text-xs">{sz.label}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{sz.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. Opsi Tambahan: Badge & Floating Margin */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold text-slate-700">Tampilkan Angka Badge Notifikasi</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateBottomNavConfig({ showBadge: !bottomNavConfig.showBadge })}
                  className={`px-3 py-1 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    bottomNavConfig.showBadge !== false
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-200 text-slate-600 border border-slate-300'
                  }`}
                >
                  {bottomNavConfig.showBadge !== false ? '✓ Badge Aktif' : '✕ Badge Dinonaktifkan'}
                </button>
              </div>

              {/* 5. Kustomisasi Masing-Masing Menu Ikon */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                      <span>Kustomisasi Teks & Ikon untuk 5 Menu Bawah</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ubah label nama dan ganti ikon untuk masing-masing menu (Beranda, Akademik, Jadwal, Notifikasi, Menu).
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {bottomNavItems.map((item, index) => {
                    const CurrentIcon = BOTTOM_NAV_ICON_MAP[item.iconName] || LayoutDashboard;

                    // Curated icon choices for each specific slot
                    let suggestedIcons: string[] = [];
                    if (item.id === 'dashboard') {
                      suggestedIcons = ['LayoutDashboard', 'Home', 'Compass', 'Sparkles'];
                    } else if (item.id === 'grades') {
                      suggestedIcons = ['Award', 'GraduationCap', 'BookOpen', 'FileText', 'CheckSquare'];
                    } else if (item.id === 'schedules') {
                      suggestedIcons = ['Clock', 'Calendar', 'CalendarDays', 'AlarmClock'];
                    } else if (item.id === 'announcements') {
                      suggestedIcons = ['Bell', 'MessageSquare', 'Megaphone', 'Mail'];
                    } else if (item.id === 'menu') {
                      suggestedIcons = ['Menu', 'Grid', 'MoreHorizontal', 'Layers', 'Settings'];
                    } else {
                      suggestedIcons = ['LayoutDashboard', 'Home', 'Award', 'Clock', 'Bell', 'Menu'];
                    }

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border-2 transition space-y-3 ${
                          item.enabled !== false
                            ? 'border-slate-200 bg-white shadow-2xs'
                            : 'border-slate-200/60 bg-slate-50/70 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Left: Icon Preview & Title */}
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
                              style={{ backgroundColor: themeConfig.primaryColor }}
                            >
                              <CurrentIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800">
                                  Menu #{index + 1}: {item.label}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                  ID: {item.id}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400">
                                Ikon aktif: <strong className="font-mono text-slate-600">{item.iconName}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Right: Toggle Switch Enabled/Disabled */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <span className="text-xs text-slate-500">
                              {item.enabled !== false ? 'Aktif' : 'Tersembunyi'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateBottomNavItem(item.id, { enabled: item.enabled === false })}
                              className={`p-1 rounded-lg transition cursor-pointer ${
                                item.enabled !== false
                                  ? 'text-teal-600 hover:text-teal-800'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                              title={item.enabled !== false ? 'Sembunyikan menu ini' : 'Tampilkan menu ini'}
                            >
                              {item.enabled !== false ? (
                                <ToggleRight className="w-7 h-7" />
                              ) : (
                                <ToggleLeft className="w-7 h-7" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Controls: Edit Label & Select Icon */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100 items-center">
                          {/* Label input */}
                          <div className="sm:col-span-5 space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                              <Edit3 className="w-3 h-3 text-slate-400" />
                              <span>Label Nama Teks:</span>
                            </label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => handleUpdateBottomNavItem(item.id, { label: e.target.value })}
                              placeholder={`Contoh: ${item.label}`}
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                          </div>

                          {/* Icon Choices */}
                          <div className="sm:col-span-7 space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 block">
                              Pilih Model Ikon:
                            </label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {suggestedIcons.map((icName) => {
                                const PickIcon = BOTTOM_NAV_ICON_MAP[icName] || LayoutDashboard;
                                const isPickSelected = item.iconName === icName;
                                return (
                                  <button
                                    key={icName}
                                    type="button"
                                    onClick={() => handleUpdateBottomNavItem(item.id, { iconName: icName })}
                                    className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                                      isPickSelected
                                        ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold shadow-2xs'
                                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                                    }`}
                                    style={{
                                      borderColor: isPickSelected ? themeConfig.primaryColor : undefined,
                                    }}
                                    title={icName}
                                  >
                                    <PickIcon className="w-4 h-4" />
                                    <span className="text-[10px] hidden md:inline">{icName}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DENSITY */}
          {activeTab === 'density' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>Kepadatan Antarmuka (UI Density)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Atur ruang jarak (padding & margin) antar kartu dan tabel untuk kebutuhan visual santai atau kerja intensif data.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'comfortable',
                    title: 'Nyaman & Bersahabat (Comfortable)',
                    desc: 'Jarak renggang yang lapang, mudah dibaca di layar sentuh, tablet, dan laptop.',
                    badge: 'Disarankan',
                  },
                  {
                    id: 'compact',
                    title: 'Ringkas & Padat Data (Compact)',
                    desc: 'Jarak lebih padat, menampilkan lebih banyak baris tabel dan statistik dalam satu layar.',
                    badge: 'Admin & Operator',
                  },
                ].map((item) => {
                  const isSelected = themeConfig.uiDensity === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => updateThemeConfig({ uiDensity: item.id as UiDensityType })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between h-32 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      style={{
                        borderColor: isSelected ? themeConfig.primaryColor : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-slate-800">{item.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: themeConfig.primaryColor }}>
                        {isSelected ? '✓ Mode Aktif' : 'Pilih Mode Ini'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Simulator & Interactive Preview (5 Columns - Sticky & Locked at top, does not scroll away!) */}
        <div className="lg:col-span-5 lg:sticky lg:top-1 z-30 space-y-2 self-start">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-3.5 shadow-sm space-y-2">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-800">Pratinjau Layar Penuh</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Terkunci & Live
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white shadow-2xs text-slate-800' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Pratinjau Layar Desktop"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-white shadow-2xs text-slate-800' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Pratinjau Layar HP / Mobile"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Simulated Canvas Box - FULL DISPLAY: All elements fit 100% without inner scroll! */}
            {previewDevice === 'mobile' ? (
              <div
                className="w-full max-w-[310px] mx-auto rounded-[28px] border-[4px] border-slate-800 shadow-xl overflow-hidden flex flex-col h-[440px] bg-slate-50 transition-all duration-200 relative shrink-0"
                style={{
                  backgroundColor:
                    themeConfig.backgroundStyle === 'warm-cream'
                      ? '#faf7f2'
                      : themeConfig.backgroundStyle === 'cool-gray'
                      ? '#f1f5f9'
                      : themeConfig.backgroundStyle === 'midnight-dark'
                      ? '#0f172a'
                      : '#f8fafc',
                }}
              >
                {/* Smartphone Notch */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-2.5 bg-slate-800 rounded-full z-30 flex items-center justify-center pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700/60 mr-1.5" />
                  <div className="w-6 h-0.5 rounded-full bg-slate-700" />
                </div>

                {/* Mobile Header */}
                <div
                  className="pt-3.5 px-3 pb-1 border-b border-slate-200/70 flex items-center justify-between text-xs z-20 shrink-0"
                  style={{
                    backgroundColor:
                      themeConfig.headerStyle === 'dark-slate'
                        ? '#1e293b'
                        : themeConfig.headerStyle === 'primary-tint'
                        ? `${themeConfig.primaryColor}15`
                        : '#ffffff',
                    color: themeConfig.headerStyle === 'dark-slate' ? '#ffffff' : '#1e293b',
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-4 h-4 rounded-md text-white flex items-center justify-center text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                      <School className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[10px] font-bold truncate">SIAKAD SEKOLAH</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: themeConfig.accentColor }} />
                    <span className="text-[8px] font-semibold text-slate-500">Live</span>
                  </div>
                </div>

                {/* Mobile Screen Body Content - FULL DISPLAY NO INNER SCROLL */}
                <div className="flex-1 px-2.5 py-1.5 flex flex-col justify-start overflow-hidden">
                  {/* Dynamic Greeting Hero Banner */}
                  <div
                    className="theme-hero-banner px-2.5 py-1.5 rounded-xl text-white shadow-2xs flex items-center justify-between transition-all shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${themeConfig.primaryColor} 0%, ${themeConfig.accentColor} 100%)`,
                      marginTop: `${themeConfig.cardMarginTop ?? 0}px`,
                      marginBottom: `${themeConfig.cardMarginBottom ?? 14}px`,
                      paddingTop:
                        (themeConfig.cardPaddingY || 'normal') === 'ultra'
                          ? '4px'
                          : (themeConfig.cardPaddingY || 'normal') === 'compact'
                          ? '6px'
                          : (themeConfig.cardPaddingY || 'normal') === 'normal'
                          ? '8px'
                          : '12px',
                      paddingBottom:
                        (themeConfig.cardPaddingY || 'normal') === 'ultra'
                          ? '4px'
                          : (themeConfig.cardPaddingY || 'normal') === 'compact'
                          ? '6px'
                          : (themeConfig.cardPaddingY || 'normal') === 'normal'
                          ? '8px'
                          : '12px',
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-[7.5px] text-white/80 font-medium leading-none">Selamat Datang,</p>
                      <h4 className="text-[10.5px] font-extrabold truncate mt-0.5">Akun SIAKAD</h4>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[7.5px] font-bold shrink-0">
                      {themeConfig.preset === 'custom' ? 'Kustom' : activePresetInfo?.badge || themeConfig.preset}
                    </span>
                  </div>

                  {/* Core Theme Card (Identity) */}
                  <div
                    className="theme-card px-2.5 py-1.5 transition text-xs shrink-0"
                    style={{
                      marginBottom: `${themeConfig.cardMarginBottom ?? 14}px`,
                      paddingTop:
                        (themeConfig.cardPaddingY || 'normal') === 'ultra'
                          ? '4px'
                          : (themeConfig.cardPaddingY || 'normal') === 'compact'
                          ? '6px'
                          : (themeConfig.cardPaddingY || 'normal') === 'normal'
                          ? '8px'
                          : '12px',
                      paddingBottom:
                        (themeConfig.cardPaddingY || 'normal') === 'ultra'
                          ? '4px'
                          : (themeConfig.cardPaddingY || 'normal') === 'compact'
                          ? '6px'
                          : (themeConfig.cardPaddingY || 'normal') === 'normal'
                          ? '8px'
                          : '12px',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0"
                        style={{ backgroundColor: themeConfig.primaryColor }}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-[9.5px] font-bold text-slate-800 truncate">{schoolProfile.name}</h5>
                        <p className="text-[7.5px] text-slate-500 truncate">Akreditasi {schoolProfile.accreditation || 'A'} • 2024/2025</p>
                      </div>
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[7.5px] font-bold text-white shrink-0"
                        style={{ backgroundColor: themeConfig.primaryColor }}
                      >
                        Aktif
                      </span>
                    </div>
                  </div>

                  {/* 2 Mini Metric Stats Cards */}
                  <div
                    className="grid grid-cols-2 gap-1.5 shrink-0"
                    style={{
                      marginBottom: `${themeConfig.cardMarginBottom ?? 14}px`,
                    }}
                  >
                    <div
                      className="theme-card px-1.5 text-center"
                      style={{
                        paddingTop:
                          (themeConfig.cardPaddingY || 'normal') === 'ultra'
                            ? '4px'
                            : (themeConfig.cardPaddingY || 'normal') === 'compact'
                            ? '6px'
                            : (themeConfig.cardPaddingY || 'normal') === 'normal'
                            ? '8px'
                            : '12px',
                        paddingBottom:
                          (themeConfig.cardPaddingY || 'normal') === 'ultra'
                            ? '4px'
                            : (themeConfig.cardPaddingY || 'normal') === 'compact'
                            ? '6px'
                            : (themeConfig.cardPaddingY || 'normal') === 'normal'
                            ? '8px'
                            : '12px',
                      }}
                    >
                      <span className="text-[7.5px] text-slate-500 block leading-tight">Total Siswa</span>
                      <span className="text-[11px] font-black text-slate-800">1,248</span>
                    </div>
                    <div
                      className="theme-card px-1.5 text-center"
                      style={{
                        paddingTop:
                          (themeConfig.cardPaddingY || 'normal') === 'ultra'
                            ? '4px'
                            : (themeConfig.cardPaddingY || 'normal') === 'compact'
                            ? '6px'
                            : (themeConfig.cardPaddingY || 'normal') === 'normal'
                            ? '8px'
                            : '12px',
                        paddingBottom:
                          (themeConfig.cardPaddingY || 'normal') === 'ultra'
                            ? '4px'
                            : (themeConfig.cardPaddingY || 'normal') === 'compact'
                            ? '6px'
                            : (themeConfig.cardPaddingY || 'normal') === 'normal'
                            ? '8px'
                            : '12px',
                      }}
                    >
                      <span className="text-[7.5px] text-slate-500 block leading-tight">Kehadiran</span>
                      <span className="text-[11px] font-black" style={{ color: themeConfig.primaryColor }}>98.4%</span>
                    </div>
                  </div>

                  {/* Interactive Button Preview */}
                  <div
                    className="flex items-center justify-center gap-1.5 pt-0.5 shrink-0"
                    style={{
                      marginBottom: `${Math.min(themeConfig.cardMarginBottom ?? 14, 6)}px`,
                    }}
                  >
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg text-[9px] font-bold text-white shadow-2xs"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                      Tombol Utama
                    </button>
                    <span
                      className="px-2 py-0.5 rounded-full text-[8.5px] font-bold border"
                      style={{
                        borderColor: `${themeConfig.primaryColor}55`,
                        backgroundColor: `${themeConfig.primaryColor}15`,
                        color: themeConfig.primaryColor,
                      }}
                    >
                      Aksen
                    </span>
                  </div>
                </div>

                {/* Interactive Bottom Navigation Bar - Pinned at bottom of the phone screen */}
                <div className="shrink-0 z-20 border-t border-slate-200/50 mt-auto">
                  <BottomNavigation
                    currentModule={simulatedCurrentModule}
                    setCurrentModule={setSimulatedCurrentModule}
                    onOpenMobileMenu={() => {}}
                    isSimulatedPreview={true}
                  />
                </div>
              </div>
            ) : (
              <div
                className="w-full rounded-xl border border-slate-300 shadow-md overflow-hidden flex flex-col h-[440px] bg-slate-50 transition-all duration-200 relative shrink-0"
                style={{
                  backgroundColor:
                    themeConfig.backgroundStyle === 'warm-cream'
                      ? '#faf7f2'
                      : themeConfig.backgroundStyle === 'cool-gray'
                      ? '#f1f5f9'
                      : themeConfig.backgroundStyle === 'midnight-dark'
                      ? '#0f172a'
                      : '#f8fafc',
                }}
              >
                {/* Desktop Window Titlebar */}
                <div className="bg-slate-200/90 border-b border-slate-300/70 px-2.5 py-1.5 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[9px] text-slate-500 font-mono ml-2">siakad.sekolah.sch.id</span>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-600">Desktop View</span>
                </div>

                {/* Desktop Screen Body */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Mini Sidebar */}
                  <div
                    className="w-14 border-r border-slate-200/70 p-1.5 flex flex-col items-center gap-1.5 shrink-0 transition"
                    style={{
                      backgroundColor:
                        themeConfig.sidebarStyle === 'dark-navy'
                          ? '#0f172a'
                          : themeConfig.sidebarStyle === 'primary-gradient'
                          ? themeConfig.primaryColor
                          : '#ffffff',
                      color:
                        themeConfig.sidebarStyle === 'dark-navy' || themeConfig.sidebarStyle === 'primary-gradient'
                          ? '#ffffff'
                          : '#334155',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-md text-white flex items-center justify-center font-bold text-[10px] shadow-2xs"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                      <School className="w-3 h-3" />
                    </div>
                    <div className="w-6 h-0.5 rounded-full bg-slate-300/60 my-0.5" />
                    <div className="w-6 h-4 rounded bg-teal-500/20 flex items-center justify-center text-[9px] font-bold">
                      <LayoutDashboard className="w-3 h-3 text-teal-600" />
                    </div>
                    <div className="w-6 h-4 rounded flex items-center justify-center text-[9px] opacity-60">
                      <Award className="w-3 h-3" />
                    </div>
                    <div className="w-6 h-4 rounded flex items-center justify-center text-[9px] opacity-60">
                      <Clock className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Main Desktop Content Pane */}
                  <div className="flex-1 p-2 space-y-2 overflow-hidden flex flex-col justify-between">
                    <div className="space-y-1.5">
                      {/* Hero Banner */}
                      <div
                        className="theme-hero-banner p-2 text-white shadow-2xs rounded-lg flex items-center justify-between"
                        style={{
                          background: `linear-gradient(135deg, ${themeConfig.primaryColor} 0%, ${themeConfig.accentColor} 100%)`,
                          marginTop: `${themeConfig.cardMarginTop ?? 0}px`,
                          marginBottom: `${themeConfig.cardMarginBottom ?? 14}px`,
                        }}
                      >
                        <div className="min-w-0">
                          <p className="text-[8px] text-white/80">Dashboard Akademik</p>
                          <h4 className="text-[11px] font-bold truncate">{schoolProfile.name}</h4>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/20 font-bold shrink-0">Resmi</span>
                      </div>

                      {/* 2 Cards side by side */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="theme-card p-1.5 space-y-0.5">
                          <span className="text-[8px] text-slate-500 block">Total Siswa</span>
                          <span className="text-xs font-black text-slate-800">1,248</span>
                        </div>
                        <div className="theme-card p-1.5 space-y-0.5">
                          <span className="text-[8px] text-slate-500 block">Rata-rata Nilai</span>
                          <span className="text-xs font-black" style={{ color: themeConfig.primaryColor }}>86.5</span>
                        </div>
                      </div>
                    </div>

                    {/* Docked bottom navigation bar */}
                    <div className="pt-1 border-t border-slate-200/60 shrink-0 mt-auto">
                      <BottomNavigation
                        currentModule={simulatedCurrentModule}
                        setCurrentModule={setSimulatedCurrentModule}
                        onOpenMobileMenu={() => {}}
                        isSimulatedPreview={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Summary of Current Active Styles - Compact Strip */}
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 grid grid-cols-2 gap-x-2 gap-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Preset:</span>
                <span className="font-bold text-slate-800 truncate ml-1">{activePresetInfo?.name || 'Kustom'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Warna:</span>
                <div className="flex items-center gap-1 ml-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: themeConfig.primaryColor }} />
                  <span className="font-mono font-bold text-slate-800 text-[10px]">{themeConfig.primaryColor}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Jarak Kartu:</span>
                <span className="font-mono font-bold text-emerald-700 text-[10px] truncate ml-1">
                  {themeConfig.cardMarginBottom ?? 14}px ({themeConfig.cardSpacingY || 'normal'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Menu Bawah:</span>
                <span className="font-mono font-bold text-slate-800 text-[10px] truncate ml-1">
                  {themeConfig.bottomNav?.style || 'classic'} • {themeConfig.bottomNav?.activeStyle || 'pill'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Preview Button for Mobile Screens (< lg) */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => setShowMobilePreviewModal(true)}
          className="px-4 py-2.5 rounded-full bg-teal-600 text-white font-bold text-xs shadow-xl hover:bg-teal-700 active:scale-95 transition flex items-center gap-2 border-2 border-white/60 cursor-pointer"
          style={{ backgroundColor: themeConfig.primaryColor }}
          title="Buka pratinjau tampilan layar"
        >
          <Eye className="w-4 h-4 text-white animate-pulse" />
          <span>Lihat Pratinjau</span>
        </button>
      </div>

      {/* Mobile Floating Preview Modal Drawer */}
      {showMobilePreviewModal && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 shadow-2xl space-y-3 border border-slate-100 flex flex-col max-h-[95vh] overflow-y-auto sidebar-scroll">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-800">Pratinjau Layar Penuh</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                  Live
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobilePreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mobile Phone in Modal */}
            <div
              className="w-full max-w-[290px] mx-auto rounded-[28px] border-[4px] border-slate-800 shadow-xl overflow-hidden flex flex-col h-[430px] bg-slate-50 transition-all duration-200 relative shrink-0"
              style={{
                backgroundColor:
                  themeConfig.backgroundStyle === 'warm-cream'
                    ? '#faf7f2'
                    : themeConfig.backgroundStyle === 'cool-gray'
                    ? '#f1f5f9'
                    : themeConfig.backgroundStyle === 'midnight-dark'
                    ? '#0f172a'
                    : '#f8fafc',
              }}
            >
              {/* Smartphone Notch */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-2.5 bg-slate-800 rounded-full z-30 flex items-center justify-center pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700/60 mr-1.5" />
                <div className="w-6 h-0.5 rounded-full bg-slate-700" />
              </div>

              {/* Mobile Header */}
              <div
                className="pt-3.5 px-3 pb-1 border-b border-slate-200/70 flex items-center justify-between text-xs z-20 shrink-0"
                style={{
                  backgroundColor:
                    themeConfig.headerStyle === 'dark-slate'
                      ? '#1e293b'
                      : themeConfig.headerStyle === 'primary-tint'
                      ? `${themeConfig.primaryColor}15`
                      : '#ffffff',
                  color: themeConfig.headerStyle === 'dark-slate' ? '#ffffff' : '#1e293b',
                }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="w-4 h-4 rounded-md text-white flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ backgroundColor: themeConfig.primaryColor }}
                  >
                    <School className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[10px] font-bold truncate">SIAKAD SEKOLAH</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: themeConfig.accentColor }} />
                  <span className="text-[8px] font-semibold text-slate-500">Live</span>
                </div>
              </div>

              {/* Mobile Screen Body Content */}
              <div className="flex-1 px-2 py-1 flex flex-col justify-start overflow-hidden">
                {/* Dynamic Greeting Hero Banner */}
                <div
                  className="theme-hero-banner px-2 py-1.5 rounded-xl text-white shadow-2xs flex items-center justify-between transition-all shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${themeConfig.primaryColor} 0%, ${themeConfig.accentColor} 100%)`,
                    marginTop: `${themeConfig.cardMarginTop ?? 0}px`,
                    marginBottom: `${themeConfig.cardMarginBottom ?? 14}px`,
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-[7.5px] text-white/80 font-medium leading-none">Selamat Datang,</p>
                    <h4 className="text-[10px] font-extrabold truncate mt-0.5">Akun SIAKAD</h4>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[7.5px] font-bold shrink-0">
                    {themeConfig.preset === 'custom' ? 'Kustom' : activePresetInfo?.badge || themeConfig.preset}
                  </span>
                </div>

                {/* Core Theme Card (Identity) */}
                <div
                  className="theme-card px-2 py-1.5 transition text-xs shrink-0"
                  style={{
                    marginBottom: `${themeConfig.cardMarginBottom ?? 14}px`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[9px] font-bold text-slate-800 truncate">{schoolProfile.name}</h5>
                      <p className="text-[7px] text-slate-500 truncate">Akreditasi {schoolProfile.accreditation || 'A'} • 2024/2025</p>
                    </div>
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[7px] font-bold text-white shrink-0"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                      Aktif
                    </span>
                  </div>
                </div>

                {/* 2 Mini Metric Stats Cards */}
                <div
                  className="grid grid-cols-2 gap-1.5 shrink-0"
                  style={{
                    marginBottom: `${themeConfig.cardMarginBottom ?? 14}px`,
                  }}
                >
                  <div className="theme-card px-1.5 text-center">
                    <span className="text-[7px] text-slate-500 block leading-tight">Total Siswa</span>
                    <span className="text-[10px] font-black text-slate-800">1,248</span>
                  </div>
                  <div className="theme-card px-1.5 text-center">
                    <span className="text-[7px] text-slate-500 block leading-tight">Kehadiran</span>
                    <span className="text-[10px] font-black" style={{ color: themeConfig.primaryColor }}>98.4%</span>
                  </div>
                </div>

                {/* Interactive Button Preview */}
                <div
                  className="flex items-center justify-center gap-1.5 pt-0.5 shrink-0"
                  style={{
                    marginBottom: `${Math.min(themeConfig.cardMarginBottom ?? 14, 6)}px`,
                  }}
                >
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg text-[9px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: themeConfig.primaryColor }}
                  >
                    Tombol Utama
                  </button>
                  <span
                    className="px-2 py-0.5 rounded-full text-[8px] font-bold border"
                    style={{
                      borderColor: `${themeConfig.primaryColor}55`,
                      backgroundColor: `${themeConfig.primaryColor}15`,
                      color: themeConfig.primaryColor,
                    }}
                  >
                    Aksen
                  </span>
                </div>
              </div>

              {/* Pinned Bottom Nav */}
              <div className="shrink-0 z-20 border-t border-slate-200/50 mt-auto">
                <BottomNavigation
                  currentModule={simulatedCurrentModule}
                  setCurrentModule={setSimulatedCurrentModule}
                  onOpenMobileMenu={() => {}}
                  isSimulatedPreview={true}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition cursor-pointer"
            >
              Tutup & Lanjutkan Pengaturan
            </button>
          </div>
        </div>
      )}

      {/* JSON Import/Export Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-800">Cadangan & Ekspor Tema (JSON)</h3>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Anda dapat menyalin teks JSON di bawah untuk menyimpan konfigurasi tema sekolah, atau menempel teks tema dari sekolah lain untuk diterapkan.
            </p>

            <div className="relative">
              <textarea
                rows={8}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Tempel konfigurasi JSON di sini..."
              />
            </div>

            {jsonError && (
              <p className="text-xs text-rose-600 font-semibold">{jsonError}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedJson ? 'Tersalin!' : 'Salin JSON'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowJsonModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                >
                  Terapkan JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
