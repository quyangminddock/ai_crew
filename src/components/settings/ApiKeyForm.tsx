'use client'

import { useState } from 'react'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useSettingsStore, type ModelProvider } from '@/stores/useSettingsStore'
import { cn } from '@/lib/utils'

interface ApiKeyFormProps {
  dictionary: {
    settings: {
      apiKeys: string
      apiKeysDescription: string
      deepseekKey: string
      deepseekHint: string
      claudeKey: string
      claudeHint: string
      openaiKey: string
      openaiHint: string
      geminiKey: string
      geminiHint: string
      keyPlaceholder: string
      keySaved: string
    }
  }
}

export function ApiKeyForm({ dictionary }: ApiKeyFormProps) {
  const { apiKeys, setApiKey, locale } = useSettingsStore()
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const handleSave = (provider: 'deepseek' | 'claude' | 'openai' | 'gemini', value: string) => {
    setApiKey(provider, value)
    setSaved((prev) => ({ ...prev, [provider]: true }))
    setTimeout(() => {
      setSaved((prev) => ({ ...prev, [provider]: false }))
    }, 2000)
  }

  const providers = [
    {
      id: 'deepseek' as const,
      label: dictionary.settings.deepseekKey,
      hint: dictionary.settings.deepseekHint
    },
    {
      id: 'claude' as const,
      label: dictionary.settings.claudeKey,
      hint: dictionary.settings.claudeHint
    },
    {
      id: 'openai' as const,
      label: dictionary.settings.openaiKey,
      hint: dictionary.settings.openaiHint
    },
    {
      id: 'gemini' as const,
      label: dictionary.settings.geminiKey,
      hint: dictionary.settings.geminiHint
    },
  ]

  return (
    <div className="card p-8 bg-[var(--background-card)] border-[var(--border)]">
      <h3 className="mb-1 text-xl font-semibold text-[var(--foreground)]">
        {dictionary.settings.apiKeys}
      </h3>
      <p className="mb-6 text-sm text-[var(--foreground-secondary)]">
        {dictionary.settings.apiKeysDescription}
      </p>

      <div className="space-y-8">
        {providers.map(({ id, label, hint }) => (
          <div key={id}>
            <div className="mb-2 flex items-baseline justify-between">
              <label className="block text-sm font-bold text-[var(--foreground)]">
                {label}
              </label>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type={showKeys[id] ? 'text' : 'password'}
                  value={apiKeys[id] || ''}
                  onChange={(e) => setApiKey(id, e.target.value)}
                  placeholder={dictionary.settings.keyPlaceholder}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 pr-12 text-sm text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
                >
                  {showKeys[id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={() => handleSave(id, apiKeys[id] || '')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all shadow-sm',
                  saved[id]
                    ? 'bg-green-500 text-white'
                    : 'bg-[var(--primary)] text-white hover:opacity-90 active:scale-95'
                )}
              >
                {saved[id] ? (
                  <>
                    <Check className="h-4 w-4" />
                    {dictionary.settings.keySaved}
                  </>
                ) : (
                  locale === 'zh' ? '保存' : 'Save'
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--foreground-muted)] leading-relaxed">
              {hint.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                part.match(/^https?:\/\//) ? (
                  <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline font-medium"
                  >
                    {part.replace(/^https?:\/\//, '')}
                  </a>
                ) : part
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
