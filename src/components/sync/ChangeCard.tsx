import type { SyncChange } from '@/types'

const BADGE_STYLES: Record<SyncChange['change_type'], string> = {
  ADD: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
}

interface ChangeCardProps {
  change: SyncChange
  selected: boolean
  onToggle: () => void
}

export function ChangeCard({ change, selected, onToggle }: ChangeCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 transition-colors ${
        selected ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 rounded border-gray-300 text-blue-600"
          aria-label={`Select change: ${change.field_name}`}
        />
        <span className="text-sm font-medium text-gray-900 font-mono">{change.field_name}</span>
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${BADGE_STYLES[change.change_type]}`}>
          {change.change_type}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 ml-7">
        {change.change_type !== 'ADD' && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current Value</p>
            <p className="text-sm font-mono text-gray-700 bg-gray-50 rounded px-2 py-1 break-all">
              {change.current_value ?? '—'}
            </p>
          </div>
        )}
        {change.change_type !== 'DELETE' && (
          <div className={change.change_type === 'ADD' ? 'col-span-2' : ''}>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">New Value</p>
            <p className="text-sm font-mono text-gray-700 bg-gray-50 rounded px-2 py-1 break-all">
              {change.new_value ?? '—'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
