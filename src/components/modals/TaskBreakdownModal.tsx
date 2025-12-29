'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckSquare, Square, Loader2, Users } from 'lucide-react'
import { TaskWithAgent } from '@/lib/ai/task-agent-matcher'
import { getAgentById } from '@/lib/agents/data'
import type { Locale } from '@/lib/i18n/config'

interface TaskBreakdownModalProps {
    tasks: TaskWithAgent[]
    locale: Locale
    isOpen: boolean
    onClose: () => void
    onExecute: (selectedTasks: TaskWithAgent[]) => void
}

export function TaskBreakdownModal({
    tasks,
    locale,
    isOpen,
    onClose,
    onExecute,
}: TaskBreakdownModalProps) {
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
        new Set(tasks.map(t => t.id))
    )

    const toggleTask = (taskId: string) => {
        setSelectedTaskIds(prev => {
            const next = new Set(prev)
            if (next.has(taskId)) {
                next.delete(taskId)
            } else {
                next.add(taskId)
            }
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selectedTaskIds.size === tasks.length) {
            setSelectedTaskIds(new Set())
        } else {
            setSelectedTaskIds(new Set(tasks.map(t => t.id)))
        }
    }

    const handleExecute = () => {
        const selectedTasks = tasks.filter(t => selectedTaskIds.has(t.id))
        onExecute(selectedTasks)
        onClose()
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-700 border-red-200'
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'low':
                return 'bg-green-100 text-green-700 border-green-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getPriorityLabel = (priority: string) => {
        if (locale === 'zh') {
            return { high: '高', medium: '中', low: '低' }[priority] || priority
        }
        return priority.charAt(0).toUpperCase() + priority.slice(1)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex items-center gap-3">
                                <Users className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {locale === 'zh' ? '📋 任务分解' : '📋 Task Breakdown'}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-6 space-y-4">
                            {/* Select All */}
                            <button
                                onClick={toggleSelectAll}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {selectedTaskIds.size === tasks.length ? (
                                    <CheckSquare className="w-4 h-4" />
                                ) : (
                                    <Square className="w-4 h-4" />
                                )}
                                {locale === 'zh'
                                    ? selectedTaskIds.size === tasks.length
                                        ? '取消全选'
                                        : '全选'
                                    : selectedTaskIds.size === tasks.length
                                        ? 'Deselect All'
                                        : 'Select All'}
                            </button>

                            {/* Task List */}
                            {tasks.map(task => {
                                const agent = getAgentById(task.matchedAgentId)
                                const isSelected = selectedTaskIds.has(task.id)

                                return (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${isSelected
                                                ? 'border-blue-400 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                        onClick={() => toggleTask(task.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Checkbox */}
                                            <div className="mt-1">
                                                {isSelected ? (
                                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>

                                            {/* Task Content */}
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {task.title}
                                                    </h3>
                                                    <span
                                                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                                                            task.priority
                                                        )}`}
                                                    >
                                                        {getPriorityLabel(task.priority)}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {task.description}
                                                </p>

                                                {/* Agent Assignment */}
                                                {agent && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-500">
                                                            {locale === 'zh' ? '👤 推荐角色：' : '👤 Recommended:'}
                                                        </span>
                                                        <span className="font-medium text-gray-700">
                                                            {agent.name[locale]}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            ({Math.round(task.matchConfidence * 100)}%{' '}
                                                            {locale === 'zh' ? '匹配度' : 'match'})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}

                            {tasks.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <p>{locale === 'zh' ? '未检测到可执行任务' : 'No actionable tasks detected'}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <p className="text-sm text-gray-600">
                                {locale === 'zh'
                                    ? `已选择 ${selectedTaskIds.size} / ${tasks.length} 个任务`
                                    : `Selected ${selectedTaskIds.size} / ${tasks.length} tasks`}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    {locale === 'zh' ? '取消' : 'Cancel'}
                                </button>
                                <button
                                    onClick={handleExecute}
                                    disabled={selectedTaskIds.size === 0}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
                                >
                                    {locale === 'zh'
                                        ? `执行 (${selectedTaskIds.size})`
                                        : `Execute (${selectedTaskIds.size})`}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
