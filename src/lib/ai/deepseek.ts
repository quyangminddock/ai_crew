import { createOpenAI } from '@ai-sdk/openai'
import { streamText, generateText } from 'ai'
import type { AIProvider, ChatRequest } from './types'

export class DeepSeekProvider implements AIProvider {
  private deepseek: ReturnType<typeof createOpenAI>

  constructor(apiKey: string) {
    // Explicitly add /v1 suffix as recent SDK versions might behavior differently
    this.deepseek = createOpenAI({
      baseURL: 'https://api.deepseek.com/v1',
      apiKey,
    })
  }

  async chat(request: ChatRequest) {
    try {
      const config: any = {
        model: this.deepseek.chat('deepseek-chat'),
        messages: request.messages as any,
        system: request.systemPrompt,
      }

      // 只在有值时才添加可选参数
      if (request.maxTokens !== undefined) {
        config.maxOutputTokens = request.maxTokens
      }
      if (request.temperature !== undefined) {
        config.temperature = request.temperature
      }

      return await generateText(config)
    } catch (error) {
      console.error('[DeepSeek] Chat error:', error)
      throw new Error(`DeepSeek API错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async streamChat(request: ChatRequest) {
    try {
      const config: any = {
        model: this.deepseek('deepseek-chat'),
        messages: request.messages as any,
        system: request.systemPrompt,
      }

      // 只在有值时才添加可选参数
      if (request.maxTokens !== undefined) {
        config.maxOutputTokens = request.maxTokens
      }
      if (request.temperature !== undefined) {
        config.temperature = request.temperature
      }

      return await streamText(config)
    } catch (error) {
      console.error('[DeepSeek] Stream chat error:', error)
      throw new Error(`DeepSeek API错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}
