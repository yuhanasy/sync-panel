import type { SyncChange, LocalUser, LocalDoor, LocalKey } from '@/types'

export interface DetectedConflict {
  id: string
  field_name: string
  entity_type: string
  local_id: string
  local_value: string
  external_value: string
}

export interface ConflictDetectionContext {
  users: LocalUser[]
  doors: LocalDoor[]
  keys: LocalKey[]
}

export function detectConflicts(
  changes: SyncChange[],
  context: ConflictDetectionContext,
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = []

  for (const change of changes) {
    const [entityType, fieldName] = change.field_name.split('.')

    if (change.change_type === 'ADD') {
      continue
    }

    if (change.change_type === 'DELETE') {
      continue
    }

    if (change.change_type === 'UPDATE') {
      const conflict = detectUpdateConflict(
        change,
        entityType,
        fieldName,
        context,
      )
      if (conflict) {
        conflicts.push(conflict)
      }
    }
  }

  return conflicts
}

function detectUpdateConflict(
  change: SyncChange,
  entityType: string,
  fieldName: string,
  context: ConflictDetectionContext,
): DetectedConflict | null {
  let entities: (LocalUser | LocalDoor | LocalKey)[] = []

  if (entityType === 'user') {
    entities = context.users
  } else if (entityType === 'door') {
    entities = context.doors
  } else if (entityType === 'key') {
    entities = context.keys
  } else {
    return null
  }

  let targetEntity: LocalUser | LocalDoor | LocalKey | undefined

  if (change.current_value) {
    targetEntity = entities.find((e) => {
      const val = e[fieldName as keyof typeof e]
      return val === change.current_value
    })
  }

  if (!targetEntity) {
    const nextIdx = Math.max(...entities.map((e) => {
      const id = e.local_id
      const num = parseInt(id.split('_')[1], 10)
      return isNaN(num) ? -1 : num
    }), -1)

    targetEntity = entities[nextIdx + 1]
  }

  if (!targetEntity) {
    return null
  }

  if (!targetEntity.dirty_fields.includes(fieldName)) {
    return null
  }

  const localValue = String(targetEntity[fieldName as keyof typeof targetEntity] ?? '')
  const externalValue = change.new_value ?? ''

  if (localValue === externalValue) {
    return null
  }

  return {
    id: `conflict-${targetEntity.local_id}-${fieldName}`,
    field_name: change.field_name,
    entity_type: entityType,
    local_id: targetEntity.local_id,
    local_value: localValue,
    external_value: externalValue,
  }
}
