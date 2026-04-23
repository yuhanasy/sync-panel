import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { RefreshCw, XCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/utils/format_date'
import { useIntegrationStore } from '@/stores/integration_store'
import { useHistoryStore } from '@/stores/history_store'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConflictAlert } from '@/components/integrations/ConflictAlert'
import { useSyncNow } from '@/api/sync_api'
import { useLocalEntityStore } from '@/stores/local_entity_store'
import { enrichChanges } from '@/utils/enrich_changes'
import type { HistoryEntry } from '@/types'

const SOURCE_STYLES: Record<HistoryEntry['source'], string> = {
  System: 'bg-blue-100 text-blue-700',
  User: 'bg-purple-100 text-purple-700',
}

export function IntegrationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const integration = useIntegrationStore((s) => s.integrations.find((i) => i.id === id))
  const setPendingChanges = useIntegrationStore((s) => s.setPendingChanges)
  const updateStatus = useIntegrationStore((s) => s.updateStatus)
  const syncMutation = useSyncNow()
  const users = useLocalEntityStore((s) => s.users)
  const doors = useLocalEntityStore((s) => s.doors)
  const keys = useLocalEntityStore((s) => s.keys)
  const realHistory = useHistoryStore((s) => s.entries)
  
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingStats(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (!integration) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-10 h-10" />}
        title="Integration not found"
        description="The integration you're looking for doesn't exist or has been removed."
        action={
          <Link to="/" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Go back home
          </Link>
        }
      />
    )
  }

  const recentHistory = realHistory
    .filter((h) => h.integration_id === integration.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  const integrationId = integration.id
  const isConflict = integration.status === 'conflict'
  const isSyncing = integration.status === 'syncing'
  const syncDisabled = isConflict || isSyncing || syncMutation.isPending

  function handleSyncNow() {
    updateStatus(integrationId, 'syncing')
    syncMutation.mutate(integrationId, {
      onSuccess: (changes) => {
        setPendingChanges(changes)
        
        // Determine status immediately so back/cancel works correctly
        if (changes.length === 0) {
          updateStatus(integrationId, 'synced')
          toast.success('Already up to date', { description: 'No changes from the integration.' })
          return
        }

        const enriched = enrichChanges(changes, { users, doors, keys })
        const hasConflicts = enriched.some(c => c.change_type === 'CONFLICT')
        updateStatus(integrationId, hasConflicts ? 'conflict' : 'pending_review')

        toast.success('Sync data fetched', { description: `${changes.length} changes to review` })
        navigate(`/integrations/${integrationId}/review`)
      },
      onError: () => {
        updateStatus(integrationId, 'error')
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={integration.icon_url}
            alt={integration.name}
            className="w-10 h-10 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{integration.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={integration.status} />
              <span className="text-xs text-gray-400 font-mono">v{integration.version}</span>
            </div>
          </div>
        </div>
        {integration.status === 'pending_review' ? (
          <Link
            to={`/integrations/${integration.id}/review`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
          >
            Pending Review →
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleSyncNow}
            disabled={syncDisabled}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              syncDisabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${syncMutation.isPending || isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        )}
      </div>

      {/* Sync error */}
      {syncMutation.isError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Sync failed</p>
            <p className="text-sm text-red-600 mt-0.5">{syncMutation.error?.message}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncNow}
              className="text-red-600 hover:text-red-700 text-xs font-medium underline"
              aria-label="Retry sync"
            >
              Retry
            </button>
            <button
              onClick={() => syncMutation.reset()}
              className="text-red-400 hover:text-red-600 text-xs underline"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Conflict Alert */}
      {isConflict && <ConflictAlert integration_id={integration.id} />}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Records"
          value={integration.total_records.toLocaleString()}
          isLoading={isLoadingStats}
        />
        <StatCard
          label="Last Sync Duration"
          value={`${integration.last_sync_duration}s`}
          isLoading={isLoadingStats}
        />
        <StatCard
          label="Last Synced"
          value={formatDate(integration.last_synced)}
          isLoading={isLoadingStats}
        />
      </div>

      {/* Sync Summary */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Recent Sync History</h2>
          <Link
            to={`/integrations/${integration.id}/history`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            See all history &rarr;
          </Link>
        </div>
          {recentHistory.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No sync history yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Timestamp
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Source
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Version
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Summary
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(entry.timestamp)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${SOURCE_STYLES[entry.source]}`}>
                        {entry.source}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">
                      v{entry.version}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{entry.summary}</td>
                    <td className="px-5 py-3 text-right">
                      {entry.version && (
                        <Link
                          to={`/integrations/${integrationId}/history/${entry.version}`}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline whitespace-nowrap"
                          aria-label="View changes"
                        >
                          View Changes
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
    </div>
  )
}
