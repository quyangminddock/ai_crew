import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface InspirationState {
    inspirations: string[]
    translatedInspirations: string[]
    lastFetched: number
    isLoading: boolean
    error: boolean

    fetchInspirations: (locale: string, force?: boolean) => Promise<void>
}

const BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://api.minddock.ai'
    : 'http://localhost:8000'

const API_URL = `${BASE_URL}/api/v1/inspirations/inspirations/latest`
const TRANSLATE_URL = `${BASE_URL}/api/v1/translate`

const CACHE_DURATION = 4 * 60 * 60 * 1000 // 4 hours

const translateText = async (text: string): Promise<string> => {
    try {
        const response = await fetch(TRANSLATE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        })

        if (!response.ok) throw new Error('Translation failed')

        const data = await response.json()
        return data.translated_text || text
    } catch (err) {
        console.error('Translation error:', err)
        return text
    }
}

export const useInspirationStore = create<InspirationState>()(
    persist(
        (set, get) => ({
            inspirations: [],
            translatedInspirations: [],
            lastFetched: 0,
            isLoading: false,
            error: false,

            fetchInspirations: async (locale, force = false) => {
                const { lastFetched, isLoading } = get()
                const now = Date.now()

                // Cache check
                if (!force && lastFetched > 0 && (now - lastFetched < CACHE_DURATION)) {
                    // Check if we need translation for zh but don't have it
                    if (locale === 'zh' && get().translatedInspirations.length === 0 && get().inspirations.length > 0) {
                        // Fall through to fetch/translate logic, or just translate existing?
                        // For simplicity, we fall through to attempt fetch/translation again
                        // But if we have data, we shouldn't block UI.
                        // Actually, let's just proceed to fetch if translation is missing.
                    } else if (get().inspirations.length > 0) {
                        return
                    }
                }

                if (isLoading) return

                set({ isLoading: true, error: false })

                try {
                    const response = await fetch(API_URL)
                    if (!response.ok) throw new Error('Failed to fetch')

                    const data = await response.json()

                    let inspirationList: string[] = []
                    if (Array.isArray(data) && data.length > 0) {
                        inspirationList = data
                            .map((item: any) => item.description)
                            .filter((desc: string) => desc && desc.trim())
                    } else if (data.description) {
                        inspirationList = [data.description]
                    }

                    if (inspirationList.length === 0) {
                        set({ isLoading: false })
                        return
                    }

                    let translated: string[] = []
                    if (locale === 'zh') {
                        translated = await Promise.all(
                            inspirationList.map(text => translateText(text))
                        )
                    }

                    set({
                        inspirations: inspirationList,
                        translatedInspirations: translated,
                        lastFetched: now,
                        isLoading: false
                    })

                } catch (error) {
                    console.error('Failed to fetch inspirations:', error)
                    // Keep existing data if available, just set error flag
                    set({ error: true, isLoading: false })
                }
            },
        }),
        {
            name: 'inspiration-storage',
            partialize: (state) => ({
                inspirations: state.inspirations,
                translatedInspirations: state.translatedInspirations,
                lastFetched: state.lastFetched
            }),
        }
    )
)
