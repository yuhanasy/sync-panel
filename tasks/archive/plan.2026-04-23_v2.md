# Plan: Dynamic Conflict Detection via Local Entity Store

## Context

Current conflict system is entirely static (pre-seeded in `conflicts.ts`). Goal: manage a real shared local data store (users, doors, keys), add an edit UI so fields can be marked dirty, and detect real conflicts when a sync response updates a locally-dirty field. Conflicts surface inline in the Review page via `FieldConflict`. Cancel sets new statuses (`pending_approve` / `conflict`).

---

## Decisions

- API field_name format: **prefixed** — `user.name`, `door.status`, `key.key_type`
- Dirty granularity: **field-level** — `dirty_fields: string[]`; conflict only when remote touches a field in that list
- Dirty source: **edit UI** on Local Data page
- Conflict location: **inline in Review page** (FieldConflict per conflicted SyncChange)
- Cancel behavior: conflicts → `status='conflict'`; clean → `status='pending_approve'`
- `conflict` status → "Resolve Conflicts" → navigate to `/integrations/:id/review` (reuse pending_changes)
- `pending_approve` status → "Pending Review" button → fresh Sync Now (new API call)
- Scope: **single shared local store** — all integrations sync to same entities

---

## Data Models

### User

```ts
{
  local_id: string       // 'user_0'…'user_9'
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  created_at: string
  updated_at: string
  dirty_fields: string[] // fields edited locally, e.g. ['email', 'role']
}
```

### Door

```ts
{
  local_id: string       // 'door_0'…'door_9'
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
```

### Key

```ts
{
  local_id: string       // 'key_0'…'key_9'
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
```

---

## Phases

### Phase 1 — Types + Data + Store

Files: `src/types/index.ts`, `src/data/local_entities.ts`, `src/stores/local_entity_store.ts`

### Phase 2 — Conflict Detection Util + Tests

Files: `src/utils/conflict_detection.ts`, `src/utils/__tests__/conflict_detection.test.ts`

### Phase 3 — Review Page Enhancement

Files: `src/pages/ReviewSync.tsx`

### Phase 4 — Integration Detail Page

Files: `src/pages/IntegrationDetail.tsx`, `src/components/ui/StatusBadge.tsx`

### Phase 5 — Local Data Page + Nav

Files: `src/pages/LocalData.tsx`, `src/App.tsx`, `src/components/layout/Shell.tsx`

### Phase 6 — Cleanup

Remove: `conflict_store.ts`, `ResolveConflicts.tsx`, `/conflicts` route, static `conflicts.ts` usage

---

## Verification

1. `npm run test` — all tests pass
2. Navigate `/local-data` → edit field → amber dirty indicator appears
3. Sync integration → Review page shows field as FieldConflict
4. Pick resolution → Approve → local data updated, status = synced
5. Cancel with conflicts → status = conflict
6. Cancel without conflicts → status = pending_approve
7. Sync Now from pending_approve → fresh fetch
8. ADD change → new entity appears in Local Data after approve
9. DELETE found → entity removed from Local Data
10. `npm run build` + `tsc --noEmit` pass

## Raw context

enhance the conflict data case. currently it only static by mocked data only.
but i want to make it a little bit real.
our problem with the api response is it don't give any reference id to what data that has been remotely changed. so simulating conflict data is not possible.

my idea is, what if we only use incremental number for the local data.
so, we create several dummy data for users, keys, and doors.
locally. we can update the data, and flag it as dirty.
then, when we sync the remote data, we apply some logic to check if there is conflicted updates.
since the api response has no reference id, we manually give them incremental value from 0. for example user_0, door_1, key_2. only seed 10 data initially.

for example: if there is user.name field, then it means it changed the user user_0 in local data. if we found another user.name field updated again in the response, then it means it will updates the user user_1 in local data. then we compare, if user 1 in local data is dirty, then it is a conflict.
or even better, first we search the current_value in the local data, if found then we apply update to it, else we use the incremental order.

plus enhance the conflict page. only use the FieldConflict components for the conflicted field for the corresponding data (user, door, or key).

there are come cases to handle:

- if change_type is DELETE:
  - if the data is found, then we really delete it from local.
  - else, when it is not found, we just pretend to delete it. use CardChange to show this change_type.
- if change_type is ADD:
  - we add new row data to our local.
- if change_type is UPDATE:
  - first we search the current_value in the local, if it found then we update it. so the current_value and local value is the same, then we update local value with new_value.
  - if not found, then we update local data incrementally with new_value, and ignore current_value from remote. in this case, we only compare the local and the remote new_value.
  - if the local data is dirty, and remote data is updated then it is a conflict. use FieldConflict to compare the data, and user can pick which data will be used.

users:

```
[
  {
    local_id: 'user_0',
    id: '',
    name: '',
    email: '',
    phone '',: '',
    role: '',
    status: '',
    created_at: '',
    updated_at: '',
  },
   {
    local_id: 'user_1',
    id: '',
    name: '',
    email: '',
    phone '',: '',
    role: '',
    status: '',
    created_at: '',
    updated_at: '',
  }
]
```

doors:

```
[
  {
    local_id: 'door_0',
    id: '',
    name: '',
    location: '',
    device_id: '',
    status: '',
    battery_level: '',
    last_seen: '',
    created_at    : '',
  }
]
```

keys:

```
[
  {
    local_id: 'key_0',
    id: '',
    user_id: '',
    door_id: '',
    key_type: '',
    access_start: '',
    access_end: '',
    status: '',
    created_at: '',
  }
]
```
