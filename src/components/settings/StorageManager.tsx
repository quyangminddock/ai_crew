'use client'

import { useState, useEffect } from 'react'
import { Trash2, Database, Clock, Info } from 'lucide-react'
import { useChatStore } from '@/stores/useChatStore'
import type { Locale } from '@/lib/i18n/config'

interface StorageManagerProps {
  locale: Locale
}

export function StorageManager({ locale }: StorageManagerProps) {
  const [storageSize, setStorageSize] = useState(0)
  const [expiryDays, setExpiryDays] = useState(30)
  const [autoDelete, setAutoDelete] = useState(true)
  const { conversations } = useChatStore()

  const calculateStorageSize = () => {
    try {
      const data = JSON.stringify(conversations)
      const bytes = new Blob([data]).size
      setStorageSize(bytes)
    } catch (error) {
      console.error('Failed to calculate storage size:', error)
    }
  }

  useEffect(() => {
    calculateStorageSize()

    // Load settings from localStorage
    const savedExpiry = localStorage.getItem('crew-storage-expiry')
    const savedAutoDelete = localStorage.getItem('crew-storage-auto-delete')

    if (savedExpiry) setExpiryDays(parseInt(savedExpiry, 10))
    if (savedAutoDelete) setAutoDelete(savedAutoDelete === 'true')
  }, [conversations])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const handleClearAllData = () => {
    if (confirm(locale === 'zh' ? '确定要清空所有聊天记录吗？此操作不可恢复。' : 'Are you sure you want to clear all chat history? This cannot be undone.')) {
      // Clear all conversations from zustand store
      Object.keys(conversations).forEach((agentId) => {
        useChatStore.getState().clearConversation(agentId)
      })

      // Clear localStorage
      localStorage.removeItem('crew-chat')

      alert(locale === 'zh' ? '所有数据已清空' : 'All data has been cleared')
      calculateStorageSize()
    }
  }

  const handleClearOldData = () => {
    const cutoffTime = Date.now() - expiryDays * 24 * 60 * 60 * 1000
    let clearedCount = 0

    Object.entries(conversations).forEach(([agentId, conversation]) => {
      if (conversation.updatedAt < cutoffTime) {
        useChatStore.getState().clearConversation(agentId)
        clearedCount++
      }
    })

    alert(
      locale === 'zh'
        ? `已清理 ${clearedCount} 个过期对话`
        : `Cleared ${clearedCount} expired conversations`
    )
    calculateStorageSize()
  }

  const handleExpiryChange = (days: number) => {
    setExpiryDays(days)
    localStorage.setItem('crew-storage-expiry', days.toString())
  }

  const handleAutoDeleteChange = (enabled: boolean) => {
    setAutoDelete(enabled)
    localStorage.setItem('crew-storage-auto-delete', enabled.toString())
  }

  const conversationCount = Object.keys(conversations).length

  return (
    <div className="card p-8 bg-[var(--background-card)] border-[var(--border)]">
      <div className="mb-6">
        <h3 className="mb-1 text-xl font-semibold text-[var(--foreground)]">
          {locale === 'zh' ? '本地存储管理' : 'Local Storage Management'}
        </h3>
        <p className="text-sm text-[var(--foreground-secondary)]">
          {locale === 'zh'
            ? '管理您的聊天记录和本地数据'
            : 'Manage your chat history and local data'}
        </p>
      </div>

      {/* Storage stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 transition-all hover:bg-[var(--background-hover)]">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
            <Database className="h-4 w-4 text-[var(--primary)]" />
            {locale === 'zh' ? '存储占用' : 'Storage Used'}
          </div>
          <div className="text-3xl font-bold text-[var(--foreground)]">
            {formatBytes(storageSize)}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 transition-all hover:bg-[var(--background-hover)]">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
            <Info className="h-4 w-4 text-[var(--primary)]" />
            {locale === 'zh' ? '对话数量' : 'Conversations'}
          </div>
          <div className="text-3xl font-bold text-[var(--foreground)]">
            {conversationCount}
          </div>
        </div>
      </div>

      {/* Auto-delete settings */}
      <div className="mb-8 rounded-2xl bg-[var(--background)] border border-[var(--border)] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <Clock className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <span className="block font-semibold text-[var(--foreground)]">
                {locale === 'zh' ? '自动清理过期数据' : 'Auto-delete old data'}
              </span>
              <span className="text-xs text-[var(--foreground-muted)]">
                {locale === 'zh' ? '定期清理不常用的旧对话' : 'Regularly cleanup inactive conversations'}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleAutoDeleteChange(!autoDelete)}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${autoDelete ? 'bg-[var(--primary)]' : 'bg-[var(--foreground-muted)]/20'
              }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${autoDelete ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        {autoDelete && (
          <div className="animate-in-top">
            <label className="mb-3 block text-sm font-medium text-[var(--foreground-secondary)]">
              {locale === 'zh' ? '保留天数' : 'Keep for (days)'}
            </label>
            <div className="relative">
              <select
                value={expiryDays}
                onChange={(e) => handleExpiryChange(parseInt(e.target.value, 10))}
                className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--background-secondary)]/50 px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
              >
                <option value={7}>7 {locale === 'zh' ? '天' : 'days'}</option>
                <option value={14}>14 {locale === 'zh' ? '天' : 'days'}</option>
                <option value={30}>30 {locale === 'zh' ? '天' : 'days'}</option>
                <option value={60}>60 {locale === 'zh' ? '天' : 'days'}</option>
                <option value={90}>90 {locale === 'zh' ? '天' : 'days'}</option>
                <option value={180}>180 {locale === 'zh' ? '天' : 'days'}</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
                <Info className="h-4 w-4" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          onClick={handleClearOldData}
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-6 py-3.5 font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--background-hover)] active:scale-95"
        >
          {locale === 'zh' ? '清理过期数据' : 'Clear Old Data'}
        </button>

        <button
          onClick={handleClearAllData}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-6 py-3.5 font-semibold text-red-500 border border-red-500/20 transition-all hover:bg-red-500/20 active:scale-95"
        >
          <Trash2 className="h-4 w-4" />
          {locale === 'zh' ? '清空所有数据' : 'Clear All Data'}
        </button>
      </div>

      <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-xs leading-relaxed text-amber-500/90 font-medium">
            {locale === 'zh'
              ? '所有聊天记录仅存储在您的浏览器本地，不会上传到服务器。清空数据后无法恢复。'
              : 'All chat history is stored locally in your browser only and not uploaded to servers. Cleared data cannot be recovered.'}
          </p>
        </div>
      </div>
    </div>
  )
}
