import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle, FileText } from 'lucide-react'
import { useHistoryStore } from '@/stores/history_store'
import { useIntegrationStore } from '@/stores/integration_store'
import { StatCard } from '@/components/ui/StatCard'
import { VersionChangeCard } from '@/components/history/VersionChangeCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { calcChangeStats } from '@/utils/history_utils'
import { groupChanges } from '@/utils/group_changes'

export function HistoryDetail() {
  const { id, version } = useParams<{ id: string; version: string }>()

  const entry = useHistoryStore((s) =>
    s.entries.find((e) => e.integration_id === id && e.version === version) ?? null
  )
  const integration = useIntegrationStore((s) =>
    s.integrations.find((i) => i.id === id) ?? null
  )

  if (!entry || !integration) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-10 h-10" />}
        title="History entry not found"
        description="The requested history entry could not be found."
        action={
          <Link to={`/integrations/${id}/history`} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Back to History
          </Link>
        }
      />
    )
  }

  const { added, updated, deleted, total } = calcChangeStats(entry.changes)
  const grouped = groupChanges(entry.changes)

  return (
    <div className="space-y-6">
      <Link
        to={`/integrations/${id}/history`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Back to history"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to History
      </Link>

      <h1 className="text-xl font-semibold text-gray-900">
        {integration.name} — Version {version}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Added" value={added} />
        <StatCard label="Updated" value={updated} />
        <StatCard label="Deleted" value={deleted} />
        <StatCard label="Total" value={total} />
      </div>

      {entry.changes.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="No detailed changes"
          description="There are no specific field changes recorded for this version."
        />
      ) : (
        <div className="space-y-8 mt-6">
          <h2 className="text-base font-medium text-gray-900">Detailed Changes</h2>
          {Array.from(grouped).map(([entityType, entities]) => (
            <div key={entityType} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
                {entityType}s
              </h3>
              <div className="space-y-4">
                {Array.from(entities).map(([entityId, changes]) => (
                  <div key={entityId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-mono font-semibold text-gray-900">{entityId}</span>
                      <span className="text-xs font-medium text-gray-500">
                        {changes.length} change{changes.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="p-5 space-y-4">
                      {changes.map((change) => (
                        <VersionChangeCard key={change.id} change={change} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
