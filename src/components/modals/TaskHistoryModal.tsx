'use client'

import { useState } from 'react'
import { X, Clock, Trash2, CheckSquare } from 'lucide-react'
import { getTaskHistory, deleteTaskBreakdown, type SavedTaskBreakdown } from '@/lib/ai/task-history'
import type { Locale } from '@/lib/i18n/config'

interface TaskHistoryModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectTasks: (tasks: SavedTaskBreakdown) => void
    locale: Locale
}

export function TaskHistoryModal({ isOpen, onClose, onSelectTasks, locale }: TaskHistoryModalProps) {
    const [history, setHistory] = useState<SavedTaskBreakdown[]>(() => getTaskHistory())

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        deleteTaskBreakdown(id)
        setHistory(getTaskHistory())
    }

    const handleSelect = (item: SavedTaskBreakdown) => {
        onSelectTasks(item)
        onClose()
    }

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return locale === 'zh' ? '今天' : 'Today'
        } else if (diffDays === 1) {
            return locale === 'zh' ? '昨天' : 'Yesterday'
        } else if (diffDays < 7) {
            return locale === 'zh' ? `${diffDays} 天前` : `${diffDays} days ago`
        } else {
            return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-6 h-6 text-blue-500" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {locale === 'zh' ? '任务历史' : 'Task History'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {history.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckSquare className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {locale === 'zh' ? '暂无历史记录' : 'No history yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className="group p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                                                {item.topic}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{formatDate(item.timestamp)}</span>
                                                </div>
                                                <span>
                                                    {item.tasks.length} {locale === 'zh' ? '个任务' : 'tasks'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-all"
                                            title={locale === 'zh' ? '删除' : 'Delete'}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
