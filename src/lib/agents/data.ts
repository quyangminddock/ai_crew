import type { Department, DepartmentId, Agent } from '@/types/agent'

// Agent 定义 - 映射到 GitHub 仓库的 .md 文件
export const AGENTS: Agent[] = [
  // Product
  { id: 'sprint-prioritizer', name: { zh: '优先级规划师', en: 'Sprint Prioritizer' }, department: 'product', file: 'sprint-prioritizer.md' },
  { id: 'feedback-synthesizer', name: { zh: '反馈分析师', en: 'Feedback Synthesizer' }, department: 'product', file: 'feedback-synthesizer.md' },
  { id: 'trend-researcher', name: { zh: '趋势研究员', en: 'Trend Researcher' }, department: 'product', file: 'trend-researcher.md' },

  // Design
  { id: 'ui-designer', name: { zh: 'UI设计师', en: 'UI Designer' }, department: 'design', file: 'ui-designer.md' },
  { id: 'ux-researcher', name: { zh: 'UX研究员', en: 'UX Researcher' }, department: 'design', file: 'ux-researcher.md' },
  { id: 'brand-guardian', name: { zh: '品牌守护者', en: 'Brand Guardian' }, department: 'design', file: 'brand-guardian.md' },
  { id: 'visual-storyteller', name: { zh: '视觉叙事师', en: 'Visual Storyteller' }, department: 'design', file: 'visual-storyteller.md' },
  { id: 'whimsy-injector', name: { zh: '趣味注入师', en: 'Whimsy Injector' }, department: 'design', file: 'whimsy-injector.md' },

  // Engineering
  { id: 'frontend-developer', name: { zh: '前端开发', en: 'Frontend Developer' }, department: 'engineering', file: 'frontend-developer.md' },
  { id: 'backend-architect', name: { zh: '后端架构师', en: 'Backend Architect' }, department: 'engineering', file: 'backend-architect.md' },
  { id: 'rapid-prototyper', name: { zh: '快速原型师', en: 'Rapid Prototyper' }, department: 'engineering', file: 'rapid-prototyper.md' },
  { id: 'ai-engineer', name: { zh: 'AI工程师', en: 'AI Engineer' }, department: 'engineering', file: 'ai-engineer.md' },
  { id: 'devops-automator', name: { zh: 'DevOps工程师', en: 'DevOps Engineer' }, department: 'engineering', file: 'devops-automator.md' },
  { id: 'mobile-app-builder', name: { zh: '移动端开发', en: 'Mobile Developer' }, department: 'engineering', file: 'mobile-app-builder.md' },
  { id: 'test-writer-fixer', name: { zh: '测试修复师', en: 'Test Writer & Fixer' }, department: 'engineering', file: 'test-writer-fixer.md' },

  // Marketing
  { id: 'content-creator', name: { zh: '内容创作者', en: 'Content Creator' }, department: 'marketing', file: 'content-creator.md' },
  { id: 'growth-hacker', name: { zh: '增长黑客', en: 'Growth Hacker' }, department: 'marketing', file: 'growth-hacker.md' },
  { id: 'app-store-optimizer', name: { zh: 'ASO优化师', en: 'ASO Specialist' }, department: 'marketing', file: 'app-store-optimizer.md' },
  { id: 'twitter-engager', name: { zh: 'Twitter运营', en: 'Twitter Manager' }, department: 'marketing', file: 'twitter-engager.md' },
  { id: 'instagram-curator', name: { zh: 'Instagram策展人', en: 'Instagram Curator' }, department: 'marketing', file: 'instagram-curator.md' },
  { id: 'tiktok-strategist', name: { zh: 'TikTok策略师', en: 'TikTok Strategist' }, department: 'marketing', file: 'tiktok-strategist.md' },
  { id: 'reddit-community-builder', name: { zh: 'Reddit社区运营', en: 'Reddit Community Builder' }, department: 'marketing', file: 'reddit-community-builder.md' },

  // Project Management
  { id: 'project-shipper', name: { zh: '项目交付专家', en: 'Project Shipper' }, department: 'project-management', file: 'project-shipper.md' },
  { id: 'experiment-tracker', name: { zh: '实验追踪员', en: 'Experiment Tracker' }, department: 'project-management', file: 'experiment-tracker.md' },
  { id: 'studio-producer', name: { zh: '工作室制片人', en: 'Studio Producer' }, department: 'project-management', file: 'studio-producer.md' },

  // Studio Operations
  { id: 'analytics-reporter', name: { zh: '数据分析师', en: 'Analytics Reporter' }, department: 'studio-operations', file: 'analytics-reporter.md' },
  { id: 'finance-tracker', name: { zh: '财务跟踪员', en: 'Finance Tracker' }, department: 'studio-operations', file: 'finance-tracker.md' },
  { id: 'legal-compliance-checker', name: { zh: '合规检查员', en: 'Compliance Checker' }, department: 'studio-operations', file: 'legal-compliance-checker.md' },
  { id: 'support-responder', name: { zh: '客服响应专员', en: 'Support Responder' }, department: 'studio-operations', file: 'support-responder.md' },
  { id: 'infrastructure-maintainer', name: { zh: '基础设施维护员', en: 'Infrastructure Maintainer' }, department: 'studio-operations', file: 'infrastructure-maintainer.md' },

  // Testing
  { id: 'api-tester', name: { zh: 'API测试员', en: 'API Tester' }, department: 'testing', file: 'api-tester.md' },
  { id: 'performance-benchmarker', name: { zh: '性能基准测试员', en: 'Performance Benchmarker' }, department: 'testing', file: 'performance-benchmarker.md' },
  { id: 'test-results-analyzer', name: { zh: '测试结果分析师', en: 'Test Results Analyzer' }, department: 'testing', file: 'test-results-analyzer.md' },
  { id: 'tool-evaluator', name: { zh: '工具评估员', en: 'Tool Evaluator' }, department: 'testing', file: 'tool-evaluator.md' },
  { id: 'workflow-optimizer', name: { zh: '流程优化师', en: 'Workflow Optimizer' }, department: 'testing', file: 'workflow-optimizer.md' },

  // Bonus
  { id: 'joker', name: { zh: '气氛调节师', en: 'Team Joker' }, department: 'bonus', file: 'joker.md' },
  { id: 'studio-coach', name: { zh: '团队教练', en: 'Studio Coach' }, department: 'bonus', file: 'studio-coach.md' },
]

