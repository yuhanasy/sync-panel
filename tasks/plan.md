# Implementation Plan: Portier Integration Sync Panel

## Stack
Vite + React 18 + TypeScript · Tailwind CSS v4 · React Router v6 · Zustand · TanStack Query · Lucide React

## Routes
| Page | Route |
|------|-------|
| Integrations List | `/` |
| Integration Detail | `/integrations/:id` |
| Review Sync | `/integrations/:id/review` |
| Resolve Conflicts | `/integrations/:id/conflicts` |
| Sync History | `/integrations/:id/history` |
| History Detail | `/integrations/:id/history/:version` |

## Data Models (snake_case)

```ts
Integration     { id, name, icon_url, status: 'synced'|'syncing'|'conflict'|'error', last_synced, version, total_records, last_sync_duration }
HistoryEntry    { id, integration_id, timestamp, source: 'System'|'User', version, summary, changes: VersionChange[] }
VersionChange   { id, entity_type, entity_id, field_name, change_type: 'ADD'|'UPDATE'|'DELETE', previous_value?, new_value? }
ConflictItem    { id, integration_id, entity_type, entity_id, field_name, local_value, external_value, resolution: 'local'|'external'|null }
SyncChange      { id, field_name, change_type: 'ADD'|'UPDATE'|'DELETE', current_value?, new_value? }  // from API
```

## Dependency Order
```
types → mock data → stores → api hooks → ui components → pages → shell/router → Dockerfile
```

---

## Phase 1: Foundation

### Task 1 — Project scaffold
Init Vite+React+TS, add Tailwind v4 (`@tailwindcss/vite`), React Router, Zustand, TanStack Query, Lucide. Configure `@/` alias.

Tailwind v4 setup:
- Install `tailwindcss@next @tailwindcss/vite` (no PostCSS needed)
- Add `@tailwindcss/vite` plugin to `vite.config.ts`
- CSS entry uses `@import "tailwindcss"` + `@theme {}` block for customization (no `tailwind.config.ts`)

**Criteria:** `npm run dev` + `npm run build` pass. Tailwind works. Placeholder route at `/`.

**Files:** `package.json`, `vite.config.ts`, `tsconfig.json`, `src/index.css`, `src/main.tsx`, `src/App.tsx`

### Task 2 — Types + mock data
Define all interfaces in `src/types/index.ts`. Seed 6 integrations (all 4 statuses represented). Seed ≥3 history entries per integration with VersionChange arrays. Seed HubSpot conflict items (≥3 fields, ≥2 entities).

**Criteria:** All types exported. Mock data typed and valid. `tsc --noEmit` passes.

**Files:** `src/types/index.ts`, `src/data/integrations.ts`, `src/data/history.ts`, `src/data/conflicts.ts`

### Task 3 — Stores + app shell
`useIntegrationStore` (list, selected, pending_changes, actions). `useConflictStore` (items, resolution actions). App shell with nav + breadcrumb. Wire 6 placeholder routes.

**Criteria:** Stores typed. All routes navigable. Breadcrumb updates per route.

**Files:** `src/stores/integration_store.ts`, `src/stores/conflict_store.ts`, `src/components/layout/`, `src/App.tsx`

### ⛔ CHECKPOINT 1 — Stop and wait for review
- [x] `npm run build` exits 0
- [x] `tsc --noEmit` exits 0
- [x] All 6 routes navigable in browser, no console errors

---

## Phase 2: Integrations List

### Task 4 — Integrations list page
Table: icon, name, status badge (Synced=green, Conflict=amber, Syncing=blue+pulse, Error=red), last_synced, version. Search by name. Status filter dropdown. Row click → detail.

**Criteria:** All 4 statuses render correctly. Search + filter work. Empty state on no results. Row navigation works.

**Files:** `src/pages/IntegrationsList.tsx`, `src/components/ui/StatusBadge.tsx`, `src/components/ui/SearchInput.tsx`

### ⛔ CHECKPOINT 2 — Stop and wait for review
- [x] All status badges correct color
- [x] Search + filter functional
- [x] Navigation to detail works

---

## Phase 3: Integration Detail

### Task 5 — Integration detail page
Header (icon, name, status badge, version, Sync Now button). Conflict alert banner (status=conflict only) with "Resolve Conflicts →" link. Stats cards (total_records, last_sync_duration, last_synced). Sync Summary table. Quick Actions (View History always; Resolve Conflicts when conflict).

**Criteria:** Conflict banner visible only for conflict status. All stats populated. Navigation to history and conflicts works. Sync Now button present (API wired in Task 6).

