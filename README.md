# Portier Integration Sync Panel

A web-based dashboard to manage data synchronization between local systems and external integrations like Salesforce, HubSpot, and Jira.

## Features

- **Integrations List**: View all connected applications and their current sync statuses.
- **Sync Operations**: Trigger manual syncs with external providers.
- **Conflict Resolution**: Handle data inconsistencies between local and external records with bulk resolution options.
- **Change Review**: Inspect added, updated, or deleted records prior to committing them.
- **Sync History**: Audit past synchronization events and their detailed changes.

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`.

## Docker Instructions

To build and run the application locally using Docker:

1. Build the image:

```bash
docker build -t sync-panel .
```

2. Run the container:

```bash
docker run -p 5173:80 sync-panel
```

3. Open your browser and navigate to `http://localhost:5173`.

## Architecture & Stack

- **Frontend Framework**: React 19 with Vite + TypeScript
- **Styling**: Tailwind CSS v4 for utility-first styling.
- **Routing**: React Router v7 for client-side routing.
- **State Management**:
  - Zustand for global application state (integrations, mock history, mock conflicts).
  - TanStack Query (React Query) for managing server state (sync API call).
- **Icons**: Lucide React
- **Architecture Pattern**: Separation of concerns with custom hooks (e.g., `useReviewSync`) extracting business logic from UI components, paired with utility functions for data transformation and grouping.

## Assumptions

- **Mock Data**: Since no full backend was provided for history and conflict data, robust mock data is pre-seeded in the Zustand stores. Changes made through the UI (sync approvals, conflict resolutions) will correctly mutate this mock state for testing purposes.
- **API Handling**: The sync API endpoint (`/api/v1/data/sync?application_id=:id`) returns random changed values, random delays and random HTTP status codes to simulate real-world conditions. Error and success states are fully handled.
- **No Entity IDs in API**: The API returns field-level changes without stable entity identifiers, so conflict detection uses sequence-based matching against local store values rather than ID-based lookups.

## Design Decisions

- **Pull-only sync model**: The system only pulls data from external integrations. Local changes are not pushed back to external sources. This simplifies the conflict model — the only question is whether to accept or reject an incoming remote value.

- **`pending_review` as a 5th status**: The spec defines four statuses (Synced, Syncing, Conflict, Error). A fifth — `pending_review` — was added to distinguish "changes are waiting for user approval" from "there is a conflict requiring resolution". This prevents the Sync Now button from being re-enabled while unapproved changes are sitting in the queue.

- **Immediate status resolution on API response**: Integration status (Pending Review or Conflict) is determined at the moment the API response arrives, not when the user opens the review screen. This ensures the dashboard always reflects true state even if the user navigates away.

- **Dirty-field conflict detection**: Local entities track a `dirty_fields` array. A conflict is raised when an incoming remote update targets a field that is marked dirty locally and the values differ. Clean remote updates pass through as normal `UPDATE` changes.

- **Explicit resolution required before approval**: The Approve button is blocked until every selected conflict has a resolution (`local` or `external`). Unselected conflicts keep the integration in `conflict` state after approval, forcing the user to revisit them.

- **Sequence-based entity matching**: Because the API returns no persistent entity IDs, incoming changes are matched to local entities by comparing `current_value` against known field values and relative array position. This is a best-effort heuristic documented as a known limitation.
