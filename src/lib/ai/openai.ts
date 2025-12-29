import { createOpenAI } from '@ai-sdk/openai'
import { streamText, generateText } from 'ai'
import type { AIProvider, ChatRequest } from './types'

export class OpenAIProvider implements AIProvider {
    private openai: ReturnType<typeof createOpenAI>
    private model: string

    constructor(apiKey: string, model?: string) {
        this.openai = createOpenAI({ apiKey })
        this.model = model || 'gpt-4o'
    }

    async chat(request: ChatRequest) {
        return generateText({
            model: this.openai(this.model),
            messages: request.messages as any,
            system: request.systemPrompt,
            maxOutputTokens: request.maxTokens,
            temperature: request.temperature,
        })
    }

    async streamChat(request: ChatRequest) {
        return streamText({
            model: this.openai(this.model),
            messages: request.messages as any,
            system: request.systemPrompt,
            maxOutputTokens: request.maxTokens,
            temperature: request.temperature,
        })
    }
}
