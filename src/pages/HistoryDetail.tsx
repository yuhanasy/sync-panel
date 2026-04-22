import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle, FileText } from 'lucide-react'
import { useHistoryStore } from '@/stores/history_store'
import { useIntegrationStore } from '@/stores/integration_store'
import { StatCard } from '@/components/ui/StatCard'
import { VersionChangeCard } from '@/components/history/VersionChangeCard'
import { EmptyState } from '@/components/ui/EmptyState'

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

  const added = entry.changes.filter((c) => c.change_type === 'ADD').length
  const updated = entry.changes.filter((c) => c.change_type === 'UPDATE').length
  const deleted = entry.changes.filter((c) => c.change_type === 'DELETE').length
  const total = entry.changes.length

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
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-900">Detailed Changes</h2>
          {entry.changes.map((change) => (
            <VersionChangeCard key={change.id} change={change} />
          ))}
        </div>
      )}
    </div>
  )
}
