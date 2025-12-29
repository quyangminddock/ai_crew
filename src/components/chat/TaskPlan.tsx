'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Play, Users } from 'lucide-react'
import Image from 'next/image'
import type { Locale } from '@/lib/i18n/config'

export interface Task {
    id: string
    title: string
    description: string
    assignee: {
        id: string
        name: string
        role: string
        avatar?: string
        department?: string
        departmentColor?: string
    }
}

interface TaskPlanProps {
    tasks: Task[]
    locale?: Locale
    onExecute: (selectedTaskIds: string[]) => void
    onAssignToAgent?: (taskId: string, agentId: string) => void
}

// Department colors for visual distinction
const DEPARTMENT_COLORS: Record<string, string> = {
    'product': 'bg-blue-100 text-blue-700',
    'design': 'bg-purple-100 text-purple-700',
    'engineering': 'bg-green-100 text-green-700',
    'marketing': 'bg-orange-100 text-orange-700',
    'project-management': 'bg-indigo-100 text-indigo-700',
    'studio-operations': 'bg-gray-100 text-gray-700',
    'testing': 'bg-yellow-100 text-yellow-700',
    'bonus': 'bg-pink-100 text-pink-700',
}

export function TaskPlan({ tasks, locale = 'en', onExecute, onAssignToAgent }: TaskPlanProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>(tasks.map(t => t.id))

    const toggleTask = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(tid => tid !== id)
                : [...prev, id]
        )
    }

    const handleExecute = () => {
        onExecute(selectedIds)
    }

    const toggleAll = () => {
        if (selectedIds.length === tasks.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(tasks.map(t => t.id))
        }
    }

    const getDeptColor = (dept?: string) => {
        return dept ? DEPARTMENT_COLORS[dept] || 'bg-neutral-100 text-neutral-600' : 'bg-neutral-100 text-neutral-600'
    }

    return (
        <div className="my-4 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-[#FF6B35]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">
                            {locale === 'zh' ? '建议执行计划' : 'Suggested Action Plan'}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            {locale === 'zh'
                                ? `${tasks.length} 个任务已分配给团队成员`
                                : `${tasks.length} tasks assigned to team members`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleAll}
                        className="text-xs font-medium text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
                    >
                        {selectedIds.length === tasks.length
                            ? (locale === 'zh' ? '取消全选' : 'Deselect All')
                            : (locale === 'zh' ? '全选' : 'Select All')}
                    </button>
                </div>
            </div>
            <div className="divide-y divide-neutral-100">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`group flex items-start gap-4 p-4 cursor-pointer transition-all ${selectedIds.includes(task.id)
                                ? 'bg-[#FF6B35]/5 hover:bg-[#FF6B35]/10'
                                : 'hover:bg-neutral-50'
                            }`}
                    >
                        <button className="mt-0.5 shrink-0 text-neutral-400 group-hover:text-[#FF6B35] transition-colors">
                            {selectedIds.includes(task.id) ? (
                                <CheckCircle2 className="h-5 w-5 text-[#FF6B35]" />
                            ) : (
                                <Circle className="h-5 w-5" />
                            )}
                        </button>

                        {/* Assignee Avatar */}
                        <div className="shrink-0">
                            {task.assignee.avatar ? (
                                <Image
                                    src={task.assignee.avatar}
                                    alt={task.assignee.name}
                                    width={36}
                                    height={36}
                                    className="rounded-full border border-neutral-200"
                                />
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium text-neutral-500">
                                    {task.assignee.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="text-sm font-medium text-neutral-900 truncate">
                                    {task.title}
                                </h4>
                                {task.assignee.department && (
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getDeptColor(task.assignee.department)}`}>
                                        {task.assignee.department}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-neutral-500 line-clamp-2 mb-2">
                                {task.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-neutral-400">
                                    {locale === 'zh' ? '负责人:' : 'Assignee:'}
                                </span>
                                <span className="font-medium text-neutral-700">{task.assignee.name}</span>
                                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs ${getDeptColor(task.assignee.department)}`}>
                                    {task.assignee.role}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-gradient-to-r from-neutral-50 to-white border-t border-neutral-200">
                <button
                    onClick={handleExecute}
                    disabled={selectedIds.length === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#E65A2C] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Play className="h-4 w-4 fill-current" />
                    {locale === 'zh'
                        ? `执行 ${selectedIds.length} 个任务`
                        : `Execute ${selectedIds.length} Tasks`}
                </button>
            </div>
        </div>
    )
}

