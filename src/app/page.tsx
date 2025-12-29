'use client'

import { useState, useEffect, useRef } from 'react'
import { ConsoleLayout } from '@/components/layout/ConsoleLayout'
import { Sidebar } from '@/components/layout/Sidebar'
import { Workspace } from '@/components/workspace/Workspace'
// import { InspirationSection } from '@/components/home/InspirationSection' // No longer in main page structure
import { DEPARTMENTS, getAgentById } from '@/lib/agents/data'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useChatStore } from '@/stores/useChatStore'
import { useInspirationStore } from '@/stores/useInspirationStore'
import type { DepartmentId, Agent } from '@/types/agent'
import type { Locale } from '@/lib/i18n/config'

// Import dictionaries
import zhDict from '@/lib/i18n/dictionaries/zh.json'
import enDict from '@/lib/i18n/dictionaries/en.json'

const dictionaries = { zh: zhDict, en: enDict }

import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

export default function HomePage() {
  const [activeDepartment, setActiveDepartment] = useState<DepartmentId>('product')
  const [mounted, setMounted] = useState(false)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const liveSessionRef = useRef<((inspiration: string) => void) | null>(null)

  const { locale } = useSettingsStore()
  const { addMessage } = useChatStore()
  const { fetchInspirations } = useInspirationStore()
  const { addAgent } = useWorkspaceStore()

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    // Pre-fetch inspirations on mount
    fetchInspirations(locale)
  }, [locale, fetchInspirations])

  const dictionary = dictionaries[locale as Locale] || dictionaries.zh

  const handleSelectAgent = (agent: Agent) => {
    // Add to persistent workspace
    addAgent(agent.id)
  }

  const handleDepartmentChange = (departmentId: DepartmentId) => {
    setActiveDepartment(departmentId)
  }

  // Restore logic for handing inspiration to product (moved from old home page)
  const handleHandToProduct = (inspiration: string) => {
    // 1. Switch to product department
    setActiveDepartment('product')

    // 2. Find trend researcher
    const trendResearcher = getAgentById('trend-researcher')
    if (!trendResearcher) return

    // 3. Add to workspace
    if (typeof window !== 'undefined' && (window as any).__addAgentToWorkspace) {
      ; (window as any).__addAgentToWorkspace(trendResearcher)
    }

    // 4. Prepare prompt
    const analysisPrompt = locale === 'zh'
      ? `请分析这个创意的前景：\n\n"${inspiration}"\n\n请从以下几个方面进行分析：\n1. 市场前景和潜在用户群体\n2. 相关的行业数据和趋势\n3. 主要竞品分析\n4. 可行性评估\n5. 风险和挑战`
      : `Please analyze this idea:\n\n"${inspiration}"\n\nAnalyze from these perspectives:\n1. Market potential and target users\n2. Relevant industry data and trends\n3. Competitor analysis\n4. Feasibility assessment\n5. Risks and challenges`

    // 5. Add message (accessing chat store via hook in component is not ideal for event handler if not bound, but we are in component)
    // We need to use useChatStore inside the component body or import it.
    // useChatStore is a hook. We need to call it in the component body.

    setTimeout(() => {
      useChatStore.getState().addMessage(trendResearcher.id, {
        role: 'user',
        content: analysisPrompt,
      })
      // Also trigger status update if possible, or trust Workspace to react to the message?
      // WorkspaceCard reacts to store changes. We just need to ensure the task is started.
      useChatStore.getState().startTask(trendResearcher.id)
    }, 500)
  }

  // NOTE: Inspiration logic is temporarily preserved if we want to add it back to a "New Project" modal
  // const handleHandToProduct = (inspiration: string) => { ... }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--foreground-muted)]">{dictionary.common.loading}</div>
      </div>
    )
  }

  return (
    <ConsoleLayout
      sidebar={
        <Sidebar
          activeDepartment={activeDepartment}
          onDepartmentChange={handleDepartmentChange}
          onSelectAgent={handleSelectAgent}
          onHandToProduct={handleHandToProduct}
          onLiveSession={(inspiration) => {
            // Use Workspace's handleLiveSession if available
            if (liveSessionRef.current) {
              liveSessionRef.current(inspiration)
            }
          }}
          onOpenTaskHistory={(tasks) => {
            // TODO: Pass to Workspace to reopen task modal
            console.log('[HomePage] Opening task history:', tasks)
            if (typeof window !== 'undefined') {
              // Store in sessionStorage for Workspace to pick up
              sessionStorage.setItem('pendingTasksToOpen', JSON.stringify(tasks))
              // Trigger a custom event
              window.dispatchEvent(new CustomEvent('openTaskHistory'))
            }
          }}
          locale={locale as Locale}
          dictionary={dictionary}
        />
      }
    >
      <div className="h-full flex flex-col">
        {/* Workspace is now the main hero */}
        <Workspace
          locale={locale as Locale}
          dictionary={dictionary}
          onAddAgent={() => {
            // Can open a modal or highlight sidebar
            console.log("Request to add agent")
          }}
          onLiveSessionRef={liveSessionRef}
        />
      </div>
    </ConsoleLayout>
  )
}
