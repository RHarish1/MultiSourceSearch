"use client"

import { ThemeName, THEMES } from "@/lib/themes"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import type React from "react"

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="warm-terracotta"
      themes={Object.keys(THEMES)}
      enableSystem={false}
      storageKey="app-theme"
    >
      {children}
    </NextThemesProvider>
  )
}

export function useTheme() {
  const { theme, setTheme } = useNextTheme()
  
  return {
    currentTheme: (theme as ThemeName) || "warm-terracotta",
    setTheme: (newTheme: ThemeName) => setTheme(newTheme)
  }
}
