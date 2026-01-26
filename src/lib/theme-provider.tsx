'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const THEME_KEY = 'flux-theme'
const DEFAULT_THEME: Theme = 'dark'

interface ThemeContextType {
  theme: Theme | undefined
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  resolvedTheme: Theme
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | null>(null)

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
  // Use undefined for initial state to avoid hydration mismatch between server and client.
  // The actual value will be picked up from localStorage in the useEffect after mount.
  const [theme, setThemeState] = useState<Theme | undefined>(undefined)

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    const initialTheme = stored || DEFAULT_THEME
    setThemeState(initialTheme)

    // Sync the document classes and color-scheme to ensure consistency
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(initialTheme)
    root.style.colorScheme = initialTheme
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(THEME_KEY, newTheme)
    setThemeState(newTheme)

    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(newTheme)
    root.style.colorScheme = newTheme
  }, [])

  const toggleTheme = useCallback(() => {
    // Determine current theme even if state is not yet initialized
    const current =
      theme ||
      (typeof window !== 'undefined'
        ? (localStorage.getItem(THEME_KEY) as Theme)
        : DEFAULT_THEME) ||
      DEFAULT_THEME
    const next = current === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }, [theme, setTheme])

  // fallback to DEFAULT_THEME when theme is undefined (during hydration)
  const resolvedTheme = theme || DEFAULT_THEME
  const isDark = resolvedTheme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, resolvedTheme, isDark }}>
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
