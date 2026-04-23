import { describe, it, expect } from 'vitest'
import type { SyncChange, LocalUser, LocalDoor, LocalKey } from '@/types'
import { detectConflicts, type ConflictDetectionContext } from '../conflict_detection'

function createTestUser(overrides?: Partial<LocalUser>): LocalUser {
  return {
    local_id: 'user_0',
    id: '',
    name: 'Alice',
    email: 'alice@test.com',
    phone: '555-0001',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    dirty_fields: [],
    ...overrides,
  }
}

function createTestDoor(overrides?: Partial<LocalDoor>): LocalDoor {
  return {
    local_id: 'door_0',
    id: '',
    name: 'Main Door',
    location: 'Building A',
    device_id: 'dev_001',
    status: 'active',
    battery_level: '95',
    last_seen: '2024-01-20T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    dirty_fields: [],
    ...overrides,
  }
}

function createTestKey(overrides?: Partial<LocalKey>): LocalKey {
  return {
    local_id: 'key_0',
    id: '',
    user_id: 'user_0',
    door_id: 'door_0',
    key_type: 'permanent',
    access_start: '2024-01-01T00:00:00Z',
    access_end: '2099-12-31T00:00:00Z',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    dirty_fields: [],
    ...overrides,
  }
}

describe('detectConflicts', () => {
  describe('UPDATE changes', () => {
    it('detects conflict when field is dirty', () => {
      const context: ConflictDetectionContext = {
        users: [createTestUser({ dirty_fields: ['email'] })],
        doors: [],
        keys: [],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'user.email',
          change_type: 'UPDATE',
          current_value: 'alice@test.com',
          new_value: 'alice.new@test.com',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]).toMatchObject({
        field_name: 'user.email',
        entity_type: 'user',
        local_id: 'user_0',
        local_value: 'alice@test.com',
        external_value: 'alice.new@test.com',
      })
    })

    it('does not detect conflict when field is not dirty', () => {
      const context: ConflictDetectionContext = {
        users: [createTestUser({ dirty_fields: [] })],
        doors: [],
        keys: [],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'user.email',
          change_type: 'UPDATE',
          current_value: 'alice@test.com',
          new_value: 'alice.new@test.com',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts).toHaveLength(0)
    })

    it('does not detect conflict if local and external values are equal', () => {
      const context: ConflictDetectionContext = {
        users: [createTestUser({ email: 'alice@test.com', dirty_fields: ['email'] })],
        doors: [],
        keys: [],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'user.email',
          change_type: 'UPDATE',
          current_value: 'old@test.com',
          new_value: 'alice@test.com',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts).toHaveLength(0)
    })

    it('detects conflict on door update with dirty field', () => {
      const context: ConflictDetectionContext = {
        users: [],
        doors: [createTestDoor({ battery_level: '85', dirty_fields: ['battery_level'] })],
        keys: [],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'door.battery_level',
          change_type: 'UPDATE',
          current_value: '85',
          new_value: '75',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]).toMatchObject({
        field_name: 'door.battery_level',
        entity_type: 'door',
        local_id: 'door_0',
        local_value: '85',
        external_value: '75',
      })
    })

    it('detects conflict on key update with dirty field', () => {
      const context: ConflictDetectionContext = {
        users: [],
        doors: [],
        keys: [createTestKey({ status: 'inactive', dirty_fields: ['status'] })],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'key.status',
          change_type: 'UPDATE',
          current_value: 'inactive',
          new_value: 'revoked',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]).toMatchObject({
        field_name: 'key.status',
        entity_type: 'key',
        local_id: 'key_0',
        local_value: 'inactive',
        external_value: 'revoked',
      })
    })
  })

  describe('ADD changes', () => {
    it('does not detect conflict for ADD changes', () => {
      const context: ConflictDetectionContext = {
        users: [createTestUser()],
        doors: [],
        keys: [],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'user.name',
          change_type: 'ADD',
          new_value: 'Bob',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts).toHaveLength(0)
    })
  })

  describe('DELETE changes', () => {
    it('does not detect conflict for DELETE changes', () => {
      const context: ConflictDetectionContext = {
        users: [createTestUser()],
        doors: [],
        keys: [],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'user.name',
          change_type: 'DELETE',
          current_value: 'Alice',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts).toHaveLength(0)
    })
  })

  describe('Multiple changes', () => {
    it('detects multiple conflicts from multiple changes', () => {
      const context: ConflictDetectionContext = {
        users: [
          createTestUser({ dirty_fields: ['email'] }),
          createTestUser({
            local_id: 'user_1',
            email: 'bob@test.com',
            dirty_fields: ['email'],
          }),
        ],
        doors: [],
        keys: [],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'user.email',
          change_type: 'UPDATE',
          current_value: 'alice@test.com',
          new_value: 'alice.new@test.com',
        },
        {
          id: 'change_2',
          field_name: 'user.email',
          change_type: 'UPDATE',
          current_value: 'bob@test.com',
          new_value: 'bob.new@test.com',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts).toHaveLength(2)
      expect(conflicts[0].local_id).toBe('user_0')
      expect(conflicts[1].local_id).toBe('user_1')
    })

    it('handles mixed change types correctly', () => {
      const context: ConflictDetectionContext = {
        users: [createTestUser({ dirty_fields: ['email'] })],
        doors: [],
        keys: [],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'user.email',
          change_type: 'UPDATE',
          current_value: 'alice@test.com',
          new_value: 'alice.new@test.com',
        },
        {
          id: 'change_2',
          field_name: 'user.name',
          change_type: 'ADD',
          new_value: 'Charlie',
        },
        {
          id: 'change_3',
          field_name: 'user.phone',
          change_type: 'DELETE',
          current_value: '555-0001',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].field_name).toBe('user.email')
    })
  })

  describe('Entity matching', () => {
    it('finds entity by current_value', () => {
      const context: ConflictDetectionContext = {
        users: [
          createTestUser({
            local_id: 'user_0',
            email: 'alice@test.com',
            dirty_fields: ['email'],
          }),
        ],
        doors: [],
        keys: [],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'user.email',
          change_type: 'UPDATE',
          current_value: 'alice@test.com',
          new_value: 'alice.new@test.com',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts[0].local_id).toBe('user_0')
    })

    it('ignores unrecognized entity types', () => {
      const context: ConflictDetectionContext = {
        users: [],
        doors: [],
        keys: [],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'unknown.field',
          change_type: 'UPDATE',
          current_value: 'old',
          new_value: 'new',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts).toHaveLength(0)
    })
  })

  describe('Multiple fields on same entity', () => {
    it('detects conflicts on multiple dirty fields', () => {
      const context: ConflictDetectionContext = {
        users: [createTestUser({ email: 'alice@test.com', phone: '555-0001', dirty_fields: ['email', 'phone'] })],
        doors: [],
        keys: [],
      }
      const changes: SyncChange[] = [
        {
          id: 'change_1',
          field_name: 'user.email',
          change_type: 'UPDATE',
          current_value: 'alice@test.com',
          new_value: 'new-email@test.com',
        },
        {
          id: 'change_2',
          field_name: 'user.phone',
          change_type: 'UPDATE',
          current_value: '555-0001',
          new_value: '555-9999',
        },
      ]

      const conflicts = detectConflicts(changes, context)

      expect(conflicts).toHaveLength(2)
      expect(conflicts.map((c) => c.field_name)).toContain('user.email')
      expect(conflicts.map((c) => c.field_name)).toContain('user.phone')
    })
  })
})
