'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Message } from '@/types/chat'

interface ChatMessageProps {
  message: Message
  agentName?: string
  agentAvatar?: string
  departmentId?: string
}

export function ChatMessage({ message, agentName, agentAvatar, departmentId }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm overflow-hidden',
          isUser ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200'
        )}
      >
        {isUser ? (
          '你'
        ) : agentAvatar ? (
          <Image
            src={agentAvatar}
            alt={agentName || 'AI'}
            width={32}
            height={32}
            className="object-cover"
          />
        ) : (
          '🤖'
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {!isUser && agentName && (
          <span className="text-sm text-neutral-700 font-medium">{agentName}</span>
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-base',
            isUser
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-50 text-neutral-900 border border-neutral-200'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-neutral">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Customize markdown rendering
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ inline, children, ...props }: any) =>
                    inline ? (
                      <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="block rounded bg-neutral-200 p-2 text-xs font-mono overflow-x-auto" {...props}>
                        {children}
                      </code>
                    ),
                  pre: ({ children }) => <pre className="mb-2 overflow-x-auto">{children}</pre>,
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-sm text-neutral-400">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}
