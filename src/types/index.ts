export interface Integration {
  id: string
  name: string
  icon_url: string
  status: 'synced' | 'syncing' | 'conflict' | 'error' | 'pending_review'
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

export interface EnrichedChange {
  id: string
  entity_type: string
  entity_id: string
  field_name: string
  change_type: 'ADD' | 'UPDATE' | 'DELETE' | 'CONFLICT'
  current_value?: string
  new_value?: string
  // Only set when change_type === 'CONFLICT'
  local_value?: string
  external_value?: string
  resolution?: 'local' | 'external' | null
}

export interface SyncChange {
  id: string
  field_name: string
  change_type: 'ADD' | 'UPDATE' | 'DELETE'
  current_value?: string
  new_value?: string
}

export interface LocalUser {
  local_id: string
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  created_at: string
  updated_at: string
  dirty_fields: string[]
}

export interface LocalDoor {
  local_id: string
  id: string
  name: string
  location: string
  device_id: string
  status: string
  battery_level: string
  last_seen: string
  created_at: string
  dirty_fields: string[]
}

export interface LocalKey {
  local_id: string
  id: string
  user_id: string
  door_id: string
  key_type: string
  access_start: string
  access_end: string
  status: string
  created_at: string
  dirty_fields: string[]
}
