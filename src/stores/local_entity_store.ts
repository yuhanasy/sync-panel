import { create } from 'zustand'
import type { LocalUser, LocalDoor, LocalKey } from '@/types'
import { localUsers, localDoors, localKeys } from '@/data/local_entities'

interface LocalEntityStore {
  users: LocalUser[]
  doors: LocalDoor[]
  keys: LocalKey[]

  updateUserField: (localId: string, field: keyof Omit<LocalUser, 'local_id' | 'dirty_fields'>, value: string) => void
  updateDoorField: (localId: string, field: keyof Omit<LocalDoor, 'local_id' | 'dirty_fields'>, value: string) => void
  updateKeyField: (localId: string, field: keyof Omit<LocalKey, 'local_id' | 'dirty_fields'>, value: string) => void

  applyUserChange: (change: { field_name: string; change_type: 'ADD' | 'UPDATE' | 'DELETE'; current_value?: string; new_value?: string }) => void
  applyDoorChange: (change: { field_name: string; change_type: 'ADD' | 'UPDATE' | 'DELETE'; current_value?: string; new_value?: string }) => void
  applyKeyChange: (change: { field_name: string; change_type: 'ADD' | 'UPDATE' | 'DELETE'; current_value?: string; new_value?: string }) => void

  addUser: (user: LocalUser) => void
  addDoor: (door: LocalDoor) => void
  addKey: (key: LocalKey) => void

  removeUser: (localId: string) => void
  removeDoor: (localId: string) => void
  removeKey: (localId: string) => void

  resetUserDirtyFields: (localId: string) => void
  resetDoorDirtyFields: (localId: string) => void
  resetKeyDirtyFields: (localId: string) => void

  clearUserDirtyField: (localId: string, fieldName: string) => void
  clearDoorDirtyField: (localId: string, fieldName: string) => void
  clearKeyDirtyField: (localId: string, fieldName: string) => void
}

