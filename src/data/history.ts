import type { HistoryEntry } from '@/types'

export const mockHistory: HistoryEntry[] = [
  // HubSpot
  {
    id: 'h1',
    integration_id: 'hubspot',
    timestamp: '2026-04-22T08:30:00Z',
    source: 'System',
    version: '2.4.1',
    summary: 'Scheduled sync — 12 contacts updated',
    changes: [
      { id: 'c1', entity_type: 'Contact', entity_id: 'ct-001', field_name: 'email', change_type: 'UPDATE', previous_value: 'old@example.com', new_value: 'new@example.com' },
      { id: 'c2', entity_type: 'Contact', entity_id: 'ct-002', field_name: 'phone', change_type: 'UPDATE', previous_value: '+1-555-0001', new_value: '+1-555-0002' },
      { id: 'c3', entity_type: 'Company', entity_id: 'co-001', field_name: 'name', change_type: 'ADD', new_value: 'Acme Corp' },
    ],
  },
  {
    id: 'h2',
    integration_id: 'hubspot',
    timestamp: '2026-04-21T14:00:00Z',
    source: 'User',
    version: '2.4.0',
    summary: 'Manual sync — deal pipeline updated',
    changes: [
      { id: 'c4', entity_type: 'Deal', entity_id: 'd-001', field_name: 'stage', change_type: 'UPDATE', previous_value: 'Prospecting', new_value: 'Qualified' },
      { id: 'c5', entity_type: 'Deal', entity_id: 'd-002', field_name: 'amount', change_type: 'UPDATE', previous_value: '5000', new_value: '7500' },
    ],
  },
  {
    id: 'h3',
    integration_id: 'hubspot',
    timestamp: '2026-04-20T09:00:00Z',
    source: 'System',
    version: '2.3.9',
    summary: 'Scheduled sync — contact deleted',
    changes: [
      { id: 'c6', entity_type: 'Contact', entity_id: 'ct-003', field_name: 'record', change_type: 'DELETE', previous_value: 'John Doe' },
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
      { id: 'c7', entity_type: 'Account', entity_id: 'acc-001', field_name: 'industry', change_type: 'UPDATE', previous_value: 'Technology', new_value: 'SaaS' },
      { id: 'c8', entity_type: 'Lead', entity_id: 'lead-001', field_name: 'status', change_type: 'ADD', new_value: 'Open' },
      { id: 'c9', entity_type: 'Opportunity', entity_id: 'opp-001', field_name: 'close_date', change_type: 'UPDATE', previous_value: '2026-05-01', new_value: '2026-06-01' },
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
      { id: 'c10', entity_type: 'Contact', entity_id: 'ct-010', field_name: 'title', change_type: 'UPDATE', previous_value: 'Manager', new_value: 'Director' },
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
      { id: 'c11', entity_type: 'Account', entity_id: 'acc-002', field_name: 'record', change_type: 'ADD', new_value: 'Beta LLC' },
      { id: 'c12', entity_type: 'Account', entity_id: 'acc-003', field_name: 'record', change_type: 'ADD', new_value: 'Gamma Inc' },
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
    summary: 'Ticket status updates',
    changes: [
      { id: 'c13', entity_type: 'Ticket', entity_id: 'tk-001', field_name: 'status', change_type: 'UPDATE', previous_value: 'open', new_value: 'closed' },
      { id: 'c14', entity_type: 'Ticket', entity_id: 'tk-002', field_name: 'priority', change_type: 'UPDATE', previous_value: 'low', new_value: 'high' },
      { id: 'c15', entity_type: 'User', entity_id: 'u-001', field_name: 'role', change_type: 'ADD', new_value: 'agent' },
    ],
  },
  {
    id: 'h9',
    integration_id: 'zendesk',
    timestamp: '2026-04-20T11:00:00Z',
    source: 'System',
    version: '1.8.1',
    summary: 'Scheduled sync — macro updates',
    changes: [
      { id: 'c16', entity_type: 'Macro', entity_id: 'm-001', field_name: 'actions', change_type: 'UPDATE', previous_value: 'old_action', new_value: 'new_action' },
    ],
  },
  // Intercom
  {
    id: 'h10',
    integration_id: 'intercom',
    timestamp: '2026-04-22T07:45:00Z',
    source: 'System',
    version: '4.2.0',
    summary: 'Scheduled sync — conversations updated',
    changes: [
      { id: 'c17', entity_type: 'Conversation', entity_id: 'conv-001', field_name: 'state', change_type: 'UPDATE', previous_value: 'open', new_value: 'closed' },
      { id: 'c18', entity_type: 'Contact', entity_id: 'ct-020', field_name: 'email', change_type: 'UPDATE', previous_value: 'a@b.com', new_value: 'c@d.com' },
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
      { id: 'c19', entity_type: 'User', entity_id: 'u-002', field_name: 'plan', change_type: 'UPDATE', previous_value: 'free', new_value: 'pro' },
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
      { id: 'c20', entity_type: 'Tag', entity_id: 'tag-001', field_name: 'record', change_type: 'ADD', new_value: 'enterprise' },
      { id: 'c21', entity_type: 'Tag', entity_id: 'tag-002', field_name: 'record', change_type: 'DELETE', previous_value: 'trial' },
    ],
  },
  // Shopify
  {
    id: 'h13',
    integration_id: 'shopify',
    timestamp: '2026-04-22T06:00:00Z',
    source: 'System',
    version: '6.0.2',
    summary: 'Scheduled sync — product catalog',
    changes: [
      { id: 'c22', entity_type: 'Product', entity_id: 'p-001', field_name: 'price', change_type: 'UPDATE', previous_value: '29.99', new_value: '34.99' },
      { id: 'c23', entity_type: 'Product', entity_id: 'p-002', field_name: 'inventory', change_type: 'UPDATE', previous_value: '100', new_value: '85' },
    ],
  },
  {
    id: 'h14',
    integration_id: 'shopify',
    timestamp: '2026-04-21T06:00:00Z',
    source: 'System',
    version: '6.0.1',
    summary: 'Scheduled sync — order status',
    changes: [
      { id: 'c24', entity_type: 'Order', entity_id: 'ord-001', field_name: 'status', change_type: 'UPDATE', previous_value: 'pending', new_value: 'fulfilled' },
    ],
  },
  {
    id: 'h15',
    integration_id: 'shopify',
    timestamp: '2026-04-20T06:00:00Z',
    source: 'User',
    version: '6.0.0',
    summary: 'Initial full sync',
    changes: [
      { id: 'c25', entity_type: 'Product', entity_id: 'p-003', field_name: 'record', change_type: 'ADD', new_value: 'Widget Pro' },
      { id: 'c26', entity_type: 'Customer', entity_id: 'cust-001', field_name: 'record', change_type: 'ADD', new_value: 'Alice Smith' },
    ],
  },
]
