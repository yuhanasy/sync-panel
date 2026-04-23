import type { HistoryEntry } from '@/types'

export const mockHistory: HistoryEntry[] = [
  // HubSpot
  {
    id: 'h1',
    integration_id: 'hubspot',
    timestamp: '2026-04-22T08:30:00Z',
    source: 'System',
    version: '2.4.1',
    summary: 'Scheduled sync — 12 users updated',
    changes: [
      { id: 'c1', entity_type: 'user', entity_id: 'user_1', field_name: 'email', change_type: 'UPDATE', previous_value: 'old@example.com', new_value: 'new@example.com' },
      { id: 'c2', entity_type: 'user', entity_id: 'user_2', field_name: 'phone', change_type: 'UPDATE', previous_value: '+1-555-0001', new_value: '+1-555-0002' },
      { id: 'c3', entity_type: 'door', entity_id: 'door_3', field_name: 'name', change_type: 'ADD', new_value: 'Main Entrance' },
    ],
  },
  {
    id: 'h2',
    integration_id: 'hubspot',
    timestamp: '2026-04-21T14:00:00Z',
    source: 'User',
    version: '2.4.0',
    summary: 'Manual sync — door status updated',
    changes: [
      { id: 'c4', entity_type: 'door', entity_id: 'door_1', field_name: 'status', change_type: 'UPDATE', previous_value: 'locked', new_value: 'unlocked' },
      { id: 'c5', entity_type: 'door', entity_id: 'door_2', field_name: 'battery_level', change_type: 'UPDATE', previous_value: '80', new_value: '75' },
    ],
  },
  {
    id: 'h3',
    integration_id: 'hubspot',
    timestamp: '2026-04-20T09:00:00Z',
    source: 'System',
    version: '2.3.9',
    summary: 'Scheduled sync — user deleted',
    changes: [
      { id: 'c6', entity_type: 'user', entity_id: 'user_3', field_name: 'record', change_type: 'DELETE', previous_value: 'John Doe' },
    ],
  },
  // Salesforce
  {
    id: 'h4',
    integration_id: 'salesforce',
    timestamp: '2026-04-22T09:00:00Z',
    source: 'System',
    version: '5.1.0',
    summary: 'Full sync — 230 records processed',
    changes: [
      { id: 'c7', entity_type: 'user', entity_id: 'user_4', field_name: 'role', change_type: 'UPDATE', previous_value: 'staff', new_value: 'manager' },
      { id: 'c8', entity_type: 'key', entity_id: 'key_1', field_name: 'status', change_type: 'ADD', new_value: 'active' },
      { id: 'c9', entity_type: 'key', entity_id: 'key_2', field_name: 'access_end', change_type: 'UPDATE', previous_value: '2026-05-01', new_value: '2026-06-01' },
    ],
  },
  {
    id: 'h5',
    integration_id: 'salesforce',
    timestamp: '2026-04-21T08:00:00Z',
    source: 'System',
    version: '5.0.9',
    summary: 'Scheduled sync — no conflicts',
    changes: [
      { id: 'c10', entity_type: 'user', entity_id: 'user_5', field_name: 'status', change_type: 'UPDATE', previous_value: 'inactive', new_value: 'active' },
    ],
  },
  {
    id: 'h6',
    integration_id: 'salesforce',
    timestamp: '2026-04-20T08:00:00Z',
    source: 'User',
    version: '5.0.8',
    summary: 'Manual sync — bulk import',
    changes: [
      { id: 'c11', entity_type: 'door', entity_id: 'door_4', field_name: 'record', change_type: 'ADD', new_value: 'Server Room A' },
      { id: 'c12', entity_type: 'door', entity_id: 'door_5', field_name: 'record', change_type: 'ADD', new_value: 'Server Room B' },
    ],
  },
  // Zendesk
  {
    id: 'h7',
    integration_id: 'zendesk',
    timestamp: '2026-04-22T09:15:00Z',
    source: 'System',
    version: '1.8.3',
    summary: 'Sync in progress',
    changes: [],
  },
  {
    id: 'h8',
    integration_id: 'zendesk',
    timestamp: '2026-04-21T10:00:00Z',
    source: 'User',
    version: '1.8.2',
    summary: 'Access requests updated',
    changes: [
      { id: 'c13', entity_type: 'key', entity_id: 'key_3', field_name: 'status', change_type: 'UPDATE', previous_value: 'pending', new_value: 'active' },
      { id: 'c14', entity_type: 'key', entity_id: 'key_4', field_name: 'key_type', change_type: 'UPDATE', previous_value: 'temporary', new_value: 'permanent' },
      { id: 'c15', entity_type: 'user', entity_id: 'user_6', field_name: 'role', change_type: 'ADD', new_value: 'admin' },
    ],
  },
  {
    id: 'h9',
    integration_id: 'zendesk',
    timestamp: '2026-04-20T11:00:00Z',
    source: 'System',
    version: '1.8.1',
    summary: 'Scheduled sync — policy updates',
    changes: [
      { id: 'c16', entity_type: 'door', entity_id: 'door_6', field_name: 'status', change_type: 'UPDATE', previous_value: 'unlocked', new_value: 'locked' },
    ],
  },
  // Intercom
  {
    id: 'h10',
    integration_id: 'intercom',
    timestamp: '2026-04-22T07:45:00Z',
    source: 'System',
    version: '4.2.0',
    summary: 'Scheduled sync — locations updated',
    changes: [
      { id: 'c17', entity_type: 'door', entity_id: 'door_7', field_name: 'location', change_type: 'UPDATE', previous_value: 'Lobby', new_value: 'Reception' },
      { id: 'c18', entity_type: 'user', entity_id: 'user_7', field_name: 'email', change_type: 'UPDATE', previous_value: 'a@b.com', new_value: 'c@d.com' },
    ],
  },
  {
    id: 'h11',
    integration_id: 'intercom',
    timestamp: '2026-04-21T07:00:00Z',
    source: 'System',
    version: '4.1.9',
    summary: 'Scheduled sync — user attributes',
    changes: [
      { id: 'c19', entity_type: 'user', entity_id: 'user_8', field_name: 'status', change_type: 'UPDATE', previous_value: 'suspended', new_value: 'active' },
    ],
  },
  {
    id: 'h12',
    integration_id: 'intercom',
    timestamp: '2026-04-20T07:00:00Z',
    source: 'User',
    version: '4.1.8',
    summary: 'Manual sync — tags imported',
    changes: [
      { id: 'c20', entity_type: 'key', entity_id: 'key_5', field_name: 'record', change_type: 'ADD', new_value: 'maintenance_key' },
      { id: 'c21', entity_type: 'key', entity_id: 'key_6', field_name: 'record', change_type: 'DELETE', previous_value: 'contractor_key' },
    ],
  },
  // Slack
  {
    id: 'h13',
    integration_id: 'slack',
    timestamp: '2026-04-22T06:00:00Z',
    source: 'System',
    version: '6.0.2',
    summary: 'Scheduled sync — channel memberships updated',
    changes: [
      { id: 'c22', entity_type: 'user', entity_id: 'user_10', field_name: 'channel', change_type: 'UPDATE', previous_value: '#general', new_value: '#engineering' },
      { id: 'c23', entity_type: 'user', entity_id: 'user_11', field_name: 'status', change_type: 'UPDATE', previous_value: 'inactive', new_value: 'active' },
    ],
  },
  {
    id: 'h14',
    integration_id: 'slack',
    timestamp: '2026-04-21T06:00:00Z',
    source: 'System',
    version: '6.0.1',
    summary: 'Scheduled sync — workspace roles updated',
    changes: [
      { id: 'c24', entity_type: 'user', entity_id: 'user_12', field_name: 'role', change_type: 'UPDATE', previous_value: 'member', new_value: 'admin' },
    ],
  },
  {
    id: 'h15',
    integration_id: 'slack',
    timestamp: '2026-04-20T06:00:00Z',
    source: 'User',
    version: '6.0.0',
    summary: 'Initial full sync',
    changes: [
      { id: 'c25', entity_type: 'user', entity_id: 'user_13', field_name: 'record', change_type: 'ADD', new_value: 'Bob Johnson' },
      { id: 'c26', entity_type: 'key', entity_id: 'key_8', field_name: 'record', change_type: 'ADD', new_value: 'slack_api_key' },
    ],
  },
]
