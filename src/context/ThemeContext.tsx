import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeStyle = 'midnight' | 'amber' | 'daylight' | 'emerald' | 'monochrome';
export type Theme = 'dark' | 'light';
export type ThemeMode = 'dark' | 'light' | 'system' | ThemeStyle;
export type UiDensity = 'compact' | 'standard' | 'comfortable';
export type MapStylePreference = 'tactical-dark' | 'satellite' | 'terrain' | 'amber-night' | 'monochrome';

export interface ThemeOption {
  id: ThemeStyle;
  name: string;
  nameAf: string;
  description: string;
  descriptionAf: string;
  category: 'dark' | 'light';
  previewColors: {
    bg: string;
    card: string;
    accent: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
  };
  recommendedFor: string;
  recommendedForAf: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'daylight',
    name: 'Daylight Clear (Default)',
    nameAf: 'Heldere Daglig (Verstek)',
    description: 'High-contrast light interface optimized for direct sunlight and administrative reporting.',
    descriptionAf: 'Hoë-kontras ligte koppelvlak geoptimaliseer vir direkte sonlig en administratiewe verslae.',
    category: 'light',
    previewColors: {
      bg: '#f1f5f9',
      card: '#ffffff',
      accent: '#059669',
      border: '#cbd5e1',
      text: '#0f172a',
      badgeBg: '#dcfce7',
      badgeText: '#15803d',
    },
    recommendedFor: 'Outdoor Day Patrols, Daylight Vehicles & Executive Office Work',
    recommendedForAf: 'Buitelig Dagpatrollies, Dagvoertuie & Bestuurskantoor',
  },
  {
    id: 'midnight',
    name: 'Midnight Tactical',
    nameAf: 'Middernag Takties',
    description: 'Deep navy-slate control room interface with high contrast emergency indicators.',
    descriptionAf: 'Donker vlootblou-leiklip beheerkamer koppelvlak met hoë-kontras noodaanwysers.',
    category: 'dark',
    previewColors: {
      bg: '#0b1120',
      card: '#0f172a',
      accent: '#f59e0b',
      border: '#334155',
      text: '#f8fafc',
      badgeBg: '#064e3b',
      badgeText: '#34d399',
    },
    recommendedFor: '24/7 Control Room, Low-light Operations & Dispatch Desks',
    recommendedForAf: '24/7 Beheerkamer, Laelig Operasies & Versendingstafels',
  },
  {
    id: 'monochrome',
    name: 'Monochrome B&W (Color-Blind Friendly)',
    nameAf: 'Monochroom S&W (Kleurblind Vriendelik)',
    description: 'Pure black-and-white high contrast interface with zero color reliance. Ideal for all forms of color blindness.',
    descriptionAf: 'Suiwer swart-en-wit hoë-kontras koppelvlak sonder enige kleurafhanklikheid. Ideaal vir alle tipes kleurblindheid.',
    category: 'dark',
    previewColors: {
      bg: '#000000',
      card: '#121212',
      accent: '#ffffff',
      border: '#ffffff',
      text: '#ffffff',
      badgeBg: '#ffffff',
      badgeText: '#000000',
    },
    recommendedFor: 'Color-Blind Users (Deuteranopia, Protanopia, Tritanopia, Monochromacy) & High-Contrast Requirements',
    recommendedForAf: 'Kleurblinde Gebruikers (Alle tipes kleurblindheid) & Uiterste Hoë-Kontras Behoeftes',
  },
  {
    id: 'amber',
    name: 'Tactical Amber OLED (Night Patrol)',
    nameAf: 'Taktiese Amber OLED (Nagpatrollie)',
    description: 'Pure black canvas with high-visibility amber optics. Zero blue-light eye strain.',
    descriptionAf: 'Suiwer swart doek met hoë-sigbaarheid amber optika. Nul bloulig ooguitputting.',
    category: 'dark',
    previewColors: {
      bg: '#000000',
      card: '#09090b',
      accent: '#f59e0b',
      border: '#78350f',
      text: '#fef3c7',
      badgeBg: '#451a03',
      badgeText: '#fbbf24',
    },
    recommendedFor: 'Night Farm Patrols, Vehicle Dashboard Mounts & OLED Screens',
    recommendedForAf: 'Nag Plaaspatrollies, Voertuighouers & OLED Skerwe',
  },
  {
    id: 'emerald',
    name: 'Emerald Operations (Forest / Rural)',
    nameAf: 'Smarag Operasies (Veldwag & Natuur)',
    description: 'Military deep forest-green palette suited for game reserves, farm watch & rural ops.',
    descriptionAf: 'Militêre diep veldgroen palet geskik vir wildreservate, plaaswag & landelike operasies.',
    category: 'dark',
    previewColors: {
      bg: '#041610',
      card: '#07241a',
      accent: '#10b981',
      border: '#134e38',
      text: '#ecfdf5',
      badgeBg: '#064e3b',
      badgeText: '#6ee7b7',
    },
    recommendedFor: 'Agricultural Security, Conservation Rangers & Rural Fire Fighting',
    recommendedForAf: 'Landbou Sekuriteit, Veldwagters & Landelike Brandbestryding',
  },
];

