# Product Engineer (Frontend) – Take Home Test
**portier**

---

# 1. Overview

You are building a **Web App Integration Sync Panel** for a B2B SaaS platform that connects to multiple external services (e.g., Salesforce, HubSpot, Stripe).

The system must support **bidirectional data synchronization**, while safely handling conflicts and maintaining version history.

---

# 2. Core Problem

When data exists in multiple systems, conflicts can occur.

Example:

A user's email is updated locally to:

```
john@company.com
```

While HubSpot updates it to:

```
j.smith@newdomain.com
```

The system cannot automatically decide which value is correct.  
It requires **structured review and resolution**.

Your solution should demonstrate how the system can make this process:

- Safe
- Transparent
- Reviewable
- Auditable

---

# 3. Reference Example

Here is a **reference example** of the interface and flow:

https://clump-spoke-69419438.figma.site/

This example is **only a reference**.

You are **not limited to this design**. You are free to:

- Improve the UI
- Improve the workflow
- Introduce additional states
- Adjust the experience based on your assumptions

We are interested in **your thinking and approach**, not strict design replication.

---

# 4. Scope of the System

Your implementation should include the following areas.

## 4.1 Integrations List

- Overview of integrations
- Status indicators:
  - Synced
  - Syncing
  - Conflict
  - Error
- Key metadata:
  - Last sync time
  - Version

---

## 4.2 Integration Sync Detail

- Integration summary
- **Sync Now** trigger
- Preview of incoming changes before applying

---

## 4.3 Sync History & Versioning

- List of past sync events
- Version tracking
- Ability to inspect what changed

---

## 4.4 Conflict Resolution

- Field-level conflict detection
- Side-by-side comparison (local vs external)
- Per-field resolution choice
- Clear merge action

---

# 5. API Requirement

Use the following endpoint:

```
https://portier-takehometest.onrender.com/api/v1/data/sync
```

The **Sync Now** button must call this endpoint.

Data used for:

- Sync preview
- Conflict resolution
- Sync confirmation

should come from this API.

---

## Example API Response

```json
{
  "code": "SUCCESS",
  "message": "successfully retrieve the data",
  "data": {
    "sync_approval": {
      "application_name": "Slack",
      "changes": [
        {
          "id": "change_001",
          "field_name": "user.email",
          "change_type": "UPDATE",
          "current_value": "evan.temp@company.com",
          "new_value": "evan@company.com"
        }
      ]
    },
    "metadata": {}
  }
}
```

You may use this response structure to design:

- Sync preview interface
- Conflict resolution UI
- Change review before approval

---

## Possible API Errors

Your UI should properly handle the following cases:

### 4xx error
Possible missing configuration

### 500 error
Internal server error

### 502 error
Gateway error (integration client server down)

These states should be clearly communicated to the user.

---

# 6. Example Entities (Data Model)

You may assume the following entities exist in the system.

## User

| Field | Type |
|------|------|
| id | UUID |
| name | string |
| email | string |
| phone | string |
| role | string |
| status | string |
| created_at | timestamp |
| updated_at | timestamp |

Possible `User.status` values:

- active
- suspended

---

## Door

| Field | Type |
|------|------|
| id | UUID |
| name | string |
| location | string |
| device_id | string |
| status | string |
| battery_level | int |
| last_seen | timestamp |
| created_at | timestamp |

Possible `Door.status` values:

- online
- offline

---

## Key

| Field | Type |
|------|------|
| id | UUID |
| user_id | UUID |
| door_id | UUID |
| key_type | string |
| access_start | timestamp |
| access_end | timestamp |
| status | string |
| created_at | timestamp |

Possible `Key.status` values:

- active
- revoked

---

# 7. Technical Expectation

You **do not need to implement backend logic**.

Focus on:

- Frontend UI
- Interaction flow
- Data handling

Only the **Sync Now** button needs to call the API.

All other data interactions can be:

- mocked
- simulated
- locally modeled

Your solution should also be **able to run in Docker**.

### Runtime / Deployment Requirement

Please include:

- A `Dockerfile`
- Any required container configuration
- Clear instructions in the `README` on how to build and run the application using Docker

The project should be runnable locally using Docker with **minimal setup** — ideally a single command such as `docker build` and `docker run`. This helps us review your work quickly without environment issues.

---

# 8. What We Evaluate

We are mainly evaluating:

- Clear separation between UI, business logic, and API interaction
- Clean and maintainable code structure
- Proper handling of loading and error states
- Thoughtful user experience when handling sync and conflicts
- Reasonable frontend architecture
- Code quality — including readability, consistency, and how well you maintain standards throughout the codebase

Visual polish is **not the primary focus**.

---

# 9. Submission Instructions

Please complete the task within **2 days**.

Steps:

1. Push your solution to a **public GitHub repository**
2. Ensure the repository includes:
   - Setup instructions in the README
   - Any assumptions you made
   - Notes on design decisions
3. Send the repository link to:

```
tafaquh@portierglobal.com
```

Email subject:

```
Take-Home Test Submission – Senior Frontend (AI Native)
```

---

If anything in the instructions is unclear, feel free to ask.

We look forward to seeing your approach.