export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentId?: string
  timestamp: number
}

export interface Conversation {
  id: string
  agentId: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface ChatRequest {
  agentId: string
  message: string
  conversationId?: string
  projectContext?: string
}

export interface HandoffRequest {
  fromAgentId: string
  toAgentId: string
  summary: string
  conversationId: string
}