**Files:** `src/pages/IntegrationDetail.tsx`, `src/components/ui/StatCard.tsx`, `src/components/integrations/ConflictAlert.tsx`

### ⛔ CHECKPOINT 3 — Stop and wait for review
- [ ] HubSpot detail shows conflict banner
- [ ] Salesforce detail has no conflict banner
- [ ] Quick Actions navigate correctly

---

## Phase 4: Sync Flow

### Task 6 — Sync Now API + Review page
API: `GET https://portier-takehometest.onrender.com/api/v1/data/sync?application_id=:id`. On success → store changes → navigate to `/review`. Errors: 4xx = config error, 500 = internal error, 502 = gateway error, network = connection error.

Review page: Approval Required banner. Stats (Added/Updated/Deleted counts). Per-change checkbox cards (field_name, change_type badge, current→new). Select All / Deselect All. "X of N selected" counter. Approve (updates version, adds history entry, back to detail). Cancel (back, no changes).

**Criteria:** Spinner+disabled during fetch. All 4 error states show correct messages. Review page renders API changes. Approve creates history entry. Cancel is clean.

**Files:** `src/api/sync_api.ts`, `src/pages/ReviewSync.tsx`, `src/components/sync/ChangeCard.tsx`

### ⛔ CHECKPOINT 4 — Stop and wait for review
- [ ] Sync Now calls real API
- [ ] All error states verified
- [ ] Approve creates history entry, returns to detail

---

## Phase 5: Conflict Resolution

### Task 7 — Resolve conflicts page
Load pre-seeded conflict items. Group by entity (entity_type + entity_id header + field count). Per-field: local vs external columns, "Use This" button each side. Bulk: Accept All Local / Accept All External. "Merge Changes (N/total)" button — disabled until all resolved. On merge: status → synced, conflicts cleared, history entry added.

**Criteria:** Fields grouped by entity. "Use This" highlights selection. Merge button count accurate. Disabled until fully resolved. Merge → detail shows Synced.

**Files:** `src/pages/ResolveConflicts.tsx`, `src/components/conflicts/EntityGroup.tsx`, `src/components/conflicts/FieldConflict.tsx`

### ⛔ CHECKPOINT 5 — Stop and wait for review
- [ ] Full conflict resolution flow works
- [ ] After merge, HubSpot → Synced status
- [ ] Bulk accept actions work

---

## Phase 6: Sync History

### Task 8 — Sync history page
Table: timestamp, source badge (System=blue/User=purple), version, summary, "View Changes" link. Empty state when no history. Back to integration.

**Criteria:** History entries render. Source badges correct. "View Changes" navigates to history detail.

**Files:** `src/pages/SyncHistory.tsx`

### Task 9 — History detail page
Header "Integration – Version X.Y.Z". Stats cards (Added/Updated/Deleted/Total — derived from VersionChange array). Change cards: entity context + field_name + change_type badge. ADD = new_value only. UPDATE = previous→new. DELETE = previous_value only.

**Criteria:** Stats match actual data (not hardcoded). All 3 change types render correctly. Back to history works.

**Files:** `src/pages/HistoryDetail.tsx`, `src/components/history/VersionChangeCard.tsx`

### ⛔ CHECKPOINT 6 — Stop and wait for review
- [ ] History list and detail navigate correctly
- [ ] Stats match change array counts
- [ ] All change types (ADD/UPDATE/DELETE) render correctly

---

## Phase 7: Polish + Docker

### Task 10 — Edge cases + error states
Unknown integration ID → redirect or "not found". Graceful handling of empty history. Sync Now error dismissible. Brief skeleton on stats cards.

**Files:** `src/components/ui/EmptyState.tsx`, `src/components/ui/Skeleton.tsx`, minor page edits

### Task 11 — Dockerfile + README
Multi-stage Dockerfile (Node build → nginx). nginx.conf with `try_files` for SPA routing. README: Docker instructions (single build + run command), architecture overview, assumptions summary, API notes.

**Criteria:** `docker build -t sync-panel .` exits 0. `docker run -p 8080:80 sync-panel` serves app. Refresh on deep route does not 404.

**Files:** `Dockerfile`, `nginx.conf`, `README.md`

### ⛔ CHECKPOINT 7 (FINAL) — Stop and wait for review
- [ ] `npm run build` + `tsc --noEmit` pass
- [ ] Docker build + run works
- [ ] All 6 pages functional end-to-end
- [ ] Sync Now API works (real endpoint)
