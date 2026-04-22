import { create } from 'zustand'
import type { HistoryEntry } from '@/types'
import { mockHistory } from '@/data/history'

interface HistoryStore {
  entries: HistoryEntry[]
  addEntry: (entry: HistoryEntry) => void
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  entries: mockHistory,
  addEntry: (entry) =>
    set((state) => ({ entries: [entry, ...state.entries] })),
}))
