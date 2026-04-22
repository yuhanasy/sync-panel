export interface Integration {
  id: string
  name: string
  icon_url: string
  status: 'synced' | 'syncing' | 'conflict' | 'error'
  last_synced: string
  version: string
  total_records: number
  last_sync_duration: number
}

export interface VersionChange {
  id: string
  entity_type: string
  entity_id: string
  field_name: string
  change_type: 'ADD' | 'UPDATE' | 'DELETE'
  previous_value?: string
  new_value?: string
}

export interface HistoryEntry {
  id: string
  integration_id: string
  timestamp: string
  source: 'System' | 'User'
  version: string
  summary: string
  changes: VersionChange[]
}

export interface ConflictItem {
  id: string
  integration_id: string
  entity_type: string
  entity_id: string
  field_name: string
  local_value: string
  external_value: string
  resolution: 'local' | 'external' | null
}

export interface SyncChange {
  id: string
  field_name: string
  change_type: 'ADD' | 'UPDATE' | 'DELETE'
  current_value?: string
  new_value?: string
}
