# Uncertainties, Assumptions & Reasoning

---

## 1. What is "local"?

**Uncertainty:** Instruction never explicitly defines "local system."

**Assumption:** "Local" = Portier's own database. Portier is an access control platform (Users, Doors, Keys). External services (Salesforce, HubSpot, Stripe, etc.) are integrations that overlap on user/entity data.

**Reasoning:** Portier = French for "gatekeeper/doorman." The entity model (Door, Key, battery_level, access_start/end) is physical/digital access control data — not a CRM. External services are business tools. The logical read is Portier holds the authoritative access control records; external services hold overlapping identity/user data that must stay in sync.

---

## 2. Single-user sync vs. organizational admin tool

**Uncertainty:** Instruction doesn't explicitly say who the logged-in user is or what scope of data they manage.

**Assumption:** This is an **organizational admin tool**. The logged-in user is an IT admin or ops manager. The Users/Doors/Keys being synced belong to the organization's employees/assets, not the admin's own account.

**Reasoning:** B2B SaaS implies the customer is a business, not an individual. The API response shows bulk changes affecting multiple users and keys simultaneously. Sync panels in B2B products are always admin-facing dashboards, not personal settings pages.

---

## 3. Bidirectional sync scope in the UI

**Uncertainty:** Instruction says "bidirectional data synchronization" but the API only models inbound (external → local) changes. No outbound API or payload is defined.

**Assumption:** For this UI, bidirectional is demonstrated conceptually, not fully implemented:
- **Inbound** (external → local): Sync Now → Review → Approve flow
- **Outbound** (local → external): Acknowledged in README as part of the architecture but UI scope is inbound-only since no API exists for it

**Reasoning:** The only required API call is `POST /api/v1/data/sync` which returns changes FROM the external service TO local. The instruction says "only Sync Now needs to call the API" — everything else can be mocked. Implementing a full outbound flow with zero API support would require purely fictional UI with no grounding in the spec.

---

## 4. Hub-and-spoke vs. multi-source reconciliation

**Uncertainty:** With multiple integrations, it's unclear whether a change from Salesforce should be compared against HubSpot before being applied locally.

**Assumption:** **Hub-and-spoke model.** Portier local is the source of truth. Each integration syncs independently with Portier. No service syncs against another service directly.

**Reasoning:**
- The API takes `application_id` as a per-service param — one service at a time
- The integration list shows per-service status rows — each service is independent
- The conflict example in the instruction is always two-way: "local vs external" (never three-way)
- Multi-source reconciliation would require a fundamentally different data model not present in the spec

---

## 5. Conflict source — API vs. mocked

**Uncertainty:** Instruction section 5 says "Data used for conflict resolution should come from this API." But the API is a dummy that returns random changes without knowing local state.

**Assumption:** The API response is used as the **source of external changes** for the Review flow only. Conflict scenarios are **pre-seeded in mock data** (`conflicts.ts`) with explicit entity IDs, independently of the API response.

**Reasoning:** A true conflict requires knowing both (a) what the external system has and (b) what local has changed for the **same specific entity** since last sync. The API makes this impossible for two reasons:

1. **No entity ID in changes.** `field_name` is a field-type path (`user.email`), not a record pointer. The same field can appear multiple times in one response for different entities (e.g., `user.id` ADD for one user, `user.id` DELETE for a different user). There is no way to match any API change to a specific local record.

2. **`current_value` is unreliable.** The API is a dummy — `current_value` is a plausible-looking seed, not derived from actual local state. Comparing local store value against it would produce false conflicts or miss real ones.

Therefore: entity-level comparison between API changes and local records is structurally impossible. Conflict detection must be pre-seeded with known entity IDs so the side-by-side comparison (local value vs external value) is meaningful and grounded.

The instruction phrase "conflict resolution should come from this API" is best interpreted as: the external side of the conflict (what the API returned) informs the conflict scenario — not that the API generates conflicts itself.

---

## 6. Review page shows API changes as-is

**Uncertainty:** Should the Review page compare API changes against local records to show what's actually changing?

**Assumption:** Review page treats each API change as a **self-contained flat entry**. It shows `current_value` → `new_value` as provided by the API. No comparison against local records. Each row is independent.

**Reasoning:** The API has no entity IDs. A single response can contain multiple changes to the same `field_name` (e.g., two `user.id` changes in one batch — one ADD, one DELETE — for entirely different users). Without entity IDs, there is no way to match any change row to a specific local User, Door, or Key. Attempting to do so would require fabricating a mapping that has no basis in the API contract.

`current_value` in the Review context means: "what the external system recorded before this change" — useful as context for the admin reviewing, even if not guaranteed to match local state exactly.

---

## 7. `sync_approval` key naming

**Uncertainty:** The API wraps changes under `data.sync_approval` — implying changes need approval before being applied. But it's unclear if this means "all changes require approval" or "here are changes for you to approve if you want."

**Assumption:** All inbound changes go through a **review-then-approve** flow. Nothing is auto-applied. The admin explicitly selects which changes to accept (per-change checkbox) before committing.

**Reasoning:** The key name `sync_approval` + the instruction's emphasis on "Safe, Transparent, Reviewable, Auditable" strongly implies human-in-the-loop approval. The instruction also says "Preview of incoming changes before applying" — not auto-apply.

---

## 8. Version tracking granularity

**Uncertainty:** Instruction mentions "version tracking" and "ability to inspect what changed" but doesn't define what a version is or how it's incremented.

**Assumption:** Version = semantic version string (e.g., `1.2.3`) bumped on each approved sync. Each approval creates one `HistoryEntry` with a new version. Version diff = comparison of what changed between two consecutive versions.

**Reasoning:** Semantic versioning is a familiar, auditable pattern. One version per approved sync gives a clear audit trail. This matches standard data versioning in B2B SaaS (similar to database migration versioning).

---

## 9. Conflict state persistence

**Uncertainty:** If a sync produces conflicts, does the integration stay in "conflict" status until resolved, or can new syncs happen in parallel?

**Assumption:** Integration status = `conflict` blocks new Sync Now operations. The Resolve Conflicts flow must be completed (or cancelled) before another sync can be triggered.

**Reasoning:** Allowing new syncs while conflicts are unresolved would compound the conflict state and create ambiguity about which version is baseline. Blocking is the safer, more auditable behavior. Matches the instruction's emphasis on "safe" and "structured review."
