// Centralized assets/URLs (Drive removed; use local public assets)
export const ASSETS = {
  // Primary app logo served from Vite public folder
  logo: '/logo.png',
  alt: 'Edunexs logo',
} as const

export type Assets = typeof ASSETS
