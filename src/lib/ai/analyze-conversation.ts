import { GoogleGenerativeAI } from '@google/generative-ai'

export interface GeneratedTask {
    id: string
    title: string
    description: string
    suggestedRole: string
    priority: 'high' | 'medium' | 'low'
    estimatedComplexity: number
}

interface ConversationMessage {
    role: 'user' | 'assistant'
    content: string
    timestamp: number
}

/**
 * Analyze conversation transcript and extract actionable tasks
 * This runs entirely in the browser - API key never leaves the client
 */
export async function analyzeConversation(
    transcript: ConversationMessage[],
    apiKey: string,
    locale: 'zh' | 'en' = 'zh'
): Promise<GeneratedTask[]> {
    if (!apiKey) {
        console.warn('[analyzeConversation] No API key provided')
        return []
    }

    try {
        // Format conversation for analysis
        const conversationText = transcript
            .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
            .join('\n')

        const prompt = locale === 'zh'
            ? `分析这段对话，提取可执行的任务。**必须返回中文 JSON 格式的任务列表**。

对话内容：
${conversationText}

**重要要求**：
1. 所有任务的 title 和 description 必须用中文
2. 每个任务必须分配一个具体的 suggestedRole（不能为空）
3. suggestedRole 必须从以下角色中选择：产品经理、UI/UX设计师、前端工程师、后端工程师、全栈工程师、数据分析师、运营专员、市场营销、项目经理

请返回 JSON 数组，每个任务包含：
- title: 简短任务名称（中文）
- description: 详细描述（中文，1-2句话）
- suggestedRole: 适合的专业角色类型（必填，从上面列表选择）
- priority: high/medium/low
- estimatedComplexity: 1-10 的复杂度评分

只关注具体、可执行的任务。如果对话中没有明确的任务，返回空数组。

返回格式示例：
[
  {
    "title": "设计产品原型",
    "description": "创建移动应用的交互原型图，包含主要功能页面",
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
- suggestedRole: type of professional (e.g., Product Manager, Designer, Engineer) - REQUIRED
- priority: high/medium/low
- estimatedComplexity: complexity score 1-10

Focus on concrete, actionable items. If no clear tasks, return empty array.`

        // Call Gemini API directly from browser
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (!jsonMatch) {
            console.warn('[analyzeConversation] No valid JSON found in response')
            return []
        }

        const tasks = JSON.parse(jsonMatch[0]) as Omit<GeneratedTask, 'id'>[]

        // Add IDs to tasks
        const tasksWithIds: GeneratedTask[] = tasks.map((task, index) => ({
            ...task,
            id: `task-${Date.now()}-${index}`,
        }))

        return tasksWithIds
    } catch (error) {
        console.error('[analyzeConversation] Error:', error)
        return []
    }
}
