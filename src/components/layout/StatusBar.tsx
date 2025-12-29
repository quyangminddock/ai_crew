'use client'

import { useChatStore } from '@/stores/useChatStore'
import { getAgentById } from '@/lib/agents/data'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/i18n/config'

interface StatusBarProps {
  locale: Locale
  dictionary: {
    status: {
      teamWorking: string
      waiting: string
    }
    common: {
      working: string
      completed: string
    }
  }
}

export function StatusBar({ locale, dictionary }: StatusBarProps) {
  const { activeTasks } = useChatStore()

  const workingTasks = activeTasks.filter((t) => t.status === 'working')

  if (workingTasks.length === 0) return null

  return (
    <div className="glass fixed bottom-0 left-0 right-0 border-t border-white/20 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-semibold text-neutral-900">
            {dictionary.status.teamWorking}
          </span>
          <div className="flex flex-wrap gap-2">
            {workingTasks.map((task) => {
              const agent = getAgentById(task.agentId)
              if (!agent) return null

              return (
                <div
                  key={task.agentId}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] px-4 py-2 shadow-lg"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  <span className="text-sm font-medium text-white">
                    {agent.name[locale]}
                  </span>
                  {task.progress !== undefined && task.progress > 0 && (
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/30">
                      <div
                        className="h-full bg-white transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
