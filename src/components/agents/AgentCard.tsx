'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/useChatStore'
import type { Agent, AgentStatus } from '@/types/agent'
import type { Locale } from '@/lib/i18n/config'

interface AgentCardProps {
  agent: Agent
  locale: Locale
  dictionary: {
    agents: Record<string, { name: string; description: string; greeting: string }>
    common: {
      startChat: string
      working: string
      completed: string
      idle: string
    }
  }
  onSelect: (agent: Agent) => void
}

export function AgentCard({ agent, locale, dictionary, onSelect }: AgentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { activeTasks } = useChatStore()

  const agentDict = dictionary.agents[agent.id] || {
    name: agent.name[locale],
    description: '',
    greeting: '',
  }

  const task = activeTasks.find((t) => t.agentId === agent.id)
  const status: AgentStatus = task?.status || 'idle'

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onSelect(agent)}
        className={cn(
          'card flex w-full flex-col items-center gap-3 p-6 transition-all',
          'hover:shadow-xl hover:-translate-y-1',
          status === 'working' && 'ring-2 ring-[#10B981]',
          status === 'completed' && 'ring-2 ring-[#004E89]'
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-all',
            status === 'working'
              ? 'bg-gradient-to-br from-[#10B981] to-[#059669] shadow-lg'
              : status === 'completed'
                ? 'bg-gradient-to-br from-[#004E89] to-[#003561] shadow-lg'
                : 'bg-gradient-to-br from-neutral-100 to-neutral-200 group-hover:from-[#FF6B35]/10 group-hover:to-[#FF5722]/10'
          )}
        >
          <span className={status === 'working' || status === 'completed' ? 'filter brightness-0 invert' : ''}>
            👤
          </span>
        </div>

        {/* Name */}
        <div className="text-center">
          <h3 className="font-semibold text-neutral-900">{agentDict.name}</h3>
          <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
            {agentDict.description}
          </p>
        </div>

        {/* Status */}
        {status === 'working' && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#10B981]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
            </span>
            {dictionary.common.working}
          </div>
        )}

        {/* Add button overlay */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#FF5722] opacity-0 transition-opacity',
            'group-hover:opacity-90'
          )}
        >
          <div className="text-center text-white">
            <Plus className="mx-auto mb-2 h-8 w-8" />
            <p className="font-medium">
              {locale === 'zh' ? '添加到工作台' : 'Add to workspace'}
            </p>
          </div>
        </div>
      </button>
    </div>
  )
}
