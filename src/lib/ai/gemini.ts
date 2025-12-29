import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText, generateText } from 'ai'
import type { AIProvider, ChatRequest } from './types'

export type GeminiModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash-exp'

export const GEMINI_MODELS: { id: GeminiModel; name: string; description: string }[] = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable' },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: 'Latest with Live API support' },
]

export class GeminiProvider implements AIProvider {
    private google: ReturnType<typeof createGoogleGenerativeAI>
    private model: GeminiModel

    constructor(apiKey: string, model: GeminiModel = 'gemini-1.5-flash') {
        this.google = createGoogleGenerativeAI({ apiKey })
        this.model = model
    }

    async chat(request: ChatRequest) {
        return generateText({
            model: this.google(this.model),
            messages: request.messages as any,
            system: request.systemPrompt,
            maxOutputTokens: request.maxTokens,
            temperature: request.temperature,
            tools: request.tools,
        })
    }

    async streamChat(request: ChatRequest) {
        return streamText({
            model: this.google(this.model),
            messages: request.messages as any,
            system: request.systemPrompt,
            maxOutputTokens: request.maxTokens,
            temperature: request.temperature,
            tools: request.tools,
        })
    }
}
