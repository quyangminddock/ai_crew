import { NextRequest, NextResponse } from 'next/server'
import { createAIProvider, type ProviderType } from '@/lib/ai'
import { loadAgentDefinition } from '@/lib/agents/loader'
import { getAgentById, AGENTS } from '@/lib/agents/data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, message, apiKey, provider, model, conversationHistory } = body

    if (!agentId || !message || !apiKey || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get agent info
    console.log(`[Chat API] Received request for agentId: ${agentId}`)
    const agent = getAgentById(agentId)

    if (!agent) {
      console.error(`[Chat API] Agent not found for id: ${agentId}`)
      return NextResponse.json(
        { error: `Agent with ID '${agentId}' not found` },
        { status: 404 }
      )
    }

    // Load agent definition from GitHub
    console.log(`[Chat API] Loading agent definition for ${agent.department}/${agent.file}`)
    const agentDef = await loadAgentDefinition(agent.department, agent.file)
    console.log(`[Chat API] Agent definition loaded:`, agentDef ? 'success' : 'null')

    // Create AI provider with optional model
    console.log(`[Chat API] Creating AI provider: ${provider} with model: ${model || 'default'}`)
    const aiProvider = createAIProvider(provider as ProviderType, apiKey, model)

    // Build messages array
    const messages = conversationHistory || []
    messages.push({ role: 'user' as const, content: message })
    console.log(`[Chat API] Messages count: ${messages.length}`)

    // Available roles for task assignment context
    const availableRoles = AGENTS.map(a => `${a.id} (${a.name.en})`).join(', ')

    // Call AI without streaming (get complete response)
    console.log(`[Chat API] Calling AI provider...`)
    const result = await aiProvider.chat({
      systemPrompt: (agentDef?.systemPrompt || `You are a helpful ${agent.name.en}. Be concise and helpful.`) +
        `\n\nAvailable team members for task delegation: ${availableRoles}`,
      messages,
    })
    console.log(`[Chat API] AI response received, length: ${result.text?.length || 0}`)

    // Return the complete text
    return NextResponse.json({
      content: result.text,
      usage: result.usage,
    })

  } catch (error) {
    console.error('[Chat API] Error occurred:', error)
    console.error('[Chat API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('[Chat API] Returning error to client:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
