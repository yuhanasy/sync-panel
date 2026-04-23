import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useLocalEntityStore } from '@/stores/local_entity_store'
import type { LocalUser, LocalDoor, LocalKey } from '@/types'

type TabType = 'users' | 'doors' | 'keys'

export function LocalData() {
  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  const users = useLocalEntityStore((s) => s.users)
  const doors = useLocalEntityStore((s) => s.doors)
  const keys = useLocalEntityStore((s) => s.keys)
  const updateUserField = useLocalEntityStore((s) => s.updateUserField)
  const updateDoorField = useLocalEntityStore((s) => s.updateDoorField)
  const updateKeyField = useLocalEntityStore((s) => s.updateKeyField)
  const resetUserDirtyFields = useLocalEntityStore((s) => s.resetUserDirtyFields)
  const resetDoorDirtyFields = useLocalEntityStore((s) => s.resetDoorDirtyFields)
  const resetKeyDirtyFields = useLocalEntityStore((s) => s.resetKeyDirtyFields)

  function startEdit(id: string, field: string, value: string) {
    setEditingCell({ id, field })
    setEditValue(value)
  }

  function saveEdit() {
    if (!editingCell) return
    const { id, field } = editingCell

    if (activeTab === 'users') {
      updateUserField(id, field as keyof Omit<LocalUser, 'local_id' | 'dirty_fields'>, editValue)
    } else if (activeTab === 'doors') {
      updateDoorField(id, field as keyof Omit<LocalDoor, 'local_id' | 'dirty_fields'>, editValue)
    } else if (activeTab === 'keys') {
      updateKeyField(id, field as keyof Omit<LocalKey, 'local_id' | 'dirty_fields'>, editValue)
    }

    setEditingCell(null)
  }

  function handleReset(id: string) {
    if (activeTab === 'users') {
      resetUserDirtyFields(id)
    } else if (activeTab === 'doors') {
      resetDoorDirtyFields(id)
    } else if (activeTab === 'keys') {
      resetKeyDirtyFields(id)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Local Data</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage local entities. Edited fields are marked with an amber indicator.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {['users', 'doors', 'keys'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <span className="ml-2 text-xs">
                ({activeTab === 'users' ? users.length : activeTab === 'doors' ? doors.length : keys.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Role</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.local_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{user.local_id}</td>
                  {['name', 'email', 'phone', 'role', 'status'].map((field) => (
                    <td
                      key={field}
                      className={`px-4 py-3 ${user.dirty_fields.includes(field) ? 'bg-amber-50' : ''}`}
                      onClick={() => startEdit(user.local_id, field, user[field as keyof LocalUser] as string)}
                    >
                      {editingCell?.id === user.local_id && editingCell?.field === field ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') setEditingCell(null)
                          }}
                          className="w-full px-2 py-1 border border-blue-400 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="cursor-pointer hover:underline">{user[field as keyof LocalUser]}</span>
                          {user.dirty_fields.includes(field) && (
                            <span className="w-2 h-2 bg-amber-500 rounded-full" title="Modified locally" />
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    {user.dirty_fields.length > 0 && (
                      <button
                        onClick={() => handleReset(user.local_id)}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        title="Reset dirty fields"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Doors Table */}
      {activeTab === 'doors' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Location</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Battery</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {doors.map((door) => (
                <tr key={door.local_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{door.local_id}</td>
                  {['name', 'location', 'status', 'battery_level'].map((field) => (
                    <td
                      key={field}
                      className={`px-4 py-3 ${door.dirty_fields.includes(field) ? 'bg-amber-50' : ''}`}
                      onClick={() => startEdit(door.local_id, field, door[field as keyof LocalDoor] as string)}
                    >
                      {editingCell?.id === door.local_id && editingCell?.field === field ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') setEditingCell(null)
                          }}
                          className="w-full px-2 py-1 border border-blue-400 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="cursor-pointer hover:underline">{door[field as keyof LocalDoor]}</span>
                          {door.dirty_fields.includes(field) && (
                            <span className="w-2 h-2 bg-amber-500 rounded-full" title="Modified locally" />
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    {door.dirty_fields.length > 0 && (
                      <button
                        onClick={() => handleReset(door.local_id)}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        title="Reset dirty fields"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Keys Table */}
      {activeTab === 'keys' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">User ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Door ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.local_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{key.local_id}</td>
                  {['user_id', 'door_id', 'key_type', 'status'].map((field) => (
                    <td
                      key={field}
                      className={`px-4 py-3 ${key.dirty_fields.includes(field) ? 'bg-amber-50' : ''}`}
                      onClick={() => startEdit(key.local_id, field, key[field as keyof LocalKey] as string)}
                    >
                      {editingCell?.id === key.local_id && editingCell?.field === field ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') setEditingCell(null)
                          }}
                          className="w-full px-2 py-1 border border-blue-400 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="cursor-pointer hover:underline">{key[field as keyof LocalKey]}</span>
                          {key.dirty_fields.includes(field) && (
                            <span className="w-2 h-2 bg-amber-500 rounded-full" title="Modified locally" />
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    {key.dirty_fields.length > 0 && (
                      <button
                        onClick={() => handleReset(key.local_id)}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        title="Reset dirty fields"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
