import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '@/lib/i18n/config'

export type ModelProvider = 'deepseek' | 'claude' | 'openai' | 'gemini' | 'auto'

interface ApiKeys {
  deepseek?: string
  claude?: string
  openai?: string
  gemini?: string
}

interface SettingsState {
  locale: Locale
  model: ModelProvider
  apiKeys: ApiKeys

  setLocale: (locale: Locale) => void
  setModel: (model: ModelProvider) => void
  setApiKey: (provider: keyof ApiKeys, key: string) => void
  getActiveApiKey: () => { provider: ModelProvider; key: string } | null
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      locale: 'zh',
      model: 'auto',
      apiKeys: {},

      setLocale: (locale) => set({ locale }),

      setModel: (model) => set({ model }),

      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),

      getActiveApiKey: () => {
        const { model, apiKeys } = get()

        if (model === 'auto') {
          // 优先使用 DeepSeek，其次 Claude
          if (apiKeys.deepseek) return { provider: 'deepseek', key: apiKeys.deepseek }
          if (apiKeys.claude) return { provider: 'claude', key: apiKeys.claude }
          if (apiKeys.openai) return { provider: 'openai', key: apiKeys.openai }
          if (apiKeys.gemini) return { provider: 'gemini', key: apiKeys.gemini }
          return null
        }

        const key = apiKeys[model as keyof ApiKeys]
        if (key) return { provider: model, key }
        return null
      },
    }),
    {
      name: 'crew-settings',
    }
  )
)
