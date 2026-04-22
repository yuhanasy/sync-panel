import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useHistoryStore } from '@/stores/history_store'
import { useIntegrationStore } from '@/stores/integration_store'
import { StatCard } from '@/components/ui/StatCard'
import { VersionChangeCard } from '@/components/history/VersionChangeCard'

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
      <div className="text-center py-20">
        <p className="text-gray-500 text-sm">History entry not found.</p>
      </div>
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
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">No changes recorded for this version.</p>
        </div>
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
