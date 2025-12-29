import { DeepSeekProvider } from './deepseek'
import { ClaudeProvider } from './claude'
import { OpenAIProvider } from './openai'
import { GeminiProvider } from './gemini'
import type { AIProvider, ChatRequest } from './types'

export type { ChatRequest, AIProvider }

export type ProviderType = 'deepseek' | 'claude' | 'openai' | 'gemini' | 'auto'

export function createAIProvider(
  provider: ProviderType,
  apiKey: string,
  model?: string
): AIProvider {
  switch (provider) {
    case 'deepseek':
      return new DeepSeekProvider(apiKey)
    case 'claude':
      return new ClaudeProvider(apiKey)
    case 'openai':
      return new OpenAIProvider(apiKey, model)
    case 'gemini':
      return new GeminiProvider(apiKey, model as any)
    default:
      // Default to DeepSeek
      return new DeepSeekProvider(apiKey)
  }
}
