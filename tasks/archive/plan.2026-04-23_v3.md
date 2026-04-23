# ReviewSync Refactor — Group-First + Separation of Concerns

## Goal

Refactor ReviewSync so:
1. `pendingChanges` grouped by `entity_type → entity_id` **before** conflict detection
2. Each field row carries a label: `ADD` / `DELETE` / `UPDATE` / `CONFLICT`
3. Business logic lives in utils + a custom hook — UI is pure render
4. ADD changes always land on `lastId + 1` (e.g. `user_11`)

---

## New Data Shape

```ts
// Unified enriched change — one per field in the diff
interface EnrichedChange {
  id: string                          // original SyncChange.id
  entity_type: 'user' | 'door' | 'key'
  entity_id: string                   // resolved: user_0, door_2, user_11 (ADD)
  field_name: string                  // e.g. "user.email"
  change_type: 'ADD' | 'UPDATE' | 'DELETE' | 'CONFLICT'
  current_value?: string              // local value
  new_value?: string                  // external value
  local_value?: string                // only set for CONFLICT
  external_value?: string             // only set for CONFLICT
  resolution?: 'local' | 'external' | null  // only for CONFLICT
}

// Grouped result for UI consumption
type GroupedChanges = Map<string, Map<string, EnrichedChange[]>>
// Map<entity_type, Map<entity_id, EnrichedChange[]>>
```

---

## Proposed Changes

### Utils

#### [MODIFY] conflict_detection.ts → [NEW] enrich_changes.ts
**Delete** existing logic. Replace with a single `enrichChanges()` function:

```
enrichChanges(pendingChanges, { users, doors, keys }) → EnrichedChange[]
```

Steps per `SyncChange`:
1. Parse `entity_type` + `field_name` from `change.field_name`
2. Resolve `entity_id`:
   - **UPDATE / DELETE** (primary): scan local entities, find where `entity[field] === change.current_value` → use `entity.local_id`
   - **UPDATE / DELETE** (fallback): if not found, walk entities in `local_id` order (user_0, user_1, …), pick first whose `field` has **not already been claimed** by a previous change in the same array pass. A `claimedSlots: Map<field, Set<entity_id>>` is maintained as `enrichChanges` iterates — once an entity_id is used for a field, it's excluded from future fallback resolution.
   - **ADD**: compute `nextId = prefix + (maxIndex + 1)`, e.g. `user_11`. Increment for each ADD in the array (so two ADDs → `user_11`, `user_12`).
3. Classify `change_type`:
   - If `UPDATE` **and** entity has `field` in `dirty_fields` **and** `localValue !== new_value` → `CONFLICT`
   - Otherwise: keep original `ADD | UPDATE | DELETE`
4. Set `local_value` / `external_value` only for `CONFLICT`

#### [NEW] group_changes.ts

```
groupChanges(enriched: EnrichedChange[]) → Map<entity_type, Map<entity_id, EnrichedChange[]>>
```

Simple two-level Map grouping.

---

### Hook

#### [NEW] src/hooks/useReviewSync.ts

Contains **all** business logic extracted from `ReviewSync.tsx`:

| Concern | What it does |
|---|---|
| `groupedChanges` | `useMemo` — calls `enrichChanges` + `groupChanges` |
| `counts` | `useMemo` — ADD/UPDATE/DELETE/CONFLICT totals |
| `selected` | `Set<string>` of change IDs checked for apply |
| `resolutions` | `Map<conflictId, 'local' \| 'external'>` |
| `handleToggle` | add/remove from `selected` |
| `handleResolve` | set resolution for a conflict |
| `handleSelectAll` | select all non-CONFLICT + resolved CONFLICTs |
| `handleDeselectAll` | clear selection |
| `handleCancel` | update integration status, navigate back |
| `handleApprove` | full commit: apply changes, bump version, write history |

Returns a clean object — UI just destructures and renders.

---

### UI Components

#### [MODIFY] src/pages/ReviewSync.tsx
Becomes a thin render shell. Calls `useReviewSync(id)`, maps over `groupedChanges`, renders sections. **No business logic.**

#### [MODIFY] src/components/conflicts/EntityGroup.tsx
Now accepts `EnrichedChange[]` (mixed types). Renders a card per entity with a header showing entity_type + entity_id + change counts badge.

#### [MODIFY] src/components/conflicts/FieldConflict.tsx
Now driven purely by `EnrichedChange`. Handles all 4 labels via `change_type`. CONFLICT renders local vs external with "Use This" buttons. ADD/DELETE/UPDATE render checkbox only.

#### [DELETE] src/components/sync/ChangeCard.tsx
Replaced by the updated `FieldConflict` which handles all change types uniformly.

---

## File Map

```
src/
  utils/
    enrich_changes.ts      [NEW]  — resolves entity_id, classifies CONFLICT
    group_changes.ts       [NEW]  — groups EnrichedChange[] by type → id
    conflict_detection.ts  [DELETE or repurposed]
  hooks/
    useReviewSync.ts       [NEW]  — all state + handlers
  pages/
    ReviewSync.tsx         [MODIFY] — render only
  components/
    conflicts/
      EntityGroup.tsx      [MODIFY] — accepts EnrichedChange[]
      FieldConflict.tsx    [MODIFY] — handles all 4 change_type labels
    sync/
      ChangeCard.tsx       [DELETE] — superseded
  types/
    index.ts               [MODIFY] — add EnrichedChange interface
```

---

## Verification Plan

- Run existing tests: `npm test`
- Manual: open ReviewSync page, verify all 4 labels appear, "Use This" only on CONFLICT, approve flow still writes history + bumps version
- Check ADD entity_id assignment: new entities show `user_N+1` etc.

---

## Open Questions

- Approve button guard: block if any CONFLICT unresolved (current behavior), or allow partial approve? Proceeding with **block all** until confirmed otherwise.
