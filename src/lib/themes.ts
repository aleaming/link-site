export type ThemeMode = 'light' | 'dark'

export interface ThemeTokens {
  bgPrimary: string
  bgSecondary: string
  bgElevated: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  borderPrimary: string
  borderSecondary: string
  accentPrimary: string
  accentSecondary: string
  accentHover: string
}

export interface Palette {
  name: string
  light: ThemeTokens
  dark: ThemeTokens
}

export const THEMES: Record<string, Palette> = {
  electric: {
    name: 'Electric',
    light: {
      bgPrimary: '#d4c5a0', bgSecondary: '#fbf8f0', bgElevated: '#fbf8f0',
      textPrimary: '#262626', textSecondary: '#57554a', textTertiary: '#8b8977',
      borderPrimary: '#e7e5d3', borderSecondary: '#d3d1bd',
      accentPrimary: '#0bf9ff', accentSecondary: '#d3ff1a', accentHover: '#00d9e6',
    },
    dark: {
      bgPrimary: '#262626', bgSecondary: '#3d3b33', bgElevated: '#3d3b33',
      textPrimary: '#fafaf9', textSecondary: '#d3d1bd', textTertiary: '#a8a694',
      borderPrimary: '#57554a', borderSecondary: '#6f6d5c',
      accentPrimary: '#33e5ff', accentSecondary: '#e9ff33', accentHover: '#66ecff',
    },
  },
  sunset: {
    name: 'Sunset',
    light: {
      bgPrimary: '#f5e0d3', bgSecondary: '#fff8f0', bgElevated: '#fff8f0',
      textPrimary: '#3a2a24', textSecondary: '#6b4f43', textTertiary: '#9c8478',
      borderPrimary: '#ecd9c8', borderSecondary: '#ddc2ab',
      accentPrimary: '#e8623d', accentSecondary: '#f2a640', accentHover: '#d1502c',
    },
    dark: {
      bgPrimary: '#2b1f2e', bgSecondary: '#3c2c3f', bgElevated: '#3c2c3f',
      textPrimary: '#fbeee6', textSecondary: '#d9b8c4', textTertiary: '#a98a97',
      borderPrimary: '#4d3a51', borderSecondary: '#5f4a63',
      accentPrimary: '#ff7a4d', accentSecondary: '#ffb347', accentHover: '#ff9466',
    },
  },
  aurora: {
    name: 'Aurora',
    light: {
      bgPrimary: '#dbeef0', bgSecondary: '#f4fcfd', bgElevated: '#f4fcfd',
      textPrimary: '#16333a', textSecondary: '#3f6169', textTertiary: '#7b9ba1',
      borderPrimary: '#c3e2e5', borderSecondary: '#a9d2d6',
      accentPrimary: '#14b8a6', accentSecondary: '#8b5cf6', accentHover: '#0f9c8c',
    },
    dark: {
      bgPrimary: '#0d1b2a', bgSecondary: '#16283a', bgElevated: '#16283a',
      textPrimary: '#e6f7f8', textSecondary: '#a8c8cc', textTertiary: '#6f8f94',
      borderPrimary: '#223a4d', borderSecondary: '#2c4a60',
      accentPrimary: '#2dd4bf', accentSecondary: '#a78bfa', accentHover: '#5eead4',
    },
  },
  mint: {
    name: 'Mint Circuit',
    light: {
      bgPrimary: '#d9f2e3', bgSecondary: '#f2fcf6', bgElevated: '#f2fcf6',
      textPrimary: '#113322', textSecondary: '#3f6b52', textTertiary: '#7a9e8b',
      borderPrimary: '#c0e6d1', borderSecondary: '#a3d6bb',
      accentPrimary: '#10b981', accentSecondary: '#34d399', accentHover: '#059669',
    },
    dark: {
      bgPrimary: '#0b1f16', bgSecondary: '#142e21', bgElevated: '#142e21',
      textPrimary: '#e3f9ee', textSecondary: '#a3d6bb', textTertiary: '#6f9c82',
      borderPrimary: '#1f4531', borderSecondary: '#295a3f',
      accentPrimary: '#34d399', accentSecondary: '#6ee7b7', accentHover: '#6ee7b7',
    },
  },
  coral: {
    name: 'Coral Reef',
    light: {
      bgPrimary: '#fbdad0', bgSecondary: '#fff5f1', bgElevated: '#fff5f1',
      textPrimary: '#3a1f1a', textSecondary: '#6e453c', textTertiary: '#a17d73',
      borderPrimary: '#f0c3b6', borderSecondary: '#e3ab9a',
      accentPrimary: '#f4587a', accentSecondary: '#fb923c', accentHover: '#db3f61',
    },
    dark: {
      bgPrimary: '#0e2626', bgSecondary: '#163636', bgElevated: '#163636',
      textPrimary: '#fbeae4', textSecondary: '#d6a89c', textTertiary: '#9c7a70',
      borderPrimary: '#234848', borderSecondary: '#2d5b5b',
      accentPrimary: '#fb7185', accentSecondary: '#fdba74', accentHover: '#fda4af',
    },
  },
  violet: {
    name: 'Violet Nebula',
    light: {
      bgPrimary: '#e4dbf5', bgSecondary: '#f8f5fd', bgElevated: '#f8f5fd',
      textPrimary: '#2a1d3a', textSecondary: '#5a4770', textTertiary: '#9284a6',
      borderPrimary: '#d3c4ea', borderSecondary: '#bfa8dc',
      accentPrimary: '#9333ea', accentSecondary: '#d946ef', accentHover: '#7e22ce',
    },
    dark: {
      bgPrimary: '#160f26', bgSecondary: '#241a38', bgElevated: '#241a38',
      textPrimary: '#f1eaf9', textSecondary: '#c3aedb', textTertiary: '#8d76a6',
      borderPrimary: '#33244a', borderSecondary: '#40305c',
      accentPrimary: '#c084fc', accentSecondary: '#f0abfc', accentHover: '#d8b4fe',
    },
  },
  solar: {
    name: 'Solar Flare',
    light: {
      bgPrimary: '#f5e6c8', bgSecondary: '#fffaf0', bgElevated: '#fffaf0',
      textPrimary: '#3a2a10', textSecondary: '#6b4f23', textTertiary: '#a1875c',
      borderPrimary: '#ecd9a8', borderSecondary: '#ddc27e',
      accentPrimary: '#f59e0b', accentSecondary: '#dc2626', accentHover: '#d97706',
    },
    dark: {
      bgPrimary: '#241a0f', bgSecondary: '#362718', bgElevated: '#362718',
      textPrimary: '#fdf3e0', textSecondary: '#d6b98a', textTertiary: '#9c8560',
      borderPrimary: '#4a381f', borderSecondary: '#5e4827',
      accentPrimary: '#fbbf24', accentSecondary: '#f87171', accentHover: '#fcd34d',
    },
  },
  arctic: {
    name: 'Arctic',
    light: {
      bgPrimary: '#dbe9f7', bgSecondary: '#f3f9fe', bgElevated: '#f3f9fe',
      textPrimary: '#10233a', textSecondary: '#3d5a75', textTertiary: '#7f9cb3',
      borderPrimary: '#c2ddf0', borderSecondary: '#a6cbe6',
      accentPrimary: '#2563eb', accentSecondary: '#06b6d4', accentHover: '#1d4ed8',
    },
    dark: {
      bgPrimary: '#0a1929', bgSecondary: '#142d47', bgElevated: '#142d47',
      textPrimary: '#e6f1fb', textSecondary: '#a8c7e0', textTertiary: '#6f92ad',
      borderPrimary: '#1e3a5c', borderSecondary: '#275075',
      accentPrimary: '#60a5fa', accentSecondary: '#22d3ee', accentHover: '#93c5fd',
    },
  },
}

