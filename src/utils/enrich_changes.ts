import type { SyncChange, EnrichedChange, LocalUser, LocalDoor, LocalKey } from '@/types'

export interface EnrichContext {
  users: LocalUser[]
  doors: LocalDoor[]
  keys: LocalKey[]
}

type LocalEntity = LocalUser | LocalDoor | LocalKey

function getEntities(entityType: string, context: EnrichContext): LocalEntity[] {
  if (entityType === 'user') return context.users
  if (entityType === 'door') return context.doors
  if (entityType === 'key') return context.keys
  return []
}

function getNextLocalId(entityType: string, context: EnrichContext, addIndexOffset: number): string {
  const entities = getEntities(entityType, context)
  const max = Math.max(
    ...entities.map((e) => {
      const num = parseInt(e.local_id.split('_')[1], 10)
      return isNaN(num) ? -1 : num
    }),
    -1,
  )
  return `${entityType}_${max + 1 + addIndexOffset}`
}

/**
 * Enriches a flat SyncChange[] into EnrichedChange[], resolving entity_id
 * and classifying each change as ADD | UPDATE | DELETE | CONFLICT.
 *
 * Entity ID resolution order:
 *   UPDATE / DELETE (primary)  — find entity where entity[field] === current_value
 *   UPDATE / DELETE (fallback) — first entity (by local_id order) whose field
 *                                hasn't been claimed by an earlier change in this pass
 *   ADD                        — {entityType}_{maxLocalIndex + 1 + addOffset}
 *
 * CONFLICT classification:
 *   change_type === UPDATE
 *   && entity.dirty_fields includes fieldName
 *   && entity[field] !== new_value
 */
export function enrichChanges(
  changes: SyncChange[],
  context: EnrichContext,
): EnrichedChange[] {
  // Track which entity_ids have been claimed per field to support fallback resolution
  const claimedSlots = new Map<string, Set<string>>()
  // Track how many ADD changes we've seen per entity type (for sequential ID assignment)
  const addOffsets = new Map<string, number>()

  const result: EnrichedChange[] = []

  for (const change of changes) {
    const [entityType, fieldName] = change.field_name.split('.') as [string, string]
    const entities = getEntities(entityType, context)
    const claimKey = `${entityType}.${fieldName}`

    if (!claimedSlots.has(claimKey)) claimedSlots.set(claimKey, new Set())
    const claimed = claimedSlots.get(claimKey)!

    // ── ADD ──────────────────────────────────────────────────────────────────
    if (change.change_type === 'ADD') {
      const offset = addOffsets.get(entityType) ?? 0
      const entity_id = getNextLocalId(entityType, context, offset)
      addOffsets.set(entityType, offset + 1)

      result.push({
        id: change.id,
        entity_type: entityType,
        entity_id,
        field_name: change.field_name,
        change_type: 'ADD',
        current_value: change.current_value,
        new_value: change.new_value,
      })
      continue
    }

    // ── UPDATE / DELETE — resolve entity_id ──────────────────────────────────
    let targetEntity: LocalEntity | undefined

    // Primary: match by current_value
    if (change.current_value !== undefined) {
      targetEntity = entities.find((e) => {
        const val = e[fieldName as keyof typeof e]
        return String(val) === change.current_value && !claimed.has(e.local_id)
      })
    }

    // Fallback: first entity (by array order = local_id order) whose field isn't claimed
    if (!targetEntity) {
      targetEntity = entities.find((e) => !claimed.has(e.local_id))
    }

    if (!targetEntity) {
      // Cannot resolve — emit as-is with unknown id
      result.push({
        id: change.id,
        entity_type: entityType,
        entity_id: 'unknown',
        field_name: change.field_name,
        change_type: change.change_type,
        current_value: change.current_value,
        new_value: change.new_value,
      })
      continue
    }

    claimed.add(targetEntity.local_id)

    // ── DELETE ───────────────────────────────────────────────────────────────
    if (change.change_type === 'DELETE') {
      result.push({
        id: change.id,
        entity_type: entityType,
        entity_id: targetEntity.local_id,
        field_name: change.field_name,
        change_type: 'DELETE',
        current_value: change.current_value,
        new_value: change.new_value,
      })
      continue
    }

    // ── UPDATE — check for CONFLICT ──────────────────────────────────────────
    const isDirty = targetEntity.dirty_fields.includes(fieldName)
    const localValue = String(targetEntity[fieldName as keyof typeof targetEntity] ?? '')
    const externalValue = change.new_value ?? ''
    const isConflict = isDirty && localValue !== externalValue

    if (isConflict) {
      result.push({
        id: change.id,
        entity_type: entityType,
        entity_id: targetEntity.local_id,
        field_name: change.field_name,
        change_type: 'CONFLICT',
        current_value: change.current_value,
        new_value: change.new_value,
        local_value: localValue,
        external_value: externalValue,
        resolution: null,
      })
    } else {
      result.push({
        id: change.id,
        entity_type: entityType,
        entity_id: targetEntity.local_id,
        field_name: change.field_name,
        change_type: 'UPDATE',
        current_value: change.current_value,
        new_value: change.new_value,
      })
    }
  }

  return result
}
