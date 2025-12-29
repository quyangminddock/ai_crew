'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, LayoutGrid, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { WorkspaceCard } from './WorkspaceCard'
import { InspirationSection } from '@/components/home/InspirationSection' // Restored
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useChatStore } from '@/stores/useChatStore'
import { getAgentById, getDepartmentById } from '@/lib/agents/data'
import { getProviderFromModelId } from '@/lib/ai/models'
import type { Agent } from '@/types/agent'
import type { Locale } from '@/lib/i18n/config'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import type { MutableRefObject } from 'react'

interface WorkspaceProps {
  locale: Locale
  dictionary: any
  onAddAgent: () => void
  onLiveSessionRef?: MutableRefObject<((inspiration: string) => void) | null>
}

export function Workspace({ locale, dictionary, onAddAgent, onLiveSessionRef }: WorkspaceProps) {
  const {
    activeAgentIds,
    selectedAgentId,
    addAgent,
    removeAgent,
    setSelectedAgentId
  } = useWorkspaceStore()

  const [loadingAgents, setLoadingAgents] = useState<Set<string>>(new Set())
  const [promptModalAgent, setPromptModalAgent] = useState<Agent | null>(null)
  const [liveInspiration, setLiveInspiration] = useState<{ agentId: string; context: string } | null>(null)
  const [savedTasksToReopen, setSavedTasksToReopen] = useState<any>(null)

  const { getActiveApiKey, apiKeys } = useSettingsStore()
  const { addMessage, updateMessage, startTask, completeTask, conversations, activeTasks } = useChatStore()

  // Listen for task history reopen events
  useEffect(() => {
    const handleOpenTaskHistory = () => {
      const pending = sessionStorage.getItem('pendingTasksToOpen')
      if (pending) {
        try {
          const tasks = JSON.parse(pending)
          setSavedTasksToReopen(tasks)
          sessionStorage.removeItem('pendingTasksToOpen')
        } catch (error) {
          console.error('[Workspace] Failed to parse pending tasks:', error)
        }
      }
    }

    window.addEventListener('openTaskHistory', handleOpenTaskHistory)
    return () => window.removeEventListener('openTaskHistory', handleOpenTaskHistory)
  }, [])

  // Map IDs to actual Agent objects
  const activeAgents = activeAgentIds
    .map(id => getAgentById(id))
    .filter((a): a is Agent => !!a)

  // Clean up invalid agent IDs from localStorage (run once on mount)
  const hasRunCleanup = useRef(false)
  useEffect(() => {
    if (hasRunCleanup.current) return
    hasRunCleanup.current = true

    const invalidIds = activeAgentIds.filter(id => !getAgentById(id))

    if (invalidIds.length > 0) {
      console.warn('[Workspace] Removing invalid agent IDs:', invalidIds)
      invalidIds.forEach(id => removeAgent(id))
    }
  }, [activeAgentIds, removeAgent])

  const handleRemoveAgent = (agentId: string) => {
    removeAgent(agentId)
  }

  const handleSendMessage = async (agent: Agent, message: string, model?: string) => {
    // Determine API Key based on selected model (if any) or active default
    let apiKeyInfo: { provider: string; key: string } | null = null;

    if (model) {
      const provider = getProviderFromModelId(model)
      if (provider && apiKeys[provider as keyof typeof apiKeys]) {
        apiKeyInfo = {
          provider,
          key: apiKeys[provider as keyof typeof apiKeys]!
        }
      }
    }

    if (!apiKeyInfo) {
      apiKeyInfo = getActiveApiKey()
    }

    if (!apiKeyInfo) {
      addMessage(agent.id, {
        role: 'assistant',
        content: locale === 'zh'
          ? '请先在设置中配置 API Key'
          : 'Please configure your API Key in Settings first',
        agentId: agent.id,
      })
      return
    }

    addMessage(agent.id, { role: 'user', content: message })
    setLoadingAgents((prev) => new Set(prev).add(agent.id))
    startTask(agent.id)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          message,
          apiKey: apiKeyInfo.key,
          provider: apiKeyInfo.provider,
          model, // Pass selected model
        }),
      })

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      addMessage(agent.id, {
        role: 'assistant',
        content: data.content,
        agentId: agent.id,
      })

      completeTask(agent.id, data.content.slice(0, 100))
    } catch (error) {
      console.error('Chat error:', error)
      addMessage(agent.id, {
        role: 'assistant',
        content: locale === 'zh'
          ? '抱歉，出现了一些问题。请稍后重试。'
          : 'Sorry, something went wrong. Please try again.',
        agentId: agent.id,
      })
      completeTask(agent.id)
    } finally {
      setLoadingAgents((prev) => {
        const next = new Set(prev)
        next.delete(agent.id)
        return next
      })
    }
  }

  // Restore logic for handing inspiration to product
  const handleHandToProduct = (inspiration: string) => {
    const trendResearcher = getAgentById('trend-researcher')
    if (!trendResearcher) return

    addAgent(trendResearcher.id)

    const analysisPrompt = locale === 'zh'
      ? `请分析这个创意的前景：\n\n"${inspiration}"\n\n请从以下几个方面进行分析：\n1. 市场前景和潜在用户群体\n2. 相关的行业数据和趋势\n3. 主要竞品分析\n4. 可行性评估\n5. 风险和挑战`
      : `Please analyze this idea:\n\n"${inspiration}"\n\nAnalyze from these perspectives:\n1. Market potential and target users\n2. Relevant industry data and trends\n3. Competitor analysis\n4. Feasibility assessment\n5. Risks and challenges`

    setTimeout(() => {
      handleSendMessage(trendResearcher, analysisPrompt)
    }, 500)
  }

  // Handle live session with inspiration - AUTO-SWITCH TO VIDEO MODE
  const handleLiveSession = (inspiration: string) => {
    const trendResearcher = getAgentById('trend-researcher')
    if (!trendResearcher) return

    addAgent(trendResearcher.id)
    setSelectedAgentId(trendResearcher.id)

    const livePrompt = locale === 'zh'
      ? `我想针对这个灵感进行面对面讨论：\n"${inspiration}"`
      : `I want to discuss this inspiration live:\n"${inspiration}"`

    // Set live inspiration to trigger auto-video mode
    setLiveInspiration({
      agentId: trendResearcher.id,
      context: livePrompt
    })
  }

  // Expose handleLiveSession to parent via ref
  useEffect(() => {
    if (onLiveSessionRef) {
      onLiveSessionRef.current = handleLiveSession
    }
  }, [onLiveSessionRef, handleLiveSession])

  // Expose method to add agent from parent (keep for legacy compatibility if needed)
  useEffect(() => {
    ; (window as any).__addAgentToWorkspace = (agent: Agent) => {
      addAgent(agent.id)
    }
  }, [addAgent])

  if (activeAgents.length === 0) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center text-center p-8 animate-fade-in gap-8">
        <div className="max-w-xl w-full">
          <h3 className="mb-6 text-2xl font-semibold text-[var(--foreground)]">
            {locale === 'zh' ? '今日灵感' : 'Daily Inspiration'}
          </h3>
          {/* Restored Inspiration Section */}
          <InspirationSection
            locale={locale}
            onHandToProduct={handleHandToProduct}
            onLiveSession={handleLiveSession}
          />
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--border)] w-full max-w-md">
          <p className="text-[var(--foreground-secondary)] mb-4">
            {locale === 'zh'
              ? '或者，从侧边栏选择角色开始协作'
              : 'Or, select agents from the sidebar to start collaborating'}
          </p>
        </div>
      </div>
    )
  }

  const selectedAgent = activeAgents.find(a => a.id === selectedAgentId)

  return (
    <div className="flex h-full overflow-hidden">
      {/* 1. Session List (Left Sidebar for Chats) */}
      <div className="w-80 flex-shrink-0 border-r border-[var(--border)] bg-[var(--background-secondary)]/10 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--background)]/50">
            <h3 className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
              {locale === 'zh' ? '活跃会话' : 'Active Sessions'}
            </h3>
          </div>
          <div className="p-3 space-y-1">
            {activeAgents.map(agent => {
              const isSelected = selectedAgentId === agent.id
              const isWorking = activeTasks.some(t => t.agentId === agent.id && t.status === 'working')
              const department = getDepartmentById(agent.department)

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`group cursor-pointer rounded-xl p-4 transition-all duration-200 ${isSelected
                    ? 'bg-[var(--background-card)] shadow-md border border-[var(--border)] ring-1 ring-[var(--primary)]/10'
                    : 'hover:bg-[var(--background-hover)] border border-transparent'
                    }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    {/* Department Avatar */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-[var(--border)] overflow-hidden shrink-0">
                      {department?.avatar ? (
                        <Image
                          src={department.avatar}
                          alt={department.name.en}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        '🤖'
                      )}
                    </div>

                    {/* Agent Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-base text-[var(--foreground)] truncate">{agent.name[locale]}</span>
                        {isWorking && (
                          <span className="flex h-2 w-2 relative shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]"></span>
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--foreground-secondary)] leading-relaxed line-clamp-2">
                        {/* Show last message preview if available */}
                        {conversations[agent.id]?.messages.length > 0
                          ? conversations[agent.id].messages[conversations[agent.id].messages.length - 1].content
                          : agent.name[locale]}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveAgent(agent.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                    >
                      <div className="h-4 w-4 flex items-center justify-center leading-none">×</div>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. Chat Area (Main) */}
      <div className="flex-1 min-w-0 bg-[var(--background)] h-full">
        {selectedAgent ? (
          <WorkspaceCard
            key={selectedAgent.id}
            agent={selectedAgent}
            locale={locale}
            dictionary={dictionary}
            onRemove={() => handleRemoveAgent(selectedAgent.id)}
            onSend={(message) => handleSendMessage(selectedAgent, message)}
            isLoading={loadingAgents.has(selectedAgent.id)}
            initialChatMode={liveInspiration?.agentId === selectedAgent.id ? 'video' : 'text'}
            initialContext={liveInspiration?.agentId === selectedAgent.id ? liveInspiration.context : undefined}
            savedTasksToReopen={savedTasksToReopen}
            onTasksReopened={() => setSavedTasksToReopen(null)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--foreground-muted)] flex-col gap-4">
            <div className="size-12 rounded-2xl bg-[var(--background-secondary)] flex items-center justify-center shadow-sm">
              <MessageSquare className="h-6 w-6 text-[var(--primary)]" />
            </div>
            {locale === 'zh' ? '选择一个会话开始' : 'Select a session to start'}
          </div>
        )}
      </div>
    </div>
  )
}
