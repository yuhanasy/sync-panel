import type { ConflictItem } from '@/types'
import { Users, DoorOpen, Key } from 'lucide-react'
import { FieldConflict } from './FieldConflict'

interface Props {
  entity_type: string
  entity_id: string
  items: ConflictItem[]
  onResolve: (id: string, side: 'local' | 'external') => void
}

const entityIcons = {
  user: Users,
  door: DoorOpen,
  key: Key,
}

export function EntityGroup({ entity_type, entity_id, items, onResolve }: Props) {
  const Icon = entityIcons[entity_type as keyof typeof entityIcons] || Users

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
            <Icon className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700 capitalize">{entity_type}</span>
          </div>
          <span className="text-sm font-mono font-semibold text-gray-900">{entity_id}</span>
        </div>
        <span className="text-xs font-medium text-gray-500">{items.length} field conflict{items.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="px-5">
        {items.map((item) => (
          <FieldConflict key={item.id} item={item} onResolve={onResolve} />
        ))}
      </div>
    </div>
  )
}
