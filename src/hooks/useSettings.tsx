'use client'

import { createContext, useContext } from 'react'

const DEFAULT_SITE_NAME = 'يونيفيرا'
const DEFAULT_SITE_NAME_EN = 'UniVera'

type Settings = Record<string, string>

const SettingsContext = createContext<Settings>({})

export function SettingsProvider({ value, children }: { value: Settings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}

export function useSiteName() {
  const s = useContext(SettingsContext)
  return s.site_name || DEFAULT_SITE_NAME
}

export function useSiteNameEn() {
  const s = useContext(SettingsContext)
  return s.site_name_en || DEFAULT_SITE_NAME_EN
}
