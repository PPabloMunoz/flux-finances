'use client'

import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const THEME_KEY = 'flux-theme'
const DEFAULT_THEME: Theme = 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored) setTheme(stored)
  }, [])

  const resolvedTheme = mounted ? theme : DEFAULT_THEME

  const setThemeWithStorage = (newTheme: Theme) => {
    localStorage.setItem(THEME_KEY, newTheme)
    setTheme(newTheme)
    console.log(`[THEME] Theme changed to ${newTheme} (stored in localStorage)`)
  }

  const toggleTheme = () => {
    setThemeWithStorage(theme === 'dark' ? 'light' : 'dark')
  }

  return {
    theme,
    setTheme: setThemeWithStorage,
    toggleTheme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
  }
}
