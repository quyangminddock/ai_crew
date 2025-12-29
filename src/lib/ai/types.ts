import { StreamTextResult, GenerateTextResult, ToolSet } from 'ai'

// AI SDK v6 uses a flexible message format
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
}

export interface ChatRequest {
  messages: Message[]
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  tools?: ToolSet
}

export interface AIProvider {
  chat(request: ChatRequest): Promise<GenerateTextResult<any, any>>
  streamChat(request: ChatRequest): Promise<StreamTextResult<any, any>>
}

// Live Session Types
export type LiveSessionMode = 'video' | 'audio' | 'text'

export interface LiveSessionConfig {
  mode: LiveSessionMode
  agentId: string
  apiKey: string
  systemPrompt?: string
}

export interface MediaStreamConfig {
  video?: boolean
  audio?: boolean
}
