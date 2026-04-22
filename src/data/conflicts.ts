import type { ConflictItem } from '@/types'

export const mockConflicts: ConflictItem[] = [
  // Contact ct-101
  {
    id: 'conf-1',
    integration_id: 'hubspot',
    entity_type: 'Contact',
    entity_id: 'ct-101',
    field_name: 'email',
    local_value: 'alice@acme.com',
    external_value: 'alice.jones@acme.com',
    resolution: null,
  },
  {
    id: 'conf-2',
    integration_id: 'hubspot',
    entity_type: 'Contact',
    entity_id: 'ct-101',
    field_name: 'phone',
    local_value: '+1-555-1001',
    external_value: '+1-555-9001',
    resolution: null,
  },
  // Contact ct-102
  {
    id: 'conf-3',
    integration_id: 'hubspot',
    entity_type: 'Contact',
    entity_id: 'ct-102',
    field_name: 'company',
    local_value: 'Acme Corp',
    external_value: 'Acme Corporation',
    resolution: null,
  },
  {
    id: 'conf-4',
    integration_id: 'hubspot',
    entity_type: 'Contact',
    entity_id: 'ct-102',
    field_name: 'job_title',
    local_value: 'Engineer',
    external_value: 'Senior Engineer',
    resolution: null,
  },
  // Deal d-201
  {
    id: 'conf-5',
    integration_id: 'hubspot',
    entity_type: 'Deal',
    entity_id: 'd-201',
    field_name: 'amount',
    local_value: '15000',
    external_value: '18500',
    resolution: null,
  },
  {
    id: 'conf-6',
    integration_id: 'hubspot',
    entity_type: 'Deal',
    entity_id: 'd-201',
    field_name: 'close_date',
    local_value: '2026-05-31',
    external_value: '2026-06-30',
    resolution: null,
  },
]
