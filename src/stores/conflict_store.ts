import { create } from 'zustand'
import type { ConflictItem } from '@/types'
import { mockConflicts } from '@/data/conflicts'

interface ConflictStore {
  items: ConflictItem[]
  resolve: (id: string, resolution: 'local' | 'external') => void
  resolveAll: (integration_id: string, resolution: 'local' | 'external') => void
  clearResolved: (integration_id: string) => void
}

export const useConflictStore = create<ConflictStore>((set) => ({
  items: mockConflicts,
  resolve: (id, resolution) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, resolution } : item
      ),
    })),
  resolveAll: (integration_id, resolution) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.integration_id === integration_id ? { ...item, resolution } : item
      ),
    })),
  clearResolved: (integration_id) =>
    set((state) => ({
      items: state.items.filter((item) => item.integration_id !== integration_id),
    })),
}))
