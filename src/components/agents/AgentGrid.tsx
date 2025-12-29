'use client'

import { AgentCard } from './AgentCard'
import type { Agent } from '@/types/agent'
import type { Locale } from '@/lib/i18n/config'

interface AgentGridProps {
  agents: Agent[]
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
  onSelectAgent: (agent: Agent) => void
}

export function AgentGrid({ agents, locale, dictionary, onSelectAgent }: AgentGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          locale={locale}
          dictionary={dictionary}
          onSelect={onSelectAgent}
        />
      ))}
    </div>
  )
}
