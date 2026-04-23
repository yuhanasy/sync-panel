type Groupable = { entity_type: string; entity_id: string }

/**
 * Groups a flat array into a two-level Map:
 *   Map<entity_type, Map<entity_id, T[]>>
 *
 * Preserves insertion order (array order = change array order).
 */
export function groupChanges<T extends Groupable>(
  changes: T[],
): Map<string, Map<string, T[]>> {
  const byType = new Map<string, Map<string, T[]>>()

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
