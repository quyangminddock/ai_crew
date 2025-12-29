// Available models for each AI provider

export type AIModel = {
    id: string
    name: string
    provider: 'deepseek' | 'claude' | 'openai' | 'gemini'
    description?: string
}

export const AI_MODELS: Record<string, AIModel[]> = {
    deepseek: [
        { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', description: 'Fast and efficient' },
    ],
    claude: [
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'claude', description: 'Most capable' },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'claude', description: 'Fast and affordable' },
    ],
    openai: [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Most capable' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', description: 'Fast and affordable' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', description: 'Previous generation' },
    ],
    gemini: [
        { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'gemini', description: 'Latest with Live API' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', description: 'Most capable' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', description: 'Fast and efficient' },
    ],
}

export function getModelsForProvider(provider: string): AIModel[] {
    return AI_MODELS[provider] || []
}

export function getDefaultModelForProvider(provider: string): string {
    const models = getModelsForProvider(provider)
    return models[0]?.id || ''
}

export function getProviderFromModelId(modelId: string): string | undefined {
    for (const [provider, models] of Object.entries(AI_MODELS)) {
        if (models.some(m => m.id === modelId)) {
            return provider
        }
    }
    return undefined
}
