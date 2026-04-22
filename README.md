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

- **Frontend Framework**: React 18 with Vite + TypeScript
- **Styling**: Tailwind CSS v4 for utility-first styling.
- **Routing**: React Router v6 for client-side routing.
- **State Management**:
  - Zustand for global application state (integrations, mock history, mock conflicts).
  - TanStack Query (React Query) for managing server state (sync API call).
- **Icons**: Lucide React

## Assumptions

- **Mock Data**: Since no full backend was provided for history and conflict data, robust mock data is pre-seeded in the Zustand stores. Changes made through the UI (sync approvals, conflict resolutions) will correctly mutate this mock state for testing purposes.
- **API Handling**: The sync API endpoint (`/api/v1/data/sync?application_id=:id`) returns random changed values, random delays and random HTTP status codes to simulate real-world conditions. Error and success states are fully handled.
