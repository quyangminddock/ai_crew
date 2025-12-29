export interface Project {
  id: string
  name: string
  description: string
  targetUsers?: string
  problemToSolve?: string
  createdAt: number
  updatedAt: number
}

export interface ProjectContext {
  project: Project
  summaries: AgentSummary[]
}

export interface AgentSummary {
  agentId: string
  summary: string
  timestamp: number
}
