import type { VersionChange } from '@/types'

const BADGE_STYLES: Record<VersionChange['change_type'], string> = {
  ADD: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
}

interface Props {
  change: VersionChange
}

export function VersionChangeCard({ change }: Props) {
  return (
    <div className="border border-gray-200 bg-white rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-xs text-gray-400">{change.entity_type} · {change.entity_id}</span>
        <span className="text-sm font-medium text-gray-900 font-mono">{change.field_name}</span>
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${BADGE_STYLES[change.change_type]}`}>
          {change.change_type}
        </span>
      </div>
      <div className="space-y-2">
        {change.change_type !== 'ADD' && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Previous Value</p>
            <p className="text-sm font-mono text-gray-700 bg-gray-50 rounded px-2 py-1 break-all">
              {change.previous_value ?? '—'}
            </p>
          </div>
        )}
        {change.change_type !== 'DELETE' && (
          <div>
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
