import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ThemeConfig,
  ThemePresetId,
  CardRadiusType,
  CardBorderStyle,
  CardShadowType,
  CardBgType,
  BackgroundStyleType,
  SidebarStyleType,
  HeaderStyleType,
  UiDensityType,
} from '../types';
import { subscribeToThemeConfig, saveThemeConfigToFirebase } from '../lib/firebase';

export interface ThemePresetOption {
  id: ThemePresetId;
  name: string;
  badge: string;
  description: string;
  config: ThemeConfig;
}

export const THEME_PRESETS: ThemePresetOption[] = [
  {
    id: 'emerald',
    name: 'Zamrud Pendidikan',
    badge: 'Bawaan SIAKAD',
    description: 'Nuansa hijau zamrud toska profesional khas sistem akademik nasional.',
    config: {
      preset: 'emerald',
      primaryColor: '#0f766e',
      accentColor: '#10b981',
      cardRadius: 'lg',
      cardBorderStyle: 'subtle',
      cardShadow: 'sm',
      cardBg: 'pure-white',
      backgroundStyle: 'neutral-slate',
      sidebarStyle: 'white-clean',
      headerStyle: 'glass-blur',
      uiDensity: 'comfortable',
      enableCardHeaderStripe: false,
    },
  },
  {
    id: 'sapphire',
    name: 'Safir Kerajaan (Royal Blue)',
    badge: 'Formal & Wibawa',
    description: 'Biru royal megah dipadukan dengan sidebar gelap yang presisi.',
    config: {
      preset: 'sapphire',
      primaryColor: '#1d4ed8',
      accentColor: '#0284c7',
      cardRadius: 'lg',
      cardBorderStyle: 'subtle',
      cardShadow: 'md',
      cardBg: 'pure-white',
      backgroundStyle: 'cool-gray',
      sidebarStyle: 'dark-navy',
      headerStyle: 'white-clean',
      uiDensity: 'comfortable',
      enableCardHeaderStripe: true,
    },
  },
  {
    id: 'ocean',
    name: 'Samudra Tropis (Cyan & Teal)',
    badge: 'Modern Glassmorphic',
    description: 'Efek kaca buram (glassmorphism) dengan pendaran cahaya samudra modern.',
    config: {
      preset: 'ocean',
      primaryColor: '#0284c7',
      accentColor: '#14b8a6',
      cardRadius: 'xl',
      cardBorderStyle: 'tinted',
      cardShadow: 'glow',
      cardBg: 'frosted-glass',
      backgroundStyle: 'subtle-mesh',
      sidebarStyle: 'frosted-glass',
      headerStyle: 'glass-blur',
      uiDensity: 'comfortable',
      enableCardHeaderStripe: true,
    },
  },
  {
    id: 'violet',
    name: 'Violet Prestisius',
    badge: 'Elegan & Inovatif',
    description: 'Ungu bangsawan berpadu fuchsia berenergi tinggi untuk sekolah unggulan.',
    config: {
      preset: 'violet',
      primaryColor: '#7c3aed',
      accentColor: '#ec4899',
      cardRadius: 'xl',
      cardBorderStyle: 'subtle',
      cardShadow: 'md',
      cardBg: 'pure-white',
      backgroundStyle: 'subtle-mesh',
      sidebarStyle: 'primary-gradient',
      headerStyle: 'primary-tint',
      uiDensity: 'comfortable',
      enableCardHeaderStripe: false,
    },
  },
  {
    id: 'amber',
    name: 'Mentari Senja (Warm Amber)',
    badge: 'Hangat & Ramah',
    description: 'Latar kertas krem lembut dengan aksen amber emas yang menenangkan mata.',
    config: {
      preset: 'amber',
      primaryColor: '#d97706',
      accentColor: '#ea580c',
      cardRadius: 'md',
      cardBorderStyle: 'subtle',
      cardShadow: 'sm',
      cardBg: 'off-white',
      backgroundStyle: 'warm-cream',
      sidebarStyle: 'white-clean',
      headerStyle: 'white-clean',
      uiDensity: 'comfortable',
      enableCardHeaderStripe: false,
    },
  },
  {
    id: 'ruby',
    name: 'Merah Delima (Crimson Ruby)',
    badge: 'Tegas & Berani',
    description: 'Aksen merah garnet premium dengan kontras sidebar malam yang solid.',
    config: {
      preset: 'ruby',
      primaryColor: '#be123c',
      accentColor: '#f43f5e',
      cardRadius: 'lg',
      cardBorderStyle: 'subtle',
      cardShadow: 'md',
      cardBg: 'pure-white',
      backgroundStyle: 'neutral-slate',
      sidebarStyle: 'dark-navy',
      headerStyle: 'white-clean',
      uiDensity: 'comfortable',
      enableCardHeaderStripe: true,
    },
  },
  {
    id: 'slate',
    name: 'Nordic Minimalis (Clean Grid)',
    badge: 'Kompak & Tajam',
    description: 'Kerapatan data tinggi, sudut tegas geometris dengan latar pola grid mikro.',
    config: {
      preset: 'slate',
      primaryColor: '#334155',
      accentColor: '#64748b',
      cardRadius: 'sm',
      cardBorderStyle: 'prominent',
      cardShadow: 'none',
      cardBg: 'pure-white',
      backgroundStyle: 'micro-grid',
      sidebarStyle: 'white-clean',
      headerStyle: 'white-clean',
      uiDensity: 'compact',
      enableCardHeaderStripe: false,
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Obsidian (Dark Glow)',
    badge: 'Dark Mode Mewah',
    description: 'Nuansa gelap obsidian dengan pendaran neon cerah untuk kenyamanan malam.',
    config: {
      preset: 'midnight',
      primaryColor: '#38bdf8',
      accentColor: '#818cf8',
      cardRadius: 'xl',
      cardBorderStyle: 'tinted',
      cardShadow: 'glow',
      cardBg: 'dark-slate',
      backgroundStyle: 'midnight-dark',
      sidebarStyle: 'dark-navy',
      headerStyle: 'dark-slate',
      uiDensity: 'comfortable',
      enableCardHeaderStripe: true,
    },
  },
];

export const DEFAULT_THEME_CONFIG: ThemeConfig = THEME_PRESETS[0].config;

const STORAGE_THEME_KEY = 'siakad_custom_theme_v2';

interface ThemeContextType {
  themeConfig: ThemeConfig;
  updateThemeConfig: (partial: Partial<ThemeConfig>) => void;
  applyPreset: (presetId: ThemePresetId) => void;
  resetTheme: (author?: { id?: string; name?: string; role?: string }) => Promise<void>;
  saveTheme: (author?: { id?: string; name?: string; role?: string }) => Promise<void>;
  isDirty: boolean;
  isCloudSynced: boolean;
  isSavingToCloud: boolean;
  lastSyncedAt: string | null;
  exportThemeJSON: () => string;
  importThemeJSON: (jsonStr: string) => boolean;
  activePresetInfo: ThemePresetOption | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper hex to rgb
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeConfig, setThemeConfigState] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved) {
        return { ...DEFAULT_THEME_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load theme config from localStorage', e);
    }
    return DEFAULT_THEME_CONFIG;
  });

  const [savedConfig, setSavedConfig] = useState<ThemeConfig>(themeConfig);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const isDirty = JSON.stringify(themeConfig) !== JSON.stringify(savedConfig);

  // Synchronize with remote Firestore theme_settings in real-time across ALL accounts
  useEffect(() => {
    const unsubTheme = subscribeToThemeConfig((remoteConfig) => {
      if (remoteConfig && remoteConfig.primaryColor) {
        console.log('[ThemeContext] Real-time theme received from cloud Firestore:', remoteConfig.preset, remoteConfig.primaryColor);
        setThemeConfigState(remoteConfig);
        setSavedConfig(remoteConfig);
        setIsCloudSynced(true);
        setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
        try {
          localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(remoteConfig));
        } catch {
          // ignore
        }
      }
    });

    // Cross-tab and window event listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_THEME_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setThemeConfigState(parsed);
          setSavedConfig(parsed);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleCustomSync = (e: any) => {
      if (e.detail?.config) {
        setThemeConfigState(e.detail.config);
        setSavedConfig(e.detail.config);
      }
    };
    window.addEventListener('siakad_theme_changed', handleCustomSync);

    return () => {
      if (typeof unsubTheme === 'function') unsubTheme();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('siakad_theme_changed', handleCustomSync);
    };
  }, []);

  const updateThemeConfig = useCallback((partial: Partial<ThemeConfig>) => {
    setThemeConfigState((prev) => {
      const updated = { ...prev, ...partial };
      if (!partial.preset) {
        updated.preset = 'custom';
      }
      return updated;
    });
  }, []);

  const applyPreset = useCallback((presetId: ThemePresetId) => {
    const found = THEME_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setThemeConfigState({ ...found.config });
    }
  }, []);

  const resetTheme = useCallback(async (author?: { id?: string; name?: string; role?: string }) => {
    setThemeConfigState(DEFAULT_THEME_CONFIG);
    setSavedConfig(DEFAULT_THEME_CONFIG);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(DEFAULT_THEME_CONFIG));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('siakad_theme_changed', { detail: { config: DEFAULT_THEME_CONFIG } })
        );
      }
      await saveThemeConfigToFirebase(DEFAULT_THEME_CONFIG, author);
      setIsCloudSynced(true);
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
    } catch (e) {
      console.error('Failed to reset theme to cloud', e);
    }
  }, []);

  const saveTheme = useCallback(async (author?: { id?: string; name?: string; role?: string }) => {
    setIsSavingToCloud(true);
    try {
      // 1. Save locally for instant offline cache
      localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(themeConfig));
      setSavedConfig(themeConfig);

      // 2. Dispatch cross-context event in current window
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('siakad_theme_changed', { detail: { config: themeConfig } })
        );
      }

      // 3. Save to Firebase Firestore to synchronize across ALL roles & devices
      await saveThemeConfigToFirebase(themeConfig, author);
      setIsCloudSynced(true);
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
    } catch (e) {
      console.error('Failed to save theme to cloud Firestore', e);
    } finally {
      setIsSavingToCloud(false);
    }
  }, [themeConfig]);

  const exportThemeJSON = useCallback(() => {
    return JSON.stringify(themeConfig, null, 2);
  }, [themeConfig]);

  const importThemeJSON = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr) as ThemeConfig;
      if (parsed && parsed.primaryColor && parsed.cardRadius) {
        setThemeConfigState({ ...DEFAULT_THEME_CONFIG, ...parsed });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Dynamically inject CSS variables & rules into document
  useEffect(() => {
    const primaryRgb = hexToRgb(themeConfig.primaryColor || '#0f766e');
    const accentRgb = hexToRgb(themeConfig.accentColor || '#10b981');

    // Radius mapping
    const radiusMap: Record<CardRadiusType, string> = {
      none: '0px',
      sm: '6px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      full: '32px',
    };

    // Shadow mapping
    const shadowMap: Record<CardShadowType, string> = {
      none: 'none',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      lg: '0 10px 18px -3px rgb(0 0 0 / 0.12), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
      glow: `0 10px 25px -4px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.28)`,
    };

    // Card border mapping
    let cardBorderCss = 'border: 1px solid #e2e8f0;';
    if (themeConfig.cardBorderStyle === 'none') {
      cardBorderCss = 'border: 0px solid transparent;';
    } else if (themeConfig.cardBorderStyle === 'tinted') {
      cardBorderCss = `border: 1px solid rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25);`;
    } else if (themeConfig.cardBorderStyle === 'prominent') {
      cardBorderCss = 'border: 2px solid #cbd5e1;';
    }

    // Card bg mapping
    let cardBgCss = 'background-color: #ffffff; color: #1e293b;';
    if (themeConfig.cardBg === 'frosted-glass') {
      cardBgCss =
        'background-color: rgba(255, 255, 255, 0.86) !important; backdrop-filter: blur(14px) !important; -webkit-backdrop-filter: blur(14px) !important;';
    } else if (themeConfig.cardBg === 'soft-tint') {
      cardBgCss = `background-color: rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.04) !important;`;
    } else if (themeConfig.cardBg === 'off-white') {
      cardBgCss = 'background-color: #f8fafc !important;';
    } else if (themeConfig.cardBg === 'dark-slate') {
      cardBgCss =
        'background-color: #1e293b !important; color: #f8fafc !important; border-color: #334155 !important;';
    }

    // App background style
    let appBgCss = 'background-color: #f8fafc;';
    if (themeConfig.backgroundStyle === 'warm-cream') {
      appBgCss = 'background-color: #faf7f2;';
    } else if (themeConfig.backgroundStyle === 'cool-gray') {
      appBgCss = 'background-color: #f1f5f9;';
    } else if (themeConfig.backgroundStyle === 'subtle-mesh') {
      appBgCss = `
        background-color: #f8fafc;
        background-image: 
          radial-gradient(at 0% 0%, rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.12) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.10) 0px, transparent 50%);
        background-attachment: fixed;
      `;
    } else if (themeConfig.backgroundStyle === 'dot-matrix') {
      appBgCss = `
        background-color: #f8fafc;
        background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
        background-size: 24px 24px;
        background-attachment: fixed;
      `;
    } else if (themeConfig.backgroundStyle === 'micro-grid') {
      appBgCss = `
        background-color: #ffffff;
        background-image: 
          linear-gradient(to right, #f1f5f9 1px, transparent 1px),
          linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
        background-size: 20px 20px;
        background-attachment: fixed;
      `;
    } else if (themeConfig.backgroundStyle === 'midnight-dark') {
      appBgCss = 'background-color: #0f172a; color: #f8fafc;';
    }

    // Sidebar custom styling
    let sidebarCustomCss = '';
    if (themeConfig.sidebarStyle === 'dark-navy') {
      sidebarCustomCss = `
        aside, .sidebar-container {
          background-color: #0f172a !important;
          color: #f8fafc !important;
          border-color: #1e293b !important;
        }
        aside .bg-white {
          background-color: #0f172a !important;
          color: #f8fafc !important;
        }
        aside .border-slate-100, aside .border-slate-200 {
          border-color: #1e293b !important;
        }
        aside .text-slate-800 {
          color: #f8fafc !important;
        }
        aside .text-slate-600, aside .text-slate-500 {
          color: #94a3b8 !important;
        }
      `;
    } else if (themeConfig.sidebarStyle === 'frosted-glass') {
      sidebarCustomCss = `
        aside, .sidebar-container {
          background-color: rgba(255, 255, 255, 0.82) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
        }
        aside .bg-white {
          background-color: transparent !important;
        }
      `;
    } else if (themeConfig.sidebarStyle === 'primary-gradient') {
      sidebarCustomCss = `
        aside, .sidebar-container {
          background: linear-gradient(180deg, ${themeConfig.primaryColor} 0%, #0f172a 100%) !important;
          color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
        aside .bg-white {
          background-color: transparent !important;
        }
        aside .border-slate-100, aside .border-slate-200 {
          border-color: rgba(255, 255, 255, 0.12) !important;
        }
        aside .text-slate-800, aside .text-slate-600, aside .text-slate-500, aside .text-slate-400 {
          color: #f1f5f9 !important;
        }
      `;
    }

    // Header custom styling
    let headerCustomCss = '';
    if (themeConfig.headerStyle === 'primary-tint') {
      headerCustomCss = `
        header {
          background-color: rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.08) !important;
          backdrop-filter: blur(14px) !important;
          -webkit-backdrop-filter: blur(14px) !important;
        }
      `;
    } else if (themeConfig.headerStyle === 'glass-blur') {
      headerCustomCss = `
        header {
          background-color: rgba(255, 255, 255, 0.84) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
        }
      `;
    } else if (themeConfig.headerStyle === 'dark-slate') {
      headerCustomCss = `
        header {
          background-color: #0f172a !important;
          color: #f8fafc !important;
          border-color: #1e293b !important;
        }
        header .text-slate-800 {
          color: #f8fafc !important;
        }
        header .text-slate-500 {
          color: #94a3b8 !important;
        }
        header .bg-slate-100 {
          background-color: #1e293b !important;
          color: #f8fafc !important;
        }
      `;
    }

    // Density mapping
    let densityCss = '';
    if (themeConfig.uiDensity === 'compact') {
      densityCss = `
        main table td, main table th {
          padding-top: 0.35rem !important;
          padding-bottom: 0.35rem !important;
        }
        main .space-y-6 {
          gap: 1rem !important;
        }
        main .space-y-5 {
          gap: 0.75rem !important;
        }
      `;
    }

    const cssContent = `
      :root {
        --theme-primary: ${themeConfig.primaryColor};
        --theme-primary-rgb: ${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b};
        --theme-accent: ${themeConfig.accentColor};
        --theme-accent-rgb: ${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b};
        --theme-card-radius: ${radiusMap[themeConfig.cardRadius]};
        --theme-card-shadow: ${shadowMap[themeConfig.cardShadow]};
      }

      /* Global App Background */
      body, #root, #app-root-container {
        ${appBgCss}
      }

      /* Dynamic Hero/Greeting Banners across ALL roles (Admin, Guru, Siswa, Ortu, Kepsek) */
      main .rounded-3xl[class*="from-"],
      .theme-hero-banner {
        background: linear-gradient(135deg, ${themeConfig.primaryColor} 0%, ${themeConfig.accentColor} 100%) !important;
        border-radius: var(--theme-card-radius) !important;
        box-shadow: var(--theme-card-shadow) !important;
      }

      /* Dynamically Adapt Core Cards across all modules and dashboards */
      .theme-card,
      main .bg-white.rounded-2xl,
      main .bg-white.rounded-3xl,
      main .bg-white.rounded-xl {
        border-radius: var(--theme-card-radius) !important;
        box-shadow: var(--theme-card-shadow) !important;
        ${cardBgCss}
        ${cardBorderCss}
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Card Header Accent Stripe */
      ${
        themeConfig.enableCardHeaderStripe
          ? `
        .theme-card,
        main .bg-white.rounded-2xl,
        main .bg-white.rounded-3xl,
        main .bg-white.rounded-xl {
          position: relative;
          overflow: hidden;
        }
        .theme-card::before,
        main .bg-white.rounded-2xl::before,
        main .bg-white.rounded-3xl::before,
        main .bg-white.rounded-xl::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, ${themeConfig.primaryColor}, ${themeConfig.accentColor});
          z-index: 10;
        }
      `
          : ''
      }

      /* Primary Theme Buttons & Active States */
      .bg-teal-600,
      .bg-teal-700,
      .bg-teal-800,
      button.bg-teal-600,
      button.bg-teal-700,
      button.bg-teal-800,
      .theme-bg-primary {
        background-color: ${themeConfig.primaryColor} !important;
      }

      .hover\\:bg-teal-700:hover,
      .hover\\:bg-teal-800:hover,
      button.hover\\:bg-teal-700:hover,
      button.hover\\:bg-teal-800:hover,
      .theme-bg-primary-hover:hover {
        filter: brightness(0.92);
      }

      .text-teal-600,
      .text-teal-700,
      .text-teal-800,
      .theme-text-primary {
        color: ${themeConfig.primaryColor} !important;
      }

      .border-teal-400,
      .border-teal-500,
      .border-teal-600,
      .border-teal-700,
      .border-teal-800,
      .theme-border-primary {
        border-color: ${themeConfig.primaryColor} !important;
      }

      .bg-teal-50,
      .bg-teal-100 {
        background-color: rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1) !important;
      }

      .border-teal-100,
      .border-teal-200,
      .border-teal-300 {
        border-color: rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25) !important;
      }

      /* Active Sidebar navigation items */
      aside button.bg-teal-600,
      aside button.bg-teal-700 {
        background-color: ${themeConfig.primaryColor} !important;
      }

      /* Navigation Drawer & Mobile items */
      nav.fixed.bottom-0 button.text-teal-600 {
        color: ${themeConfig.primaryColor} !important;
      }

      ${sidebarCustomCss}
      ${headerCustomCss}
      ${densityCss}

      ::selection {
        background-color: ${themeConfig.primaryColor};
        color: #ffffff;
      }
    `;

    let styleTag = document.getElementById('siakad-dynamic-theme') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'siakad-dynamic-theme';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = cssContent;
  }, [themeConfig]);

  const activePresetInfo = THEME_PRESETS.find((p) => p.id === themeConfig.preset);

  return (
    <ThemeContext.Provider
      value={{
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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
