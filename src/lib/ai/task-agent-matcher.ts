import { getAgentById } from '@/lib/agents/data'

export interface GeneratedTask {
    id: string
    title: string
    description: string
    suggestedRole: string
    priority: 'high' | 'medium' | 'low'
    estimatedComplexity: number
}

export interface TaskWithAgent extends GeneratedTask {
    matchedAgentId: string
    matchConfidence: number
}

/**
 * Match generated task to best-fit agent from available agents
 */
export function matchTaskToAgent(task: GeneratedTask): {
    agentId: string
    confidence: number
} {
    // Simple keyword-based matching
    // Map task role keywords to agent IDs
    const roleMapping: Record<string, string[]> = {
        // Product & Strategy
        'product-manager': ['product', 'roadmap', 'strategy', '产品', '路线图', '战略'],
        'trend-researcher': ['trend', 'research', 'analysis', '趋势', '研究', '分析'],

        //Design
        'ui-designer': ['ui', 'design', 'interface', 'wireframe', '界面', '设计', '原型'],
        'ux-researcher': ['ux', 'user experience', 'usability', '用户体验', '可用性'],

        // Engineering
        'full-stack-dev': ['full-stack', 'development', 'code', 'implement', '开发', '编码'],
        'solutions-architect': ['architecture', 'technical', 'system design', '架构', '技术', '系统设计'],
        'devops-engineer': ['devops', 'deployment', 'infrastructure', '部署', '基础设施'],

        // Marketing & Content
        'marketing-specialist': ['marketing', 'campaign', 'promotion', '营销', '推广', '活动'],
        'content-creator': ['content', 'copywriting', 'writing', '内容', '文案', '写作'],
        'seo-specialist': ['seo', 'search', 'optimization', 'SEO', '搜索', '优化'],

        // Business
        'data-analyst': ['data', 'analytics', 'metrics', '数据', '分析', '指标'],
        'finance-advisor': ['finance', 'budget', 'cost', '财务', '预算', '成本'],
    }

    const taskText = `${task.title} ${task.description} ${task.suggestedRole}`.toLowerCase()

    let bestMatch = { agentId: 'product-manager', confidence: 0.3 } // Default fallback

    for (const [agentId, keywords] of Object.entries(roleMapping)) {
        let matchScore = 0
        for (const keyword of keywords) {
            if (taskText.includes(keyword.toLowerCase())) {
                matchScore += 1
            }
        }

        const confidence = Math.min(matchScore / keywords.length + 0.3, 1.0)

        if (confidence > bestMatch.confidence) {
            const agent = getAgentById(agentId)
            if (agent) {
                bestMatch = { agentId, confidence }
            }
        }
    }

    return bestMatch
}

/**
 * Match multiple tasks to agents in batch
 */
export function matchTasksToAgents(tasks: GeneratedTask[]): TaskWithAgent[] {
    return tasks.map(task => {
        const match = matchTaskToAgent(task)
        return {
            ...task,
            matchedAgentId: match.agentId,
            matchConfidence: match.confidence,
        }
    })
}
