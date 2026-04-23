# Product Requirements Document: Portier Global Sync Panel

## 1. Overview
The Portier Global Sync Panel is a centralized dashboard for managing, reviewing, and tracking data synchronization between the core physical access control system and third-party external integrations. The system ensures data integrity for physical access entities by providing granular review and conflict resolution mechanisms.

## 2. Core Entities
The system strictly synchronizes three core physical access entities:
- **User**: Individuals granted physical access (attributes: name, email, phone, role, status).
- **Door**: Physical access points (attributes: name, status, battery_level, location, device_id).
- **Key**: Credentials or access tokens assigned to users (attributes: status, access_end, key_type).

## 3. Key Features

### 3.1 Integration Dashboard
- **List View**: Displays all active third-party integrations.
- **Status Tracking**: Surfaces real-time status for each integration (Synced, Syncing, Pending Review, Conflict, Error).
- **Global Actions**: Allows users to initiate bulk synchronization across integrations.

### 3.2 Integration Details
- **Sync Metrics**: Displays total records, last sync time, and duration.
- **Manual Trigger**: "Sync Now" functionality to trigger an immediate data pull.
- **Recent History**: Displays the 5 most recent synchronization events with completion timestamps.

### 3.3 Sync Review & Conflict Resolution
- **Pre-Approval Workflow**: Sync operations that alter data are paused in a "Pending Review" state.
- **Granular Review**: Users can review pending additions, updates, and deletions before committing them to the local database.
- **Conflict Detection**: Automatically flags fields where local uncommitted changes conflict with incoming external updates.
- **Resolution Matrix**: Forces users to explicitly choose either the "Local" or "External" value for conflicted fields before the sync batch can be fully approved.

### 3.4 Sync History & Auditing
- **History Log**: A comprehensive, paginated log of all past sync batches, capturing the version, source (System/User), and high-level summary.
- **Version Details**: Drill-down view into specific sync versions, detailing every exact field modification.
- **Grouped Display**: Historical changes are logically grouped by Entity Type (e.g., Users, Doors) and Entity ID for high readability.

## 4. User Flows & State Transitions

### 4.1 State Definitions
- **Synced**: Local and remote data are in alignment; no pending actions.
- **Syncing**: An active data fetch and change analysis is in progress.
- **Pending Review**: Remote changes (ADD/UPDATE/DELETE) are detected and await user approval.
- **Conflict**: Local edits diverge from remote updates, requiring manual field-level resolution.
- **Error**: The synchronization process failed (e.g., API timeout or network error).

### 4.2 Synchronization Scenarios
- **Initiation**: Clicking "Sync Now" moves the status from any state (usually **Synced** or **Error**) to **Syncing**.
- **No Changes Found**: If the system detects zero divergence after analysis, the status returns to **Synced**.
- **Clean Updates**: If changes are found but no fields are "dirty" locally, the status shifts from **Syncing** to **Pending Review**.
- **Conflict Detection**: If any remote update targets a locally modified field with a different value, the status shifts from **Syncing** to **Conflict** immediately.
- **Manual Approval**: Clicking "Approve" in the **Pending Review** state moves the status to **Synced**.
- **Conflict Resolution Flow**:
    - Users resolve conflicts in the review screen. The state remains **Conflict** until all specific fields have a resolution assigned.
    - Once all conflicts are resolved and the user clicks "Approve", the status moves to **Synced**.
- **System Failure**: If the API call fails, the status moves from **Syncing** to **Error**.


## 5. Data Assumptions & Design Decisions

### 5.1 Synchronization Logic
- **Unidirectional Data Flow**: The application assumes a read-only relationship with external providers. Data is pulled from integrations and reconciled locally; the system does not push local modifications back to third-party sources.
- **Initial Data Seeding**: Both local entity state and historical sync logs are pre-seeded to provide a comprehensive baseline for testing synchronization and review workflows.
- **Stateless API Mapping**: Since the mock API returns randomized data without persistent unique identifiers, the system implements a sequence-based matching strategy. Incoming changes are mapped to local entities by matching current values and relative array positions to maintain data consistency across sync cycles.


### 5.2 Conflict & Review Strategy
- **Conflict Simulation**: Conflicts are simulated by comparing incoming remote updates against a mutable local data store. If a remote update targets a field that has been modified locally ("dirty field") and the values differ, the system flags it for resolution.
- **Granular Field-Level Review**: Because synchronization happens at the field level, the review interface is designed to display clean updates alongside conflicted fields. This allows users to process standard updates in bulk while resolving conflicts individually within the same workflow.

### 5.3 Architectural Decisions
- **Immediate Status Resolution**: Integration status (Synced, Pending Review, or Conflict) is resolved immediately upon receiving a sync payload. This ensures the dashboard always reflects the true state of the integration without requiring the user to open a review screen.
- **Explicit Resolution Requirement**: To prevent accidental data loss, the system forbids bulk approval of conflicted fields. Every conflict requires an explicit "Use This" decision to determine whether the local or remote value takes precedence.
- **Hierarchical Layout**: Changes are grouped by Entity Type and Entity ID to provide necessary context for field-level modifications, simplifying the review of large sync batches.

