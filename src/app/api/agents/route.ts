import { NextResponse } from 'next/server'
import { AGENTS, DEPARTMENTS } from '@/lib/agents/data'

export async function GET() {
  return NextResponse.json({
    agents: AGENTS,
    departments: DEPARTMENTS,
  })
}