export const useLocalEntityStore = create<LocalEntityStore>((set) => ({
  users: localUsers,
  doors: localDoors,
  keys: localKeys,

  updateUserField: (localId, field, value) =>
    set((state) => ({
      users: state.users.map((user) => {
        if (user.local_id !== localId) return user
        const updated = { ...user, [field]: value }
        if (!updated.dirty_fields.includes(field)) {
          updated.dirty_fields = [...updated.dirty_fields, field]
        }
        return updated
      }),
    })),

  updateDoorField: (localId, field, value) =>
    set((state) => ({
      doors: state.doors.map((door) => {
        if (door.local_id !== localId) return door
        const updated = { ...door, [field]: value }
        if (!updated.dirty_fields.includes(field)) {
          updated.dirty_fields = [...updated.dirty_fields, field]
        }
        return updated
      }),
    })),

  updateKeyField: (localId, field, value) =>
    set((state) => ({
      keys: state.keys.map((key) => {
        if (key.local_id !== localId) return key
        const updated = { ...key, [field]: value }
        if (!updated.dirty_fields.includes(field)) {
          updated.dirty_fields = [...updated.dirty_fields, field]
        }
        return updated
      }),
    })),

  applyUserChange: (change) =>
    set((state) => {
      const { field_name, change_type, current_value, new_value } = change
      const [entityType, fieldName] = field_name.split('.') as [string, string]

      if (entityType !== 'user') return state
      if (fieldName === 'local_id' || fieldName === 'dirty_fields') return state

      if (change_type === 'ADD') {
        const newLocalId = `user_${Math.max(...state.users.map((u) => parseInt(u.local_id.split('_')[1], 10)), -1) + 1}`
        const newUser: LocalUser = {
          local_id: newLocalId,
          id: '',
          name: '',
          email: '',
          phone: '',
          role: '',
          status: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          dirty_fields: [],
        }
        const updates: Partial<LocalUser> = {}
        updates[fieldName as keyof Omit<LocalUser, 'local_id' | 'dirty_fields'>] = new_value || ''
        return { users: [...state.users, { ...newUser, ...updates }] }
      }

      if (change_type === 'DELETE') {
        const userToDelete = state.users.find((u) => {
          const val = u[fieldName as keyof LocalUser]
          return current_value && val === current_value
        })
        if (userToDelete) {
          return { users: state.users.filter((u) => u.local_id !== userToDelete.local_id) }
        }
        return state
      }

      if (change_type === 'UPDATE') {
        const userToUpdate = state.users.find((u) => {
          const val = u[fieldName as keyof LocalUser]
          return current_value && val === current_value
        })
        if (userToUpdate) {
          const updates: Partial<LocalUser> = {}
          updates[fieldName as keyof Omit<LocalUser, 'local_id' | 'dirty_fields'>] = new_value || ''
          return {
            users: state.users.map((u) =>
              u.local_id === userToUpdate.local_id ? { ...u, ...updates } : u,
            ),
          }
        }

        const nextIdx = state.users.findIndex(
          (u) => parseInt(u.local_id.split('_')[1], 10) === state.users.length + 1,
        )
        if (nextIdx >= 0) {
          const updates: Partial<LocalUser> = {}
          updates[fieldName as keyof Omit<LocalUser, 'local_id' | 'dirty_fields'>] = new_value || ''
          return {
            users: state.users.map((u, idx) =>
              idx === nextIdx ? { ...u, ...updates } : u,
            ),
          }
        }
        return state
      }

      return state
    }),

  applyDoorChange: (change) =>
    set((state) => {
      const { field_name, change_type, current_value, new_value } = change
      const [entityType, fieldName] = field_name.split('.') as [string, string]

      if (entityType !== 'door') return state
      if (fieldName === 'local_id' || fieldName === 'dirty_fields') return state

      if (change_type === 'ADD') {
        const newLocalId = `door_${Math.max(...state.doors.map((d) => parseInt(d.local_id.split('_')[1], 10)), -1) + 1}`
        const newDoor: LocalDoor = {
          local_id: newLocalId,
          id: '',
          name: '',
          location: '',
          device_id: '',
          status: '',
          battery_level: '',
          last_seen: '',
          created_at: new Date().toISOString(),
          dirty_fields: [],
        }
        const updates: Partial<LocalDoor> = {}
        updates[fieldName as keyof Omit<LocalDoor, 'local_id' | 'dirty_fields'>] = new_value || ''
        return { doors: [...state.doors, { ...newDoor, ...updates }] }
      }

      if (change_type === 'DELETE') {
        const doorToDelete = state.doors.find((d) => {
          const val = d[fieldName as keyof LocalDoor]
          return current_value && val === current_value
        })
        if (doorToDelete) {
          return { doors: state.doors.filter((d) => d.local_id !== doorToDelete.local_id) }
        }
        return state
      }

      if (change_type === 'UPDATE') {
        const doorToUpdate = state.doors.find((d) => {
          const val = d[fieldName as keyof LocalDoor]
          return current_value && val === current_value
        })
        if (doorToUpdate) {
          const updates: Partial<LocalDoor> = {}
          updates[fieldName as keyof Omit<LocalDoor, 'local_id' | 'dirty_fields'>] = new_value || ''
          return {
            doors: state.doors.map((d) =>
              d.local_id === doorToUpdate.local_id ? { ...d, ...updates } : d,
            ),
          }
        }

        const nextIdx = state.doors.findIndex(
          (d) => parseInt(d.local_id.split('_')[1], 10) === state.doors.length + 1,
        )
        if (nextIdx >= 0) {
          const updates: Partial<LocalDoor> = {}
          updates[fieldName as keyof Omit<LocalDoor, 'local_id' | 'dirty_fields'>] = new_value || ''
          return {
            doors: state.doors.map((d, idx) =>
              idx === nextIdx ? { ...d, ...updates } : d,
            ),
          }
        }
        return state
      }

      return state
    }),

  applyKeyChange: (change) =>
    set((state) => {
      const { field_name, change_type, current_value, new_value } = change
      const [entityType, fieldName] = field_name.split('.') as [string, string]

      if (entityType !== 'key') return state
      if (fieldName === 'local_id' || fieldName === 'dirty_fields') return state

      if (change_type === 'ADD') {
        const newLocalId = `key_${Math.max(...state.keys.map((k) => parseInt(k.local_id.split('_')[1], 10)), -1) + 1}`
        const newKey: LocalKey = {
          local_id: newLocalId,
          id: '',
          user_id: '',
          door_id: '',
          key_type: '',
          access_start: '',
          access_end: '',
          status: '',
          created_at: new Date().toISOString(),
          dirty_fields: [],
        }
        const updates: Partial<LocalKey> = {}
        updates[fieldName as keyof Omit<LocalKey, 'local_id' | 'dirty_fields'>] = new_value || ''
        return { keys: [...state.keys, { ...newKey, ...updates }] }
      }

      if (change_type === 'DELETE') {
        const keyToDelete = state.keys.find((k) => {
          const val = k[fieldName as keyof LocalKey]
          return current_value && val === current_value
        })
        if (keyToDelete) {
          return { keys: state.keys.filter((k) => k.local_id !== keyToDelete.local_id) }
        }
        return state
      }

      if (change_type === 'UPDATE') {
        const keyToUpdate = state.keys.find((k) => {
          const val = k[fieldName as keyof LocalKey]
          return current_value && val === current_value
        })
        if (keyToUpdate) {
          const updates: Partial<LocalKey> = {}
          updates[fieldName as keyof Omit<LocalKey, 'local_id' | 'dirty_fields'>] = new_value || ''
          return {
            keys: state.keys.map((k) =>
              k.local_id === keyToUpdate.local_id ? { ...k, ...updates } : k,
            ),
          }
        }

        const nextIdx = state.keys.findIndex(
          (k) => parseInt(k.local_id.split('_')[1], 10) === state.keys.length + 1,
        )
        if (nextIdx >= 0) {
          const updates: Partial<LocalKey> = {}
          updates[fieldName as keyof Omit<LocalKey, 'local_id' | 'dirty_fields'>] = new_value || ''
          return {
            keys: state.keys.map((k, idx) =>
              idx === nextIdx ? { ...k, ...updates } : k,
            ),
          }
        }
        return state
      }

      return state
    }),

  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  addDoor: (door) =>
    set((state) => ({
      doors: [...state.doors, door],
    })),

  addKey: (key) =>
    set((state) => ({
      keys: [...state.keys, key],
    })),

  removeUser: (localId) =>
    set((state) => ({
      users: state.users.filter((u) => u.local_id !== localId),
    })),

  removeDoor: (localId) =>
    set((state) => ({
      doors: state.doors.filter((d) => d.local_id !== localId),
    })),

  removeKey: (localId) =>
    set((state) => ({
      keys: state.keys.filter((k) => k.local_id !== localId),
    })),

  resetUserDirtyFields: (localId) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.local_id === localId ? { ...u, dirty_fields: [] } : u,
      ),
    })),

  resetDoorDirtyFields: (localId) =>
    set((state) => ({
      doors: state.doors.map((d) =>
        d.local_id === localId ? { ...d, dirty_fields: [] } : d,
      ),
    })),

  resetKeyDirtyFields: (localId) =>
    set((state) => ({
      keys: state.keys.map((k) =>
        k.local_id === localId ? { ...k, dirty_fields: [] } : k,
      ),
    })),

  clearUserDirtyField: (localId, fieldName) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.local_id === localId
          ? { ...u, dirty_fields: u.dirty_fields.filter((f) => f !== fieldName) }
          : u,
      ),
    })),

  clearDoorDirtyField: (localId, fieldName) =>
    set((state) => ({
      doors: state.doors.map((d) =>
        d.local_id === localId
          ? { ...d, dirty_fields: d.dirty_fields.filter((f) => f !== fieldName) }
          : d,
      ),
    })),

  clearKeyDirtyField: (localId, fieldName) =>
    set((state) => ({
      keys: state.keys.map((k) =>
        k.local_id === localId
          ? { ...k, dirty_fields: k.dirty_fields.filter((f) => f !== fieldName) }
          : k,
      ),
    })),
}))
