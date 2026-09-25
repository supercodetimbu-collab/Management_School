import React, { useState } from 'react';
import { useTheme, THEME_PRESETS } from '../../context/ThemeContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';
import {
  ThemePresetId,
  CardRadiusType,
  CardBorderStyle,
  CardShadowType,
  CardBgType,
  BackgroundStyleType,
  SidebarStyleType,
  HeaderStyleType,
  UiDensityType,
} from '../../types';

export const ThemeCustomizerModule: React.FC = () => {
  const {
    themeConfig,
    updateThemeConfig,
    applyPreset,
    resetTheme,
    saveTheme,
    isDirty,
    exportThemeJSON,
    importThemeJSON,
    activePresetInfo,
  } = useTheme();

  const { schoolProfile, updateSchoolProfile, logAction } = useSiakadData();
  const { currentUser, currentRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'cards' | 'background' | 'navigation' | 'density'>('presets');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedJson, setCopiedJson] = useState(false);

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

  const handleSave = () => {
    saveTheme();
    // Also sync primary theme color to SchoolProfile
    updateSchoolProfile({
      themeColor: themeConfig.primaryColor,
      themeConfig: themeConfig,
    });
    if (currentUser) {
      logAction('UPDATE_THEME', 'Tema & Tampilan', `Kustomisasi tema diperbarui: preset ${themeConfig.preset}, warna ${themeConfig.primaryColor}`, currentUser);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-10 pointer-events-none blur-2xl"
          style={{ backgroundColor: themeConfig.primaryColor }}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md transition-colors"
              style={{ backgroundColor: themeConfig.primaryColor }}
            >
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                  Kustomisasi Tema, Warna & Tampilan
                </h1>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-2xs"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                >
                  {themeConfig.preset === 'custom' ? 'Kustom Manual' : activePresetInfo?.name || themeConfig.preset}
                </span>
                {isDirty && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                    Belum Disimpan
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Sesuaikan seluruh tampilan aplikasi SIAKAD: palet warna institusi, kelengkungan kartu, bayangan, model latar, dan bilah navigasi secara langsung.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
            <button
              onClick={() => {
                setJsonInput(exportThemeJSON());
                setShowJsonModal(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5"
              title="Ekspor atau Impor konfigurasi tema JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON Tema</span>
            </button>

            <button
              onClick={resetTheme}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition flex items-center gap-1.5"
              title="Reset ke tema bawaan SIAKAD"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Bawaan</span>
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition flex items-center gap-2 transform active:scale-95"
              style={{ backgroundColor: themeConfig.primaryColor }}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Unsaved Feedback Banner */}
        {isDirty && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Perubahan visual aktif pada sesi ini. Klik <strong>Simpan Perubahan</strong> untuk menetapkannya sebagai tema permanen sekolah.</span>
            </div>
            <button
              onClick={handleSave}
              className="font-bold underline hover:text-amber-900 shrink-0 ml-2"
            >
              Simpan Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left Controls (Tabs) & Right Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customization Controls (7 Columns) */}
        <div className="lg:col-span-7 space-y-5">
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
              <span>Bilah & Header</span>
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

        {/* Right Column: Live Simulator & Interactive Preview (5 Columns - Sticky) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-800">Pratinjau Langsung (Live Preview)</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    previewDevice === 'desktop' ? 'bg-white shadow-2xs text-slate-800' : 'text-slate-500'
                  }`}
                  title="Pratinjau Layar Desktop"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    previewDevice === 'mobile' ? 'bg-white shadow-2xs text-slate-800' : 'text-slate-500'
                  }`}
                  title="Pratinjau Layar HP / Mobile"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Canvas Box */}
            <div
              className={`p-4 border border-slate-200 transition-all duration-300 overflow-hidden ${
                previewDevice === 'mobile' ? 'max-w-[340px] mx-auto rounded-[36px] shadow-lg ring-4 ring-slate-800/10' : 'w-full rounded-2xl'
              }`}
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
              <div className="space-y-3.5">
                {/* Simulated Header */}
                <div
                  className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs transition"
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
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                      <School className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold truncate">SIAKAD SEKOLAH</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full animate-ping"
                      style={{ backgroundColor: themeConfig.accentColor }}
                    />
                    <span className="text-[10px] font-semibold text-slate-500">Live</span>
                  </div>
                </div>

                {/* Simulated Identity Card with Custom Theme */}
                <div className="theme-card p-4 space-y-3 transition">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{schoolProfile.name}</h4>
                      <p className="text-[10px] text-slate-500">NPSN: {schoolProfile.npsn} • Akreditasi {schoolProfile.accreditation}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                      Aktif
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Tahun Ajaran Aktif</span>
                    <span className="font-semibold text-slate-800">2024/2025 Genap</span>
                  </div>
                </div>

                {/* Mini Stat Metric Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="theme-card p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">Total Siswa</span>
                      <Users className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />
                    </div>
                    <p className="text-base font-extrabold text-slate-800">1,248</p>
                    <span className="text-[9px] text-emerald-600 font-semibold">↑ 100% Aktif</span>
                  </div>

                  <div className="theme-card p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">Kehadiran</span>
                      <Award className="w-3.5 h-3.5" style={{ color: themeConfig.accentColor }} />
                    </div>
                    <p className="text-base font-extrabold text-slate-800">98.4%</p>
                    <span className="text-[9px] text-slate-500">Presensi Hari Ini</span>
                  </div>
                </div>

                {/* Simulated Interactive Elements: Buttons & Badges */}
                <div className="theme-card p-3.5 space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contoh Tombol & Kontrol</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                      Tombol Utama
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Sekunder
                    </button>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold border"
                      style={{
                        borderColor: `${themeConfig.primaryColor}55`,
                        backgroundColor: `${themeConfig.primaryColor}15`,
                        color: themeConfig.primaryColor,
                      }}
                    >
                      Badge Aksen
                    </span>
                  </div>

                  {/* Simulated Input */}
                  <div className="relative mt-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      disabled
                      placeholder="Cari siswa atau modul..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary of Current Active Styles */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Preset Aktif:</span>
                <span className="font-bold text-slate-800">{activePresetInfo?.name || 'Kustom Manual'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Radius Kartu:</span>
                <span className="font-mono font-semibold text-slate-800">{themeConfig.cardRadius}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Bayangan (Shadow):</span>
                <span className="font-mono font-semibold text-slate-800">{themeConfig.cardShadow}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Warna Utama:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: themeConfig.primaryColor }} />
                  <span className="font-mono font-semibold text-slate-800">{themeConfig.primaryColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