export const PALETTE_KEYS = Object.keys(THEMES)

const TOKEN_TO_VAR: Record<keyof ThemeTokens, string> = {
  bgPrimary: '--bg-primary',
  bgSecondary: '--bg-secondary',
  bgElevated: '--bg-elevated',
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  textTertiary: '--text-tertiary',
  borderPrimary: '--border-primary',
  borderSecondary: '--border-secondary',
  accentPrimary: '--accent-primary',
  accentSecondary: '--accent-secondary',
  accentHover: '--accent-hover',
}

export function applyTheme(paletteKey: string, mode: ThemeMode) {
  const palette = THEMES[paletteKey] ?? THEMES.electric
  const tokens = palette[mode]
  const root = document.documentElement
  for (const key of Object.keys(TOKEN_TO_VAR) as (keyof ThemeTokens)[]) {
    root.style.setProperty(TOKEN_TO_VAR[key], tokens[key])
  }
  root.dataset.palette = paletteKey
  root.setAttribute('data-theme', mode)
  root.classList.toggle('dark', mode === 'dark')
}

export interface StoredTheme {
  palette: string
  mode: ThemeMode
}

const STORAGE_KEY = 'theme-state'
const DEFAULT_THEME: StoredTheme = { palette: 'electric', mode: 'dark' }

export function getStoredTheme(): StoredTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (
        parsed &&
        typeof parsed.palette === 'string' &&
        parsed.palette in THEMES &&
        (parsed.mode === 'light' || parsed.mode === 'dark')
      ) {
        return { palette: parsed.palette, mode: parsed.mode }
      }
    }
  } catch {
    // localStorage unavailable (private browsing) or corrupt value — use default
  }
  return DEFAULT_THEME
}

export function persistTheme(state: StoredTheme) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable — theme still applies for this session
  }
}

export function randomPaletteKey(excludeKey: string): string {
  const candidates = PALETTE_KEYS.filter((key) => key !== excludeKey)
  return candidates[Math.floor(Math.random() * candidates.length)]
}
