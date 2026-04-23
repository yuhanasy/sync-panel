import type { VersionChange } from '@/types'

export interface ChangeStats {
  added: number
  updated: number
  deleted: number
  total: number
}

export function calcChangeStats(changes: VersionChange[]): ChangeStats {
  return {
    added: changes.filter((c) => c.change_type === 'ADD').length,
    updated: changes.filter((c) => c.change_type === 'UPDATE').length,
    deleted: changes.filter((c) => c.change_type === 'DELETE').length,
    total: changes.length,
  }
}
