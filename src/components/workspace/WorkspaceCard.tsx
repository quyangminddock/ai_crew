'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { Sparkles, Users, X, Briefcase, Target, Lightbulb, Send, Video, MessageSquare, ChevronDown } from 'lucide-react'
import { useChatStore } from '@/stores/useChatStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { getModelsForProvider, getDefaultModelForProvider } from '@/lib/ai/models'
import type { Agent } from '@/types/agent'
import type { Locale } from '@/lib/i18n/config'
import { getDepartmentById, getAgentById } from '@/lib/agents/data'
import { TaskBreakdownModal } from '@/components/modals/TaskBreakdownModal'
import { matchTasksToAgents } from '@/lib/ai/task-agent-matcher'
import type { TaskWithAgent } from '@/lib/ai/task-agent-matcher'
import { analyzeConversation } from '@/lib/ai/analyze-conversation'
import { saveTaskBreakdown } from '@/lib/ai/task-history'
import { LiveVideoChat } from '@/components/chat/LiveVideoChat'
import Image from 'next/image'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { WorkspaceCardSkeleton } from './WorkspaceCardSkeleton'


interface WorkspaceCardProps {
  agent: Agent
  locale: Locale
  dictionary: any
  onRemove: () => void
  onSend: (message: string, model?: string) => Promise<void>
  isLoading?: boolean
  initialChatMode?: 'text' | 'video'
  initialContext?: string
  savedTasksToReopen?: any
  onTasksReopened?: () => void
}

