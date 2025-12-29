'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { DEPARTMENTS } from '@/lib/agents/data'
import { ChevronRight, Search, PlusCircle, LayoutDashboard, Settings, Sparkles, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InspirationSection } from '@/components/home/InspirationSection'
import { TaskHistoryModal } from '@/components/modals/TaskHistoryModal'
import type { SavedTaskBreakdown } from '@/lib/ai/task-history'
import type { DepartmentId, Agent } from '@/types/agent'
import type { Locale } from '@/lib/i18n/config'

interface SidebarProps {
    activeDepartment: DepartmentId
    onDepartmentChange: (id: DepartmentId) => void
    onSelectAgent: (agent: Agent) => void
    onHandToProduct?: (inspiration: string) => void
    onLiveSession?: (inspiration: string) => void
    onOpenTaskHistory?: (tasks: SavedTaskBreakdown) => void
    locale: Locale
    dictionary: any
}

export function Sidebar({
    activeDepartment,
    onDepartmentChange,
    onSelectAgent,
    onHandToProduct,
    onLiveSession,
    onOpenTaskHistory,
    locale,
    dictionary
}: SidebarProps) {
    const [expandedDept, setExpandedDept] = useState<DepartmentId | null>(activeDepartment)
    const [inspirationDialogOpen, setInspirationDialogOpen] = useState(false)
    const [showTaskHistory, setShowTaskHistory] = useState(false)

    const handleDeptClick = (deptId: DepartmentId) => {
        if (expandedDept === deptId) {
            setExpandedDept(null)
        } else {
            setExpandedDept(deptId)
            onDepartmentChange(deptId)
        }
    }

    return (
        <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className="flex h-[var(--header-height)] items-center px-6 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 font-semibold text-lg text-[var(--foreground)]">
                    <div className="size-8 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-[var(--border)]">
                        <Image
                            src="/logo.png"
                            alt="CREW Logo"
                            width={32}
                            height={32}
                            className="object-cover"
                        />
                    </div>
                    <span>Crew Console</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                <div className="mb-2 px-3 text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    {locale === 'zh' ? '部门' : 'Departments'}
                </div>

                {DEPARTMENTS.map((dept) => {
                    const isActive = dept.id === activeDepartment
                    const isExpanded = expandedDept === dept.id

                    return (
                        <div key={dept.id} className="space-y-1">
                            <button
                                onClick={() => handleDeptClick(dept.id)}
                                className={cn(
                                    'w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-[var(--background-hover)] text-[var(--foreground)]'
                                        : 'text-[var(--foreground-secondary)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={dept.avatar}
                                        alt={dept.name.en}
                                        width={28}
                                        height={28}
                                        className="rounded-lg object-cover"
                                    />
                                    <span className="text-base">{dept.name[locale]}</span>
                                </div>
                                <ChevronRight
                                    className={cn(
                                        "h-4 w-4 transition-transform text-[var(--foreground-muted)]",
                                        isExpanded && "rotate-90"
                                    )}
                                />
                            </button>

                            {/* Agents Sub-list */}
                            {isExpanded && (
                                <div className="ml-4 pl-4 border-l border-[var(--border)] space-y-1 animate-fade-in">
                                    {dept.agents.map((agent) => (
                                        <button
                                            key={agent.id}
                                            onClick={() => onSelectAgent(agent)}
                                            className="group w-full flex items-center justify-between rounded-md px-3 py-1.5 text-sm text-[var(--foreground-secondary)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] text-left transition-colors"
                                        >
                                            <span>{agent.name[locale]}</span>
                                            <PlusCircle className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-[var(--primary)] transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-[var(--border)] space-y-2">
                {/* Inspiration Trigger (New) */}
                <Dialog open={inspirationDialogOpen} onOpenChange={setInspirationDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 transition-colors">
                            <Sparkles className="h-4 w-4" />
                            <span>{locale === 'zh' ? '灵感中心' : 'Inspiration Center'}</span>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{locale === 'zh' ? '今日创业灵感' : 'Startup Inspiration'}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <InspirationSection
                                locale={locale}
                                onHandToProduct={(inspiration) => {
                                    setInspirationDialogOpen(false) // Close dialog
                                    if (onHandToProduct) onHandToProduct(inspiration)
                                }}
                                onLiveSession={(inspiration) => {
                                    setInspirationDialogOpen(false) // Close dialog
                                    if (onLiveSession) onLiveSession(inspiration)
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Task History Button */}
                <button
                    onClick={() => setShowTaskHistory(true)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-hover)] transition-colors"
                >
                    <CheckSquare className="h-4 w-4" />
                    <span>{locale === 'zh' ? '任务历史' : 'Task History'}</span>
                </button>

                <Link
                    href="/settings"
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-hover)] transition-colors"
                >
                    <Settings className="h-4 w-4" />
                    <span>{locale === 'zh' ? '设置' : 'Settings'}</span>
                </Link>

                {/* Task History Modal */}
                <TaskHistoryModal
                    isOpen={showTaskHistory}
                    onClose={() => setShowTaskHistory(false)}
                    onSelectTasks={(breakdown) => {
                        setShowTaskHistory(false)
                        if (onOpenTaskHistory) {
                            onOpenTaskHistory(breakdown)
                        }
                    }}
                    locale={locale}
                />
            </div>
        </div>
    )
}