export const DEPARTMENTS: Department[] = [
  {
    id: 'product',
    name: { zh: '产品部', en: 'Product' },
    icon: '📋',
    avatar: '/avatars/product.png',
    agents: AGENTS.filter((a) => a.department === 'product'),
  },
  {
    id: 'design',
    name: { zh: '设计部', en: 'Design' },
    icon: '🎨',
    avatar: '/avatars/design.png',
    agents: AGENTS.filter((a) => a.department === 'design'),
  },
  {
    id: 'engineering',
    name: { zh: '工程部', en: 'Engineering' },
    icon: '💻',
    avatar: '/avatars/engineering.png',
    agents: AGENTS.filter((a) => a.department === 'engineering'),
  },
  {
    id: 'marketing',
    name: { zh: '市场部', en: 'Marketing' },
    icon: '📢',
    avatar: '/avatars/marketing.png',
    agents: AGENTS.filter((a) => a.department === 'marketing'),
  },
  {
    id: 'project-management',
    name: { zh: '项目部', en: 'Project' },
    icon: '📅',
    avatar: '/avatars/project-management.png',
    agents: AGENTS.filter((a) => a.department === 'project-management'),
  },
  {
    id: 'studio-operations',
    name: { zh: '运营部', en: 'Operations' },
    icon: '🏠',
    avatar: '/avatars/studio-operations.png',
    agents: AGENTS.filter((a) => a.department === 'studio-operations'),
  },
  {
    id: 'testing',
    name: { zh: '测试部', en: 'Testing' },
    icon: '🧪',
    avatar: '/avatars/testing.png',
    agents: AGENTS.filter((a) => a.department === 'testing'),
  },
  {
    id: 'bonus',
    name: { zh: '特别组', en: 'Bonus' },
    icon: '⭐',
    avatar: '/avatars/bonus.png',
    agents: AGENTS.filter((a) => a.department === 'bonus'),
  },
]

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id)
}

export function getDepartmentById(id: DepartmentId): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id)
}

export function getAgentsByDepartment(departmentId: DepartmentId): Agent[] {
  return AGENTS.filter((a) => a.department === departmentId)
}
