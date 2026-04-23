import type { EnrichedChange } from '@/types'
import { FieldConflict } from './FieldConflict'

interface Props {
  entity_type: string
  entity_id: string
  changes: EnrichedChange[]
  selected: Set<string>
  onToggle: (id: string) => void
  onResolve: (id: string, side: 'local' | 'external') => void
}

const CHANGE_TYPE_COLORS = {
  ADD: 'text-green-600',
  UPDATE: 'text-blue-600',
  DELETE: 'text-red-600',
  CONFLICT: 'text-amber-600',
}

export function EntityGroup({ entity_id, changes, selected, onToggle, onResolve }: Props) {
  const conflictCount = changes.filter((c) => c.change_type === 'CONFLICT').length
  const cleanCount = changes.length - conflictCount

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-mono font-semibold text-gray-900">{entity_id}</span>
        <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
          {conflictCount > 0 && (
            <span className={CHANGE_TYPE_COLORS.CONFLICT}>
              {conflictCount} conflict{conflictCount !== 1 ? 's' : ''}
            </span>
          )}
          <span>{cleanCount} change{cleanCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Field rows */}
      <div className="px-5">
        {changes.map((change) => (
          <FieldConflict
            key={change.id}
            change={change}
            selected={selected.has(change.id)}
            onToggle={() => onToggle(change.id)}
            onResolve={onResolve}
          />
        ))}
      </div>
    </div>
  )
}
