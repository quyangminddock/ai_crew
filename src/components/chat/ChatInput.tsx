'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export function ChatInput({ onSend, disabled, placeholder, value, onChange }: ChatInputProps) {
  const [internalInput, setInternalInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isControlled = value !== undefined
  const currentInput = isControlled ? value : internalInput

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e)
    } else {
      setInternalInput(e.target.value)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [currentInput])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!currentInput.trim() || disabled) return
    onSend(currentInput.trim())
    if (!isControlled) {
      setInternalInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-neutral-200 bg-white p-2">
      <textarea
        ref={textareaRef}
        value={currentInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none',
          'placeholder:text-neutral-400',
          disabled && 'opacity-50'
        )}
      />
      <button
        onClick={() => handleSubmit()}
        disabled={disabled || !currentInput.trim()}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
          currentInput.trim() && !disabled
            ? 'bg-neutral-900 text-white hover:bg-neutral-800'
            : 'bg-neutral-100 text-neutral-400'
        )}
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}