interface ThemeContextType {
  theme: Theme;
  themeStyle: ThemeStyle;
  themeMode: ThemeMode;
  uiDensity: UiDensity;
  mapStyle: MapStylePreference;
  setThemeStyle: (style: ThemeStyle) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setUiDensity: (density: UiDensity) => void;
  setMapStyle: (style: MapStylePreference) => void;
  toggleTheme: () => void;
  isDark: boolean;
  activeThemeOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'hbf_theme_style';
const DENSITY_STORAGE_KEY = 'hbf_ui_density';
const MAP_STYLE_STORAGE_KEY = 'hbf_map_style';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial stored theme style preference or default to 'daylight' (Light)
  const [themeStyle, setThemeStyleState] = useState<ThemeStyle>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as string | null;
      if (stored === 'midnight' || stored === 'monochrome' || stored === 'amber' || stored === 'daylight' || stored === 'emerald') {
        return stored;
      }
      if (stored === 'light') return 'daylight';
      if (stored === 'dark') return 'midnight';
      if (stored === 'bw' || stored === 'monochrome') return 'monochrome';
    } catch {
      // Fallback
    }
    return 'daylight';
  });

  const [uiDensity, setUiDensityState] = useState<UiDensity>(() => {
    try {
      const stored = localStorage.getItem(DENSITY_STORAGE_KEY) as UiDensity | null;
      if (stored === 'compact' || stored === 'standard' || stored === 'comfortable') {
        return stored;
      }
    } catch {}
    return 'standard';
  });

  const [mapStyle, setMapStyleState] = useState<MapStylePreference>(() => {
    try {
      const stored = localStorage.getItem(MAP_STYLE_STORAGE_KEY) as MapStylePreference | null;
      if (stored) return stored;
    } catch {}
    return 'tactical-dark';
  });

  const activeThemeOption = THEME_OPTIONS.find((t) => t.id === themeStyle) || THEME_OPTIONS[0];
  const isDark = activeThemeOption.category === 'dark';
  const resolvedTheme: Theme = isDark ? 'dark' : 'light';

  // Compute and apply theme
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Clear existing theme classes
    root.classList.remove('light', 'dark', 'theme-midnight', 'theme-monochrome', 'theme-amber', 'theme-daylight', 'theme-emerald');
    body.classList.remove('light', 'dark', 'theme-midnight', 'theme-monochrome', 'theme-amber', 'theme-daylight', 'theme-emerald');

    // Add new theme classes
    root.classList.add(resolvedTheme, `theme-${themeStyle}`);
    body.classList.add(resolvedTheme, `theme-${themeStyle}`);

    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-theme-style', themeStyle);
    root.setAttribute('data-density', uiDensity);
    root.style.colorScheme = resolvedTheme;

    // Persist preferences
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeStyle);
      localStorage.setItem(DENSITY_STORAGE_KEY, uiDensity);
      localStorage.setItem(MAP_STYLE_STORAGE_KEY, mapStyle);
    } catch {}
  }, [themeStyle, resolvedTheme, uiDensity, mapStyle]);

  const setThemeStyle = (style: ThemeStyle) => {
    setThemeStyleState(style);
  };

  const setThemeMode = (mode: ThemeMode) => {
    if (mode === 'light') {
      setThemeStyleState('daylight');
    } else if (mode === 'dark') {
      setThemeStyleState('midnight');
    } else if (mode === 'system') {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      setThemeStyleState(prefersDark ? 'midnight' : 'daylight');
    } else if (mode === 'midnight' || mode === 'monochrome' || mode === 'amber' || mode === 'daylight' || mode === 'emerald') {
      setThemeStyleState(mode);
    }
  };

  const setUiDensity = (density: UiDensity) => {
    setUiDensityState(density);
  };

  const setMapStyle = (style: MapStylePreference) => {
    setMapStyleState(style);
  };

  const toggleTheme = () => {
    setThemeStyleState((prev) => {
      if (prev === 'daylight') return 'midnight';
      return 'daylight';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themeStyle,
        themeMode: themeStyle,
        uiDensity,
        mapStyle,
        setThemeStyle,
        setThemeMode,
        setUiDensity,
        setMapStyle,
        toggleTheme,
        isDark,
        activeThemeOption,
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
