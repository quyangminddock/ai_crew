export interface Agent {
  id: string
  name: {
    zh: string
    en: string
  }
  department: DepartmentId
  file: string
  description?: {
    zh: string
    en: string
  }
  greeting?: {
    zh: string
    en: string
  }
}

export type DepartmentId =
  | 'product'
  | 'design'
  | 'engineering'
  | 'marketing'
  | 'project-management'
  | 'studio-operations'
  | 'testing'
  | 'bonus'

export interface Department {
  id: DepartmentId
  name: {
    zh: string
    en: string
  }
  icon: string
  avatar: string // Path to 3D avatar image
  agents: Agent[]
}

export type AgentStatus = 'idle' | 'working' | 'completed'

export interface AgentTask {
  agentId: string
  status: AgentStatus
  progress?: number
  summary?: string
}
