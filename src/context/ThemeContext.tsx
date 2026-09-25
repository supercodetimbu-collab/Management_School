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
  resetTheme: () => void;
  saveTheme: () => void;
  isDirty: boolean;
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

  const isDirty = JSON.stringify(themeConfig) !== JSON.stringify(savedConfig);

  const updateThemeConfig = useCallback((partial: Partial<ThemeConfig>) => {
    setThemeConfigState((prev) => {
      const updated = { ...prev, ...partial };
      if (!partial.preset) {
        // If customizing individual attributes, mark preset as custom if values differ
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

  const resetTheme = useCallback(() => {
    setThemeConfigState(DEFAULT_THEME_CONFIG);
    localStorage.removeItem(STORAGE_THEME_KEY);
    setSavedConfig(DEFAULT_THEME_CONFIG);
  }, []);

  const saveTheme = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(themeConfig));
      setSavedConfig(themeConfig);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
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
        'background-color: rgba(255, 255, 255, 0.84) !important; backdrop-filter: blur(14px) !important; -webkit-backdrop-filter: blur(14px) !important;';
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

      /* Dynamically Adapt Core Cards */
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
      button.bg-teal-600,
      button.bg-teal-700,
      .theme-bg-primary {
        background-color: ${themeConfig.primaryColor} !important;
      }

      .hover\\:bg-teal-700:hover,
      button.hover\\:bg-teal-700:hover,
      .theme-bg-primary-hover:hover {
        filter: brightness(0.92);
      }

      .text-teal-600,
      .text-teal-700,
      .theme-text-primary {
        color: ${themeConfig.primaryColor} !important;
      }

      .border-teal-500,
      .border-teal-600,
      .border-teal-700,
      .theme-border-primary {
        border-color: ${themeConfig.primaryColor} !important;
      }

      .bg-teal-50 {
        background-color: rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.09) !important;
      }

      .border-teal-100,
      .border-teal-200 {
        border-color: rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25) !important;
      }

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
