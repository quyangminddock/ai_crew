const REPO_BASE = 'https://raw.githubusercontent.com/contains-studio/agents/main'

// 缓存 agent 定义
const agentCache = new Map<string, { content: string; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

export interface AgentDefinition {
  id: string
  department: string
  rawContent: string
  systemPrompt: string
}

function departmentToPath(department: string): string {
  return department
}

export async function loadAgentDefinition(
  department: string,
  file: string
): Promise<AgentDefinition | null> {
  const cacheKey = `${department}/${file}`

  // Check cache
  const cached = agentCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return parseAgentContent(department, file, cached.content)
  }

  try {
    const path = departmentToPath(department)
    const url = `${REPO_BASE}/${path}/${file}`
    const response = await fetch(url, { next: { revalidate: 1800 } })

    if (!response.ok) {
      console.error(`Failed to load agent: ${url}`)
      return null
    }

    const content = await response.text()

    // Update cache
    agentCache.set(cacheKey, { content, timestamp: Date.now() })

    return parseAgentContent(department, file, content)
  } catch (error) {
    console.error(`Error loading agent ${department}/${file}:`, error)
    return null
  }
}

function parseAgentContent(
  department: string,
  file: string,
  content: string
): AgentDefinition {
  const id = file.replace('.md', '')

  // 将 markdown 内容转换为 system prompt
  // 可以根据需要做更多解析
  const systemPrompt = content

  return {
    id,
    department,
    rawContent: content,
    systemPrompt,
  }
}

// 预加载所有 agent 定义（可选，用于优化）
export async function preloadAgents(
  agents: Array<{ department: string; file: string }>
): Promise<void> {
  await Promise.all(
    agents.map(({ department, file }) => loadAgentDefinition(department, file))
  )
}
