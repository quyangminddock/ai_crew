import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WorkspaceState {
    activeAgentIds: string[]
    selectedAgentId: string | null

    addAgent: (agentId: string) => void
    removeAgent: (agentId: string) => void
    setSelectedAgentId: (agentId: string | null) => void
    clearWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            activeAgentIds: [],
            selectedAgentId: null,

            addAgent: (agentId) => {
                const { activeAgentIds } = get()
                if (!activeAgentIds.includes(agentId)) {
                    set({
                        activeAgentIds: [...activeAgentIds, agentId],
                        selectedAgentId: agentId
                    })
                } else {
                    set({ selectedAgentId: agentId })
                }
            },

            removeAgent: (agentId) => {
                const { activeAgentIds, selectedAgentId } = get()
                const newIds = activeAgentIds.filter(id => id !== agentId)

                let newSelected = selectedAgentId
                if (selectedAgentId === agentId) {
                    newSelected = newIds.length > 0 ? newIds[newIds.length - 1] : null
                }

                set({
                    activeAgentIds: newIds,
                    selectedAgentId: newSelected
                })
            },

            setSelectedAgentId: (agentId) => set({ selectedAgentId: agentId }),

            clearWorkspace: () => set({ activeAgentIds: [], selectedAgentId: null }),
        }),
        {
            name: 'crew-workspace',
        }
    )
)
