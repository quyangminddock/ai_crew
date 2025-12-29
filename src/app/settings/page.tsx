'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ApiKeyForm } from '@/components/settings/ApiKeyForm'
import { ModelSelector } from '@/components/settings/ModelSelector'
import { StorageManager } from '@/components/settings/StorageManager'
import { useSettingsStore } from '@/stores/useSettingsStore'
import type { Locale } from '@/lib/i18n/config'

import zhDict from '@/lib/i18n/dictionaries/zh.json'
import enDict from '@/lib/i18n/dictionaries/en.json'

const dictionaries = { zh: zhDict, en: enDict }

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const { locale, setLocale } = useSettingsStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const dictionary = dictionaries[locale as Locale] || dictionaries.zh

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-[var(--foreground-secondary)] transition-all hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold text-sm">{dictionary.common.back}</span>
          </Link>
          <div className="h-4 w-px bg-[var(--border)]" />
          <h1 className="text-base font-bold text-[var(--foreground)] tracking-tight">
            {dictionary.settings.title}
          </h1>
        </div>
      </header>

      {/* Content - Scrollable area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main settings area */}
            <div className="lg:col-span-8 space-y-12">
              {/* API Keys */}
              <section className="animate-in-bottom">
                <ApiKeyForm dictionary={dictionary} />
              </section>

              {/* Storage Management */}
              <section className="animate-in-bottom" style={{ animationDelay: '100ms' }}>
                <StorageManager locale={locale as Locale} />
              </section>
            </div>

            {/* Sidebar Area (Model, Language) */}
            <div className="lg:col-span-4 space-y-12">
              {/* Model Selection */}
              <section className="animate-in-bottom" style={{ animationDelay: '150ms' }}>
                <ModelSelector dictionary={dictionary} />
              </section>

              {/* Language Selection */}
              <section className="animate-in-bottom" style={{ animationDelay: '200ms' }}>
                <div className="card p-8 bg-[var(--background-card)] border-[var(--border)]">
                  <h3 className="mb-1 text-xl font-semibold text-[var(--foreground)]">
                    {dictionary.settings.language}
                  </h3>
                  <p className="mb-6 text-sm text-[var(--foreground-secondary)]">
                    {locale === 'zh' ? '选择界面语言' : 'Choose interface language'}
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setLocale('zh')}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 font-bold transition-all active:scale-95",
                        locale === 'zh'
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--foreground-secondary)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
                      )}
                    >
                      <span>🇨🇳</span>
                      <span>中文</span>
                    </button>
                    <button
                      onClick={() => setLocale('en')}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 font-bold transition-all active:scale-95",
                        locale === 'en'
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--foreground-secondary)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
                      )}
                    >
                      <span>🇺🇸</span>
                      <span>English</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