export function WorkspaceCard({
  agent,
  locale,
  dictionary,
  onRemove,
  onSend,
  isLoading,
  initialChatMode = 'text',
  initialContext,
  savedTasksToReopen,
  onTasksReopened,
}: WorkspaceCardProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')
  const [chatMode, setChatMode] = useState<'text' | 'video'>(initialChatMode)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [generatedTasks, setGeneratedTasks] = useState<TaskWithAgent[]>([])
  const [isAnalyzingConversation, setIsAnalyzingConversation] = useState(false)

  const { getOrCreateConversation, activeTasks, conversations, addMessage } = useChatStore()
  const { apiKeys, getActiveApiKey } = useSettingsStore()
  const conversation = conversations[agent.id] || { messages: [] }
  const agentDict = dictionary.agents[agent.id]
  const task = activeTasks.find((t) => t.agentId === agent.id)
  const department = getDepartmentById(agent.department)

  // Handle saved tasks reopening
  useEffect(() => {
    if (savedTasksToReopen) {
      console.log('[WorkspaceCard] Reopening saved tasks:', savedTasksToReopen)
      setGeneratedTasks(savedTasksToReopen.tasks || [])
      setShowTaskModal(true)
      if (onTasksReopened) {
        onTasksReopened()
      }
    }
  }, [savedTasksToReopen, onTasksReopened])

  // Get active provider and available models
  // Get active provider and available models
  const { model: globalModel } = useSettingsStore()

  // Get all available models for which we have an API key
  const availableModels = useMemo(() => {
    const models: any[] = []

    // Always include the global model's provider if it's not auto
    // Or if it's auto, include providers that have keys

    const providers = ['deepseek', 'claude', 'openai', 'gemini']

    providers.forEach(provider => {
      // Check if we have a key for this provider
      const hasKey = apiKeys[provider as keyof typeof apiKeys]
      if (hasKey) {
        models.push(...getModelsForProvider(provider))
      }
    })

    return models
  }, [apiKeys])

  // Initialize selected model
  useEffect(() => {
    if (!selectedModel && availableModels.length > 0) {
      setSelectedModel(availableModels[0].id)
    }
  }, [availableModels, selectedModel])

  useEffect(() => {
    if (!conversations[agent.id]) {
      getOrCreateConversation(agent.id)
    }
  }, [agent.id, conversations, getOrCreateConversation])

  // Sync chatMode with initialChatMode (for Live button auto-switch)
  useEffect(() => {
    if (initialChatMode === 'video') {
      setChatMode('video')
    }
  }, [initialChatMode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return
    const message = input.trim()
    setInput('')
    await onSend(message, selectedModel)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--background)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-[var(--border)] overflow-hidden">
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
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">{agentDict?.name || agent.name[locale]}</h3>
            <p className="text-xs text-[var(--foreground-secondary)]">
              {dictionary.departments[agent.department]}
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setChatMode('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${chatMode === 'text'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <MessageSquare className="h-4 w-4" />
              {locale === 'zh' ? '文本' : 'Text'}
            </button>
            <button
              onClick={() => setChatMode('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${chatMode === 'video'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Video className="h-4 w-4" />
              {locale === 'zh' ? '视频' : 'Video'}
            </button>
          </div>

          <button
            onClick={onRemove}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Status indicator */}
      {chatMode === 'text' && task?.status === 'working' && (
        <div className="bg-gradient-to-r from-[#10B981]/10 to-[#10B981]/5 px-6 py-2">
          <div className="flex items-center gap-2 text-sm text-[#10B981]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
            </span>
            <span className="font-medium">{dictionary.common.working}</span>
          </div>
        </div>
      )}

      {/* Conditional Content: Text Chat or Live Video */}
      {chatMode === 'video' ? (
        apiKeys.gemini ? (
          <div className="flex-1 overflow-hidden">
            <LiveVideoChat
              agentId={agent.id}
              agentName={agentDict?.name || agent.name[locale]}
              apiKey={apiKeys.gemini}
              systemPrompt={
                (agentDict?.systemPrompt || `You are ${agentDict?.name}. ${agentDict?.description}`) +
                (locale === 'zh' ? '\n\n请用中文回复所有对话。' : '\n\nPlease respond in English.')
              }
              initialContext={initialContext}
              locale={locale}
              onClose={() => setChatMode('text')}
              onSessionEnd={async (transcript) => {
                // Analyze conversation and generate tasks (client-side)
                setIsAnalyzingConversation(true)
                try {
                  // Call Gemini API directly from browser - API key never leaves client
                  const tasks = await analyzeConversation(transcript, apiKeys.gemini || '', locale)

                  if (tasks && tasks.length > 0) {
                    // Match tasks to agents
                    const tasksWithAgents = matchTasksToAgents(tasks)

                    // Save to history
                    saveTaskBreakdown(
                      initialContext || '未知主题',
                      tasksWithAgents,
                      locale
                    )

                    setGeneratedTasks(tasksWithAgents)
                    setShowTaskModal(true)
                  } else {
                    // No tasks generated, return to text mode
                    setChatMode('text')
                  }
                } catch (error) {
                  console.error('[WorkspaceCard] Task analysis error:', error)
                  setChatMode('text')
                } finally {
                  setIsAnalyzingConversation(false)
                }
              }}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="mb-4 text-5xl">🎥</div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                {locale === 'zh' ? '需要 Gemini API Key' : 'Gemini API Key Required'}
              </h3>
              <p className="text-sm text-[var(--foreground-secondary)] mb-4">
                {locale === 'zh'
                  ? '视频聊天需要配置 Gemini API Key。请前往设置页面添加。'
                  : 'Video chat requires a Gemini API Key. Please add one in Settings.'}
              </p>
              <button
                onClick={() => setChatMode('text')}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
              >
                {locale === 'zh' ? '返回文本模式' : 'Back to Text Mode'}
              </button>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-4">
              {conversation.messages.length === 0 ? (
                <div className="flex h-full items-center justify-center py-12 text-center">
                  <div>
                    <div className="mb-4 text-6xl">👋</div>
                    <p className="text-lg font-medium text-neutral-700">
                      {locale === 'zh' ? '开始对话' : 'Start chatting'}
                    </p>
                    <p className="mt-2 text-sm text-neutral-500">
                      {agentDict?.description || ''}
                    </p>
                  </div>
                </div>
              ) : (
                conversation.messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    agentName={agentDict?.name}
                  />
                ))
              )}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-sm">
                    👤
                  </div>
                  <div className="rounded-2xl bg-neutral-100 px-4 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-neutral-200 bg-white p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={locale === 'zh' ? '输入消息...' : 'Type a message...'}
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 disabled:opacity-50"
              />

              {/* Model Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  title={locale === 'zh' ? '选择模型' : 'Select model'}
                >
                  <span className="max-w-[100px] truncate">
                    {availableModels.find(m => m.id === selectedModel)?.name || 'Model'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showModelSelector && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowModelSelector(false)}
                    />
                    <div className="absolute bottom-full right-0 mb-2 w-64 rounded-xl border border-neutral-200 bg-white shadow-lg z-20 overflow-hidden">
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {availableModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id)
                              setShowModelSelector(false)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedModel === model.id
                              ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                              : 'hover:bg-neutral-50 text-neutral-700'
                              }`}
                          >
                            <div className="font-medium text-sm">{model.name}</div>
                            {model.description && (
                              <div className="text-xs text-neutral-500 mt-0.5">
                                {model.description}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF5722] text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )
      }

      {/* Task Breakdown Modal */}
      <TaskBreakdownModal
        tasks={generatedTasks}
        locale={locale}
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setChatMode('text')
        }}
        onExecute={(selectedTasks) => {
          console.log('[WorkspaceCard] Executing tasks:', selectedTasks)

          // Group tasks by agent
          const tasksByAgent = selectedTasks.reduce((acc, task) => {
            if (!acc[task.matchedAgentId]) {
              acc[task.matchedAgentId] = []
            }
            acc[task.matchedAgentId].push(task)
            return acc
          }, {} as Record<string, typeof selectedTasks>)

          // For each agent, add to workspace and send tasks
          Object.entries(tasksByAgent).forEach(([agentId, tasks], index) => {
            const targetAgent = getAgentById(agentId)
            if (!targetAgent) return

            // Add agent to workspace using global function
            if (typeof window !== 'undefined' && (window as any).__addAgentToWorkspace) {
              (window as any).__addAgentToWorkspace(targetAgent)
            }

            // Prepare task prompt
            const taskList = tasks.map((t, i) =>
              `${i + 1}. **${t.title}** (${locale === 'zh' ? '优先级' : 'Priority'}: ${t.priority})\n   ${t.description}`
            ).join('\n\n')

            const prompt = locale === 'zh'
              ? `你好！我有以下任务需要你协助完成：\n\n${taskList}\n\n请分析这些任务并告诉我你的计划和建议。`
              : `Hello! I have the following tasks for you:\n\n${taskList}\n\nPlease analyze these tasks and share your plan and suggestions.`

            // Send message to agent and trigger AI response
            // Wait a bit longer for each agent to ensure workspace is ready
            setTimeout(() => {
              // Add message to store
              addMessage(agentId, {
                role: 'user',
                content: prompt,
              })

              // Trigger AI response by calling onSend if this is the current agent
              // Otherwise, the message will be sent when user switches to that agent
              if (agentId === agent.id) {
                onSend(prompt).catch((error) => {
                  console.error('[WorkspaceCard] Failed to send message:', error)
                })
              }
            }, 500 + index * 200)
          })

          setShowTaskModal(false)
          setChatMode('text')
        }}
      />
    </div>
  )
}
