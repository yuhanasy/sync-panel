import type { ConflictItem } from '@/types'

interface Props {
  item: ConflictItem
  onResolve?: (id: string, side: 'local' | 'external') => void
  isResolvable?: boolean
  selected?: boolean
  onToggle?: () => void
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  return String(value)
}

export function FieldConflict({ item, onResolve, isResolvable = true, selected = false, onToggle }: Props) {
  const fieldName = item.field_name.split('.').pop() ?? item.field_name
  const isResolved = item.resolution !== null

  return (
    <div className="space-y-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onToggle && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          )}
          <h3 className="text-sm font-semibold text-gray-900">{fieldName}</h3>
        </div>
        {isResolvable && !isResolved && (
          <span className="text-xs font-medium text-red-600">Selection required</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Current (Local)</span>
            {isResolvable && (
              <button
                onClick={() => onResolve?.(item.id, 'local')}
                className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                  item.resolution === 'local'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                Use This
              </button>
            )}
          </div>
          <div className={`rounded-lg border p-3 ${item.resolution === 'local' && isResolvable ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
            <p className="text-sm font-mono text-gray-800 break-all">{formatValue(item.local_value)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">New (External)</span>
            {isResolvable && (
              <button
                onClick={() => onResolve?.(item.id, 'external')}
                className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                  item.resolution === 'external'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                Use This
              </button>
            )}
          </div>
          <div className={`rounded-lg border p-3 ${item.resolution === 'external' && isResolvable ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}>
            <p className="text-sm font-mono text-gray-800 break-all">{formatValue(item.external_value)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
