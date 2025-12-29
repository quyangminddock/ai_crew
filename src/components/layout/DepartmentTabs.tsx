'use client'

import { cn } from '@/lib/utils'
import { DEPARTMENTS } from '@/lib/agents/data'
import type { DepartmentId } from '@/types/agent'
import type { Locale } from '@/lib/i18n/config'

interface DepartmentTabsProps {
  activeDepartment: DepartmentId
  onDepartmentChange: (id: DepartmentId) => void
  locale: Locale
}

export function DepartmentTabs({
  activeDepartment,
  onDepartmentChange,
  locale,
}: DepartmentTabsProps) {
  return (
    <div className="w-full border-b border-white/20 bg-white/40 backdrop-blur">
      <div className="container mx-auto px-6">
        <div className="flex gap-2 overflow-x-auto py-3">
          {DEPARTMENTS.map((dept) => {
            const isActive = dept.id === activeDepartment
            const agentCount = dept.agents.length

            return (
              <button
                key={dept.id}
                onClick={() => onDepartmentChange(dept.id)}
                className={cn(
                  'flex shrink-0 flex-col items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF5722] text-white shadow-lg'
                    : 'text-neutral-700 hover:bg-white/60'
                )}
              >
                <span className="flex items-center gap-2 text-base">
                  <span className={cn('text-xl', !isActive && 'grayscale')}>
                    {dept.icon}
                  </span>
                  <span>{dept.name[locale]}</span>
                </span>
                <span
                  className={cn(
                    'text-xs',
                    isActive ? 'text-white/90' : 'text-neutral-500'
                  )}
                >
                  {agentCount} {locale === 'zh' ? '人' : 'members'}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
