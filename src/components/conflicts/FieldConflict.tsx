import type { ConflictItem } from '@/types'

interface Props {
  item: ConflictItem
  onResolve: (id: string, side: 'local' | 'external') => void
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  return String(value)
}

export function FieldConflict({ item, onResolve }: Props) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center py-3 border-b border-gray-50 last:border-0">
      <div className={`rounded-lg border p-3 ${item.resolution === 'local' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
        <p className="text-xs text-gray-500 mb-1">Local</p>
        <p className="text-sm font-mono text-gray-800 break-all">{formatValue(item.local_value)}</p>
        <button
          onClick={() => onResolve(item.id, 'local')}
          className={`mt-2 text-xs px-2 py-1 rounded font-medium transition-colors ${
            item.resolution === 'local'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
          }`}
        >
          Use This
        </button>
      </div>

      <div className="text-center text-xs text-gray-400 font-medium">{item.field_name}</div>

      <div className={`rounded-lg border p-3 ${item.resolution === 'external' ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white'}`}>
        <p className="text-xs text-gray-500 mb-1">External</p>
        <p className="text-sm font-mono text-gray-800 break-all">{formatValue(item.external_value)}</p>
        <button
          onClick={() => onResolve(item.id, 'external')}
          className={`mt-2 text-xs px-2 py-1 rounded font-medium transition-colors ${
            item.resolution === 'external'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
          }`}
        >
          Use This
        </button>
      </div>
    </div>
  )
}
