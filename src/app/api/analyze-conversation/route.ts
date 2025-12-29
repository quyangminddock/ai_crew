import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'edge'

interface TaskBreakdownRequest {
    transcript: Array<{
        role: 'user' | 'assistant'
        content: string
        timestamp: number
    }>
    apiKey: string  // Required: user's Gemini API key
    locale?: 'zh' | 'en'
}

interface GeneratedTask {
    id: string
    title: string
    description: string
    suggestedRole: string
    priority: 'high' | 'medium' | 'low'
    estimatedComplexity: number
}

export async function POST(req: NextRequest) {
    try {
        const { transcript, apiKey, locale = 'zh' } = (await req.json()) as TaskBreakdownRequest

        if (!apiKey) {
            console.warn('[API] No API key provided, returning empty tasks')
            return NextResponse.json({ tasks: [] })
        }

        // Format conversation for analysis
        const conversationText = transcript
            .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
            .join('\n')

        const prompt = locale === 'zh'
            ? `分析这段对话，提取可执行的任务。返回 JSON 格式的任务列表。

对话内容：
${conversationText}

请返回 JSON 数组，每个任务包含：
- title: 简短任务名称
- description: 详细描述（1-2句话）
- suggestedRole: 适合的专业角色类型（如：产品经理、设计师、工程师等）
- priority: high/medium/low
- estimatedComplexity: 1-10 的复杂度评分

只关注具体、可执行的任务。如果对话中没有明确的任务，返回空数组。

返回格式示例：
[
  {
    "title": "设计产品原型",
    "description": "创建移动应用的交互原型图",
    "suggestedRole": "UI/UX设计师",
    "priority": "high",
    "estimatedComplexity": 7
  }
]`
            : `Analyze this conversation and extract actionable tasks. Return a JSON array.

Conversation:
${conversationText}

Return JSON array with each task containing:
- title: brief task name
- description: detailed description (1-2 sentences)
- suggestedRole: type of professional (e.g., Product Manager, Designer, Engineer)
- priority: high/medium/low
- estimatedComplexity: complexity score 1-10

Focus on concrete, actionable items. If no clear tasks, return empty array.`

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (!jsonMatch) {
            return NextResponse.json({ tasks: [] })
        }

        const tasks = JSON.parse(jsonMatch[0]) as Omit<GeneratedTask, 'id'>[]

        // Add IDs to tasks
        const tasksWithIds: GeneratedTask[] = tasks.map((task, index) => ({
            ...task,
            id: `task-${Date.now()}-${index}`,
        }))

        return NextResponse.json({ tasks: tasksWithIds })
    } catch (error) {
        console.error('[API] Task breakdown error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze conversation', tasks: [] },
            { status: 500 }
        )
    }
}
