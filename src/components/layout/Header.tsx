'use client'

import { Settings, Globe } from 'lucide-react'
import Link from 'next/link'
import { useSettingsStore } from '@/stores/useSettingsStore'
import type { Locale } from '@/lib/i18n/config'

interface HeaderProps {
  dictionary: {
    common: {
      appName: string
      settings: string
    }
  }
}

export function Header({ dictionary }: HeaderProps) {
  const { locale, setLocale } = useSettingsStore()

  const toggleLocale = () => {
    setLocale(locale === 'zh' ? 'en' : 'zh')
  }

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF5722] text-white shadow-lg">
            <span className="text-xl font-bold">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              {dictionary.common.appName}
            </h1>
            <p className="text-xs text-neutral-600">
              {locale === 'zh' ? '你的创业团队' : 'Your Startup Team'}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-white/60"
          >
            <Globe className="h-4 w-4" />
            <span>{locale === 'zh' ? 'EN' : '中'}</span>
          </button>

          <Link
            href="/settings"
            className="flex items-center gap-1.5 rounded-xl bg-white/60 px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-white/80"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{dictionary.common.settings}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
