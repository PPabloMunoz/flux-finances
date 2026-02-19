'use client'

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'

type Theme = 'dark' | 'light'

const THEME_KEY = 'flux-theme'
const DEFAULT_THEME: Theme = 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  resolvedTheme: Theme
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    return stored || DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

function subscribe(callback: () => void) {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) {
      callback()
    }
  }
  window.addEventListener('storage', handleStorage)
  return () => window.removeEventListener('storage', handleStorage)
}

/**
 * ThemeScript component to be placed in the <head> of your document.
 * This prevents the "flash of unstyled content" (FOUC) by applying the
 * theme class before the rest of the page renders.
 *
 * IMPORTANT: To avoid hydration mismatches, ensure your <html> tag has
 * the `suppressHydrationWarning` attribute.
 *
 * Usage in __root.tsx:
 * <head>
 *   <ThemeScript />
 *   <HeadContent />
 * </head>
 */
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('${THEME_KEY}') || '${DEFAULT_THEME}';
        var root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        root.style.colorScheme = theme;
      } catch (e) {}
    })();
  `
  // biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for theme management
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    getStoredTheme,
    () => DEFAULT_THEME // Server snapshot
  )

  // Sync DOM after hydration to ensure classes match the theme
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    root.style.colorScheme = theme
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(THEME_KEY, newTheme)

    // Sync the document classes and color-scheme
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(newTheme)
    root.style.colorScheme = newTheme

    // Notify other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: THEME_KEY }))
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }, [theme, setTheme])

  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, resolvedTheme: theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
