'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored) {
      setThemeState(stored)
    }
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(THEME_KEY, newTheme)
    setThemeState(newTheme)
    console.log(`[THEME] Theme changed to ${newTheme} (stored in localStorage)`)

    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }, [theme, setTheme])

  useEffect(() => {
    if (mounted) {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null
      if (stored) {
        document.documentElement.classList.remove('dark', 'light')
        document.documentElement.classList.add(stored)
      } else {
        document.documentElement.classList.add(DEFAULT_THEME)
      }
    }
  }, [mounted])

  const resolvedTheme = mounted ? theme : DEFAULT_THEME
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
