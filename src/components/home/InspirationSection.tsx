'use client'

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useInspirationStore } from '@/stores/useInspirationStore'
import type { Locale } from '@/lib/i18n/config'

interface InspirationSectionProps {
  locale: Locale
  onHandToProduct?: (inspiration: string) => void
  onLiveSession?: (inspiration: string) => void
}

export function InspirationSection({ locale, onHandToProduct, onLiveSession }: InspirationSectionProps) {
  const { inspirations, translatedInspirations, isLoading, error, fetchInspirations } = useInspirationStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [localInspiration, setLocalInspiration] = useState('')

  // Trigger fetch on mount (store handles caching logic)
  useEffect(() => {
    fetchInspirations(locale)
  }, [locale, fetchInspirations])

  // Update local display based on store data
  useEffect(() => {
    const list = (locale === 'zh' && translatedInspirations.length > 0)
      ? translatedInspirations
      : inspirations

    if (list.length > 0) {
      setLocalInspiration(list[currentIndex % list.length])
    } else if (error) {
      setLocalInspiration(locale === 'zh' ? '获取灵感失败' : 'Failed to load inspiration')
    } else if (!isLoading) {
      setLocalInspiration(locale === 'zh' ? '暂无灵感' : 'No inspiration available')
    }
  }, [inspirations, translatedInspirations, currentIndex, locale, error, isLoading])

  const handleRefresh = () => {
    const list = (locale === 'zh' && translatedInspirations.length > 0) ? translatedInspirations : inspirations
    if (list.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % list.length)
    } else {
      fetchInspirations(locale, true) // Force refresh if empty
    }
  }

  const handlePrev = () => {
    const list = (locale === 'zh' && translatedInspirations.length > 0) ? translatedInspirations : inspirations
    if (list.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + list.length) % list.length)
    }
  }

  const handleHandToProduct = () => {
    if (onHandToProduct && localInspiration) {
      onHandToProduct(localInspiration)
    }
  }

  // Display text helper
  const isTranslating = locale === 'zh' && inspirations.length > 0 && translatedInspirations.length === 0 && isLoading
  const showLoading = isLoading && inspirations.length === 0

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative">
        <div className="card flex flex-col gap-4 p-6 md:flex-row md:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF5722]">
            <Sparkles className="h-6 w-6 text-white" />
          </div>

          <div className="flex-1">
            {showLoading || isTranslating ? (
              <div className="flex items-center gap-2 text-neutral-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-[#FF6B35]" />
                <span className="text-sm">
                  {isTranslating
                    ? (locale === 'zh' ? '翻译中...' : 'Translating...')
                    : (locale === 'zh' ? '获取灵感中...' : 'Loading inspiration...')}
                </span>
              </div>
            ) : (
              <div>
                <p className="text-base leading-relaxed text-neutral-700">
                  {localInspiration}
                </p>
                {/* Offline indicator when using cached data */}
                {error && inspirations.length > 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    {locale === 'zh' ? '⚠️ 无法获取最新灵感，显示历史记录' : '⚠️ Using cached inspiration (offline)'}
                  </p>
                )}
                {/* Always show action buttons when we have an inspiration to work with */}
                {localInspiration && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <button
                      onClick={handleHandToProduct}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#004E89] to-[#003561] px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
                    >
                      {locale === 'zh' ? '交给产品团队分析' : 'Hand to Product Team'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    {onLiveSession && (
                      <button
                        onClick={() => onLiveSession(localInspiration)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#004E89] bg-white px-4 py-2 text-sm font-medium text-[#004E89] transition-all hover:bg-neutral-50"
                      >
                        Live
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              onClick={handlePrev}
              disabled={showLoading || isTranslating || inspirations.length <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-200 text-neutral-600 transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed"
              title={locale === 'zh' ? '上一条' : 'Previous'}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={showLoading || isTranslating || inspirations.length <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-200 text-neutral-600 transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed"
              title={locale === 'zh' ? '下一条' : 'Next'}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!error && inspirations.length > 0 && (
          <p className="mt-2 text-center text-xs text-neutral-400">
            {locale === 'zh'
              ? `💡 每日灵感推荐 (${currentIndex + 1}/${inspirations.length})`
              : `💡 Daily inspiration (${currentIndex + 1}/${inspirations.length})`}
          </p>
        )}
      </div>
    </div>
  )
}
