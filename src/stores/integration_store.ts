import { create } from 'zustand'
import type { Integration, SyncChange } from '@/types'
import { mockIntegrations } from '@/data/integrations'

interface IntegrationStore {
  integrations: Integration[]
  selected_id: string | null
  pending_changes: SyncChange[]
  setSelected: (id: string | null) => void
  setPendingChanges: (changes: SyncChange[]) => void
  updateStatus: (id: string, status: Integration['status']) => void
  bumpVersion: (id: string) => void
}

export const useIntegrationStore = create<IntegrationStore>((set) => ({
  integrations: mockIntegrations,
  selected_id: null,
  pending_changes: [],
  setSelected: (id) => set({ selected_id: id }),
  setPendingChanges: (changes) => set({ pending_changes: changes }),
  updateStatus: (id, status) =>
    set((state) => ({
      integrations: state.integrations.map((i) =>
        i.id === id ? { ...i, status } : i
      ),
    })),
  bumpVersion: (id) =>
    set((state) => ({
      integrations: state.integrations.map((i) => {
        if (i.id !== id) return i
        const parts = i.version.split('.').map(Number)
        parts[2] = (parts[2] ?? 0) + 1
        return { ...i, version: parts.join('.'), last_synced: new Date().toISOString() }
      }),
    })),
}))
