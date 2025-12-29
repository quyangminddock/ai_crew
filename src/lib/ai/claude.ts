import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText, generateText } from 'ai'
import type { AIProvider, ChatRequest } from './types'

export class ClaudeProvider implements AIProvider {
  private anthropic: ReturnType<typeof createAnthropic>

  constructor(apiKey: string) {
    this.anthropic = createAnthropic({ apiKey })
  }

  async chat(request: ChatRequest) {
    return generateText({
      model: this.anthropic('claude-3-5-sonnet-20241022'),
      messages: request.messages as any,
      system: request.systemPrompt,
      maxOutputTokens: request.maxTokens,
      temperature: request.temperature,
    })
  }

  async streamChat(request: ChatRequest) {
    return streamText({
      model: this.anthropic('claude-3-5-sonnet-20241022'),
      messages: request.messages as any,
      system: request.systemPrompt,
      maxOutputTokens: request.maxTokens,
      temperature: request.temperature,
    })
  }
}
