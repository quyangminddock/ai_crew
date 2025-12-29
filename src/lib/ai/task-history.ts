import type { TaskWithAgent } from './task-agent-matcher'

export interface SavedTaskBreakdown {
    id: string
    timestamp: number
    topic: string
    tasks: TaskWithAgent[]
    locale: 'zh' | 'en'
}

const STORAGE_KEY = 'task_breakdowns_history'
const MAX_HISTORY = 20  // 最多保存20条历史

/**
 * Save a task breakdown to localStorage
 */
export function saveTaskBreakdown(
    topic: string,
    tasks: TaskWithAgent[],
    locale: 'zh' | 'en' = 'zh'
): void {
    try {
        const history = getTaskHistory()

        const newBreakdown: SavedTaskBreakdown = {
            id: `breakdown-${Date.now()}`,
            timestamp: Date.now(),
            topic,
            tasks,
            locale
        }

        // Add to beginning of array
        history.unshift(newBreakdown)

        // Keep only MAX_HISTORY items
        const trimmedHistory = history.slice(0, MAX_HISTORY)

        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory))
    } catch (error) {
        console.error('[TaskHistory] Failed to save:', error)
    }
}

/**
 * Get all task breakdowns from history
 */
export function getTaskHistory(): SavedTaskBreakdown[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return []

        return JSON.parse(stored) as SavedTaskBreakdown[]
    } catch (error) {
        console.error('[TaskHistory] Failed to load:', error)
        return []
    }
}

/**
 * Get a specific task breakdown by ID
 */
export function getTaskBreakdown(id: string): SavedTaskBreakdown | null {
    const history = getTaskHistory()
    return history.find(item => item.id === id) || null
}

/**
 * Delete a task breakdown from history
 */
export function deleteTaskBreakdown(id: string): void {
    try {
        const history = getTaskHistory()
        const filtered = history.filter(item => item.id !== id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
        console.error('[TaskHistory] Failed to delete:', error)
    }
}

/**
 * Clear all task history
 */
export function clearTaskHistory(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('[TaskHistory] Failed to clear:', error)
    }
}
