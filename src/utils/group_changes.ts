import type { EnrichedChange } from '@/types'

/**
 * Groups a flat EnrichedChange[] into a two-level Map:
 *   Map<entity_type, Map<entity_id, EnrichedChange[]>>
 *
 * Preserves insertion order (array order = change array order).
 */
export function groupChanges(
  changes: EnrichedChange[],
): Map<string, Map<string, EnrichedChange[]>> {
  const byType = new Map<string, Map<string, EnrichedChange[]>>()

  for (const change of changes) {
    if (!byType.has(change.entity_type)) {
      byType.set(change.entity_type, new Map())
    }
    const byId = byType.get(change.entity_type)!

    if (!byId.has(change.entity_id)) {
      byId.set(change.entity_id, [])
    }
    byId.get(change.entity_id)!.push(change)
  }

  return byType
}
