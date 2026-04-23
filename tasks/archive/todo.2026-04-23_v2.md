# Task List

## Phase 1: Types + Data + Store
- [x] Task 1: Add LocalUser/LocalDoor/LocalKey types to src/types/index.ts
- [x] Task 2: Add 'pending_approve' status to Integration type
- [x] Task 3: Create src/data/local_entities.ts (10 users, 10 doors, 10 keys, pre-seed dirty on ~3)
- [x] Task 4: Create src/stores/local_entity_store.ts with updateXField, applyXChange, add/remove actions
- [x] ⛔ CHECKPOINT 1: npm run build && tsc --noEmit pass, store actions callable

## Phase 2: Conflict Detection Util + Tests
- [x] Task 5: Create src/utils/conflict_detection.ts with detectConflicts()
- [x] Task 6: Write conflict_detection.test.ts with UPDATE/ADD/DELETE cases
- [x] Task 7: Integration tests in ReviewSync page (will integrate in Phase 3)
- [x] ⛔ CHECKPOINT 2: npm run test all pass

## Phase 3: Review Page Enhancement
- [x] Task 8: Import local entity store, detectConflicts in ReviewSync
- [x] Task 9: Render conflicts as FieldConflict, clean as ChangeCard
- [x] Task 10: Add resolutions Map state, handleCancel with conflict/pending_approve logic
- [x] Task 11: handleApprove applies changes to local store, real entity_type/entity_id in history
- [x] ⛔ CHECKPOINT 3: Manual test Review page conflict flow works end-to-end

## Phase 4: Integration Detail Page
- [x] Task 12: Add 'pending_approve' badge to StatusBadge
- [x] Task 13: Add isPendingApprove state, "Pending Review" button in IntegrationDetail
- [x] Task 14: "Resolve Conflicts" for conflict status → /review route (not /conflicts)
- [x] ⛔ CHECKPOINT 4: Manual test pending_approve + conflict buttons work

## Phase 5: Local Data Page + Nav
- [x] Task 15: Create src/pages/LocalData.tsx with Users/Doors/Keys tabs
- [x] Task 16: Table with inline edit, dirty field indicators, reset buttons
- [x] Task 17: Add /local-data route to App.tsx
- [x] Task 18: Add "Local Data" nav link to Shell
- [x] ⛔ CHECKPOINT 5: Manual test LocalData page edit flow marks dirty

## Phase 6: Cleanup
- [x] Task 19: Remove conflict_store.ts usage (not imported anywhere)
- [x] Task 20: Remove ResolveConflicts.tsx and /conflicts route from App.tsx
- [x] Task 21: Remove src/data/conflicts.ts
- [x] ⛔ FINAL: npm run build && npm run test pass, docker build works
