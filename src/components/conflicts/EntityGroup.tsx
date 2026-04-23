import type { ConflictItem } from '@/types'
import { FieldConflict } from './FieldConflict'

interface Props {
  entity_id: string
  items: ConflictItem[]
  onResolve: (id: string, side: 'local' | 'external') => void
}

export function EntityGroup({ entity_id, items, onResolve }: Props) {
  const resolvedCount = items.filter((i) => i.resolution !== null).length

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-mono font-medium text-gray-700">{entity_id}</span>
        <span className="text-xs text-gray-400">{resolvedCount}/{items.length} resolved</span>
      </div>
      <div className="px-5">
        {items.map((item) => (
          <FieldConflict key={item.id} item={item} onResolve={onResolve} />
        ))}
      </div>
    </div>
  )
}
