'use client'

import { useSettingsStore, type ModelProvider } from '@/stores/useSettingsStore'
import { cn } from '@/lib/utils'

interface ModelSelectorProps {
  dictionary: {
    settings: {
      modelSelection: string
      modelAuto: string
      modelAutoDescription: string
    }
  }
}

export function ModelSelector({ dictionary }: ModelSelectorProps) {
  const { model, setModel, apiKeys, locale } = useSettingsStore()

  const models: { id: ModelProvider; name: string; description: string }[] = [
    { id: 'auto', name: 'Auto', description: locale === 'zh' ? '自动选择最佳模型' : 'Auto select best model' },
    { id: 'deepseek', name: 'DeepSeek', description: locale === 'zh' ? '性价比高，中文优秀' : 'Best value and Chinese performance' },
    { id: 'claude', name: 'Claude', description: locale === 'zh' ? '推理能力强' : 'Strong reasoning capabilities' },
    {
      id: 'openai' as const,
      name: 'OpenAI (GPT-4o)',
      description: locale === 'zh' ? '全球最稳定的行业基准模型' : 'The global industry standard model',
    },
    {
      id: 'gemini' as const,
      name: 'Gemini 1.5 Flash',
      description: locale === 'zh' ? 'Google 最新多模态模型，速度快成本低' : 'Google latest multimodal model, fast and cost-effective',
    },
  ]

  return (
    <div className="card p-8 bg-[var(--background-card)] border-[var(--border)] overflow-hidden">
      <h3 className="mb-1 text-xl font-bold text-[var(--foreground)] tracking-tight">
        {dictionary.settings.modelSelection}
      </h3>
      <p className="mb-6 text-sm text-[var(--foreground-secondary)]">
        {model === 'auto'
          ? dictionary.settings.modelAutoDescription
          : `${locale === 'zh' ? '当前使用：' : 'Current: '}${models.find((m) => m.id === model)?.name}`}
      </p>

      <div className="grid gap-4 grid-cols-1">
        {models.map((m) => {
          const isSelected = model === m.id
          const hasKey = m.id === 'auto' || !!apiKeys[m.id as keyof typeof apiKeys]
          const isDisabled = m.id !== 'auto' && !hasKey

          return (
            <button
              key={m.id}
              onClick={() => !isDisabled && setModel(m.id)}
              disabled={isDisabled}
              className={cn(
                'group relative flex flex-col items-start rounded-2xl border p-5 text-left transition-all duration-300',
                isSelected
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] ring-1 ring-[var(--primary)]/20'
                  : isDisabled
                    ? 'border-[var(--border)] bg-gray-50/50 opacity-60 cursor-not-allowed grayscale-[0.5]'
                    : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40 hover:bg-[var(--background-hover)] hover:shadow-md'
              )}
            >
              <div className="mb-3 flex w-full items-center justify-between">
                <span className={cn(
                  "text-lg font-extrabold tracking-tight transition-colors",
                  isSelected ? "text-[var(--primary)]" : "text-[var(--foreground)]"
                )}>
                  {m.name}
                </span>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg animate-in zoom-in duration-300">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              <span className="text-sm text-[var(--foreground-secondary)] leading-relaxed font-medium">
                {m.description}
              </span>

              {isDisabled && (
                <div className="mt-4 flex w-full items-center gap-2 rounded-lg bg-gray-100/80 px-3 py-1.5 text-[11px] font-bold text-gray-500 border border-gray-200">
                  <span className="block h-1.5 w-1.5 rounded-full bg-gray-400" />
                  {locale === 'zh' ? '需要 API Key' : 'API Key Required'}
                </div>
              )}

              {isSelected && (
                <div className="absolute -bottom-px -left-px -right-px h-[2px] rounded-b-2xl bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
