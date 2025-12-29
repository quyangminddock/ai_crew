import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message, Conversation } from '@/types/chat'
import type { AgentTask } from '@/types/agent'
import { generateId } from '@/lib/utils'

interface ChatState {
  conversations: Record<string, Conversation>
  activeTasks: AgentTask[]
  activeAgentId: string | null

  // Conversation actions
  getOrCreateConversation: (agentId: string) => Conversation
  addMessage: (agentId: string, message: Omit<Message, 'id' | 'timestamp'>) => string // Returns message ID
  updateMessage: (agentId: string, messageId: string, content: string) => void
  clearConversation: (agentId: string) => void

  // Task actions
  setActiveAgent: (agentId: string | null) => void
  startTask: (agentId: string) => void
  updateTaskProgress: (agentId: string, progress: number) => void
  completeTask: (agentId: string, summary?: string) => void
  cancelTask: (agentId: string) => void

  // Get active tasks count
  getActiveTasksCount: () => number
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: {},
      activeTasks: [],
      activeAgentId: null,

      getOrCreateConversation: (agentId) => {
        const { conversations } = get()
        if (conversations[agentId]) {
          return conversations[agentId]
        }

        const newConversation: Conversation = {
          id: generateId(),
          agentId,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        set((state) => ({
          conversations: {
            ...state.conversations,
            [agentId]: newConversation,
          },
        }))

        return newConversation
      },

      addMessage: (agentId, message) => {
        const conversation = get().getOrCreateConversation(agentId)
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        }

        set((state) => ({
          conversations: {
            ...state.conversations,
            [agentId]: {
              ...conversation,
              messages: [...conversation.messages, newMessage],
              updatedAt: Date.now(),
            },
          },
        }))

        return newMessage.id
      },

      updateMessage: (agentId, messageId, content) => {
        set((state) => {
          const conversation = state.conversations[agentId]
          if (!conversation) return state

          return {
            conversations: {
              ...state.conversations,
              [agentId]: {
                ...conversation,
                messages: conversation.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, content } : msg
                ),
                updatedAt: Date.now(),
              },
            },
          }
        })
      },

      clearConversation: (agentId) => {
        set((state) => {
          const { [agentId]: _, ...rest } = state.conversations
          return { conversations: rest }
        })
      },

      setActiveAgent: (agentId) => set({ activeAgentId: agentId }),

      startTask: (agentId) => {
        set((state) => {
          // 检查是否已经有这个任务
          const existing = state.activeTasks.find((t) => t.agentId === agentId)
          if (existing) {
            return {
              activeTasks: state.activeTasks.map((t) =>
                t.agentId === agentId ? { ...t, status: 'working' as const, progress: 0 } : t
              ),
            }
          }

          return {
            activeTasks: [
              ...state.activeTasks,
              { agentId, status: 'working' as const, progress: 0 },
            ],
          }
        })
      },

      updateTaskProgress: (agentId, progress) => {
        set((state) => ({
          activeTasks: state.activeTasks.map((t) =>
            t.agentId === agentId ? { ...t, progress } : t
          ),
        }))
      },

      completeTask: (agentId, summary) => {
        set((state) => ({
          activeTasks: state.activeTasks.map((t) =>
            t.agentId === agentId
              ? { ...t, status: 'completed' as const, progress: 100, summary }
              : t
          ),
        }))
      },

      cancelTask: (agentId) => {
        set((state) => ({
          activeTasks: state.activeTasks.filter((t) => t.agentId !== agentId),
        }))
      },

      getActiveTasksCount: () => {
        return get().activeTasks.filter((t) => t.status === 'working').length
      },
    }),
    {
      name: 'crew-chat',
      partialize: (state) => ({
        conversations: state.conversations,
      }),
    }
  )
)
