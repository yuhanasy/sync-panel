import { create } from 'zustand'
import type { LocalUser, LocalDoor, LocalKey } from '@/types'
import { localUsers, localDoors, localKeys } from '@/data/local_entities'

interface LocalEntityStore {
  users: LocalUser[]
  doors: LocalDoor[]
  keys: LocalKey[]

  updateUserField: (localId: string, field: keyof Omit<LocalUser, 'local_id' | 'dirty_fields' | 'pending_values'>, value: string) => void
  updateDoorField: (localId: string, field: keyof Omit<LocalDoor, 'local_id' | 'dirty_fields' | 'pending_values'>, value: string) => void
  updateKeyField: (localId: string, field: keyof Omit<LocalKey, 'local_id' | 'dirty_fields' | 'pending_values'>, value: string) => void

  applyUserChange: (change: { field_name: string; change_type: 'ADD' | 'UPDATE' | 'DELETE'; entity_id?: string; current_value?: string; new_value?: string }) => void
  applyDoorChange: (change: { field_name: string; change_type: 'ADD' | 'UPDATE' | 'DELETE'; entity_id?: string; current_value?: string; new_value?: string }) => void
  applyKeyChange: (change: { field_name: string; change_type: 'ADD' | 'UPDATE' | 'DELETE'; entity_id?: string; current_value?: string; new_value?: string }) => void

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
        const dirty_fields = user.dirty_fields.includes(field)
          ? user.dirty_fields
          : [...user.dirty_fields, field]
        return { ...user, dirty_fields, pending_values: { ...user.pending_values, [field]: value } }
      }),
    })),

  updateDoorField: (localId, field, value) =>
    set((state) => ({
      doors: state.doors.map((door) => {
        if (door.local_id !== localId) return door
        const dirty_fields = door.dirty_fields.includes(field)
          ? door.dirty_fields
          : [...door.dirty_fields, field]
        return { ...door, dirty_fields, pending_values: { ...door.pending_values, [field]: value } }
      }),
    })),

  updateKeyField: (localId, field, value) =>
    set((state) => ({
      keys: state.keys.map((key) => {
        if (key.local_id !== localId) return key
        const dirty_fields = key.dirty_fields.includes(field)
          ? key.dirty_fields
          : [...key.dirty_fields, field]
        return { ...key, dirty_fields, pending_values: { ...key.pending_values, [field]: value } }
      }),
    })),

  applyUserChange: (change) =>
    set((state) => {
      const { field_name, change_type, entity_id, current_value, new_value } = change
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
          pending_values: {},
        }
        const updates: Partial<LocalUser> = {}
        updates[fieldName as keyof Omit<LocalUser, 'local_id' | 'dirty_fields' | 'pending_values'>] = new_value || ''
        return { users: [...state.users, { ...newUser, ...updates }] }
      }

      if (change_type === 'DELETE') {
        const userToDelete = entity_id
          ? state.users.find((u) => u.local_id === entity_id)
          : state.users.find((u) => {
              const val = u[fieldName as keyof LocalUser]
              return current_value && val === current_value
            })
        if (userToDelete) {
          return { users: state.users.filter((u) => u.local_id !== userToDelete.local_id) }
        }
        return state
      }

      if (change_type === 'UPDATE') {
        const userToUpdate = entity_id
          ? state.users.find((u) => u.local_id === entity_id)
          : state.users.find((u) => {
              const val = u[fieldName as keyof LocalUser]
              return current_value && val === current_value
            })
        if (userToUpdate) {
          const updates: Partial<LocalUser> = {}
          updates[fieldName as keyof Omit<LocalUser, 'local_id' | 'dirty_fields' | 'pending_values'>] = new_value || ''
          return {
            users: state.users.map((u) =>
              u.local_id === userToUpdate.local_id ? { ...u, ...updates } : u,
            ),
          }
        }
        return state
      }

      return state
    }),

  applyDoorChange: (change) =>
    set((state) => {
      const { field_name, change_type, entity_id, current_value, new_value } = change
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
          pending_values: {},
        }
        const updates: Partial<LocalDoor> = {}
        updates[fieldName as keyof Omit<LocalDoor, 'local_id' | 'dirty_fields' | 'pending_values'>] = new_value || ''
        return { doors: [...state.doors, { ...newDoor, ...updates }] }
      }

      if (change_type === 'DELETE') {
        const doorToDelete = entity_id
          ? state.doors.find((d) => d.local_id === entity_id)
          : state.doors.find((d) => {
              const val = d[fieldName as keyof LocalDoor]
              return current_value && val === current_value
            })
        if (doorToDelete) {
          return { doors: state.doors.filter((d) => d.local_id !== doorToDelete.local_id) }
        }
        return state
      }

      if (change_type === 'UPDATE') {
        const doorToUpdate = entity_id
          ? state.doors.find((d) => d.local_id === entity_id)
          : state.doors.find((d) => {
              const val = d[fieldName as keyof LocalDoor]
              return current_value && val === current_value
            })
        if (doorToUpdate) {
          const updates: Partial<LocalDoor> = {}
          updates[fieldName as keyof Omit<LocalDoor, 'local_id' | 'dirty_fields' | 'pending_values'>] = new_value || ''
          return {
            doors: state.doors.map((d) =>
              d.local_id === doorToUpdate.local_id ? { ...d, ...updates } : d,
            ),
          }
        }
        return state
      }

      return state
    }),

  applyKeyChange: (change) =>
    set((state) => {
      const { field_name, change_type, entity_id, current_value, new_value } = change
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
          pending_values: {},
        }
        const updates: Partial<LocalKey> = {}
        updates[fieldName as keyof Omit<LocalKey, 'local_id' | 'dirty_fields' | 'pending_values'>] = new_value || ''
        return { keys: [...state.keys, { ...newKey, ...updates }] }
      }

      if (change_type === 'DELETE') {
        const keyToDelete = entity_id
          ? state.keys.find((k) => k.local_id === entity_id)
          : state.keys.find((k) => {
              const val = k[fieldName as keyof LocalKey]
              return current_value && val === current_value
            })
        if (keyToDelete) {
          return { keys: state.keys.filter((k) => k.local_id !== keyToDelete.local_id) }
        }
        return state
      }

      if (change_type === 'UPDATE') {
        const keyToUpdate = entity_id
          ? state.keys.find((k) => k.local_id === entity_id)
          : state.keys.find((k) => {
              const val = k[fieldName as keyof LocalKey]
              return current_value && val === current_value
            })
        if (keyToUpdate) {
          const updates: Partial<LocalKey> = {}
          updates[fieldName as keyof Omit<LocalKey, 'local_id' | 'dirty_fields' | 'pending_values'>] = new_value || ''
          return {
            keys: state.keys.map((k) =>
              k.local_id === keyToUpdate.local_id ? { ...k, ...updates } : k,
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
        u.local_id === localId ? { ...u, dirty_fields: [], pending_values: {} } : u,
      ),
    })),

  resetDoorDirtyFields: (localId) =>
    set((state) => ({
      doors: state.doors.map((d) =>
        d.local_id === localId ? { ...d, dirty_fields: [], pending_values: {} } : d,
      ),
    })),

  resetKeyDirtyFields: (localId) =>
    set((state) => ({
      keys: state.keys.map((k) =>
        k.local_id === localId ? { ...k, dirty_fields: [], pending_values: {} } : k,
      ),
    })),

  clearUserDirtyField: (localId, fieldName) =>
    set((state) => ({
      users: state.users.map((u) => {
        if (u.local_id !== localId) return u
        const pending_values = { ...u.pending_values }
        delete pending_values[fieldName]
        return { ...u, dirty_fields: u.dirty_fields.filter((f) => f !== fieldName), pending_values }
      }),
    })),

  clearDoorDirtyField: (localId, fieldName) =>
    set((state) => ({
      doors: state.doors.map((d) => {
        if (d.local_id !== localId) return d
        const pending_values = { ...d.pending_values }
        delete pending_values[fieldName]
        return { ...d, dirty_fields: d.dirty_fields.filter((f) => f !== fieldName), pending_values }
      }),
    })),

  clearKeyDirtyField: (localId, fieldName) =>
    set((state) => ({
      keys: state.keys.map((k) => {
        if (k.local_id !== localId) return k
        const pending_values = { ...k.pending_values }
        delete pending_values[fieldName]
        return { ...k, dirty_fields: k.dirty_fields.filter((f) => f !== fieldName), pending_values }
      }),
    })),
}))
