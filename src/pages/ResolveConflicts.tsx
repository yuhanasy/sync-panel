import { useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, GitMerge } from 'lucide-react'
import { useConflictStore } from '@/stores/conflict_store'
import { useIntegrationStore } from '@/stores/integration_store'
import { useHistoryStore } from '@/stores/history_store'
import { EntityGroup } from '@/components/conflicts/EntityGroup'
import { useShallow } from 'zustand/react/shallow'

export function ResolveConflicts() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const items = useConflictStore(useShallow((s) => s.items.filter((i) => i.integration_id === id)))
  const resolve = useConflictStore((s) => s.resolve)
  const resolveAll = useConflictStore((s) => s.resolveAll)
  const clearResolved = useConflictStore((s) => s.clearResolved)
  const updateStatus = useIntegrationStore((s) => s.updateStatus)
  const addEntry = useHistoryStore((s) => s.addEntry)

  const resolvedCount = items.filter((i) => i.resolution !== null).length
  const allResolved = items.length > 0 && resolvedCount === items.length

  const entityGroups = useMemo(() => {
    const map = new Map<string, typeof items>()
    for (const item of items) {
      const key = `${item.entity_type}::${item.entity_id}`
      const existing = map.get(key) ?? []
      map.set(key, [...existing, item])
    }
    return Array.from(map.entries()).map(([key, groupItems]) => {
      const [entity_type, entity_id] = key.split('::')
      return { entity_type, entity_id, items: groupItems }
    })
  }, [items])

  function handleMerge() {
    if (!id || !allResolved) return
    updateStatus(id, 'synced')
    clearResolved(id)
    addEntry({
      id: `h-${Date.now()}`,
      integration_id: id,
      timestamp: new Date().toISOString(),
      source: 'User',
      version: '',
      summary: `Conflict resolution — ${resolvedCount} fields merged`,
      changes: [],
    })
    navigate(`/integrations/${id}`)
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/integrations/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Back to integration"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Integration
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Resolve Conflicts</h1>
          <p className="text-sm text-gray-400 mt-1">
            Choose which value to keep for each conflicting field
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => id && resolveAll(id, 'local')}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Accept All Local
          </button>
          <button
            onClick={() => id && resolveAll(id, 'external')}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Accept All External
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {entityGroups.map(({ entity_type, entity_id, items: groupItems }) => (
          <EntityGroup
            key={`${entity_type}::${entity_id}`}
            entity_type={entity_type}
            entity_id={entity_id}
            items={groupItems}
            onResolve={resolve}
          />
        ))}
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-gray-100">
        <button
          onClick={handleMerge}
          disabled={!allResolved}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <GitMerge className="w-4 h-4" />
          Merge Changes ({resolvedCount}/{items.length})
        </button>
      </div>
    </div>
  )
}
