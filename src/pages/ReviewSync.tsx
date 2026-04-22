import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, ArrowLeft, AlertCircle, Inbox } from 'lucide-react'
import { useIntegrationStore } from '@/stores/integration_store'
import { useHistoryStore } from '@/stores/history_store'
import { ChangeCard } from '@/components/sync/ChangeCard'
import { EmptyState } from '@/components/ui/EmptyState'

export function ReviewSync() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const integration = useIntegrationStore((s) => s.integrations.find((i) => i.id === id))
  const pendingChanges = useIntegrationStore((s) => s.pending_changes)
  const bumpVersion = useIntegrationStore((s) => s.bumpVersion)
  const updateStatus = useIntegrationStore((s) => s.updateStatus)
  const addEntry = useHistoryStore((s) => s.addEntry)

  const [selected, setSelected] = useState<Set<string>>(() => new Set(pendingChanges.map((c) => c.id)))

  const counts = useMemo(() => ({
    add: pendingChanges.filter((c) => c.change_type === 'ADD').length,
    update: pendingChanges.filter((c) => c.change_type === 'UPDATE').length,
    delete: pendingChanges.filter((c) => c.change_type === 'DELETE').length,
  }), [pendingChanges])

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

  function toggleChange(changeId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(changeId)) next.delete(changeId)
      else next.add(changeId)
      return next
    })
  }

  function handleApprove() {
    if (selected.size === 0) return

    const versionParts = integration!.version.split('.').map(Number)
    versionParts[2] = (versionParts[2] ?? 0) + 1
    const newVersion = versionParts.join('.')

    bumpVersion(integration!.id)

    const selectedChanges = pendingChanges.filter((c) => selected.has(c.id))
    const addCount = selectedChanges.filter((c) => c.change_type === 'ADD').length
    const updateCount = selectedChanges.filter((c) => c.change_type === 'UPDATE').length
    const deleteCount = selectedChanges.filter((c) => c.change_type === 'DELETE').length
    const summaryParts: string[] = []
    if (addCount) summaryParts.push(`${addCount} added`)
    if (updateCount) summaryParts.push(`${updateCount} updated`)
    if (deleteCount) summaryParts.push(`${deleteCount} deleted`)

    addEntry({
      id: `h-${Date.now()}`,
      integration_id: integration!.id,
      timestamp: new Date().toISOString(),
      source: 'User',
      version: newVersion,
      summary: `Manual sync — ${summaryParts.join(', ')}`,
      changes: selectedChanges.map((c) => ({
        id: c.id,
        entity_type: 'Record',
        entity_id: c.id,
        field_name: c.field_name,
        change_type: c.change_type,
        previous_value: c.current_value,
        new_value: c.new_value,
      })),
    })

    updateStatus(integration!.id, 'synced')
    navigate(`/integrations/${integration!.id}`)
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/integrations/${integration.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Integration
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {integration.name} — Review Sync Changes
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Review and approve changes before they are applied to your system
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Approval Required</p>
          <p className="text-sm text-blue-600 mt-0.5">
            This sync will update your integration. Please review all changes before approving.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox label="Added" value={counts.add} />
        <StatBox label="Updated" value={counts.update} />
        <StatBox label="Deleted" value={counts.delete} />
        <StatBox label="Total" value={pendingChanges.length} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(new Set(pendingChanges.map((c) => c.id)))}
            className="text-sm text-blue-600 hover:underline"
          >
            Select All
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-gray-500 hover:underline"
          >
            Deselect All
          </button>
        </div>
        <span className="text-sm text-gray-500">{selected.size} of {pendingChanges.length} selected</span>
      </div>

      {pendingChanges.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-10 h-10" />}
          title="No pending changes"
          description="There are currently no changes to review for this integration."
        />
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-900">Detailed Changes</h2>
          {pendingChanges.map((change) => (
            <ChangeCard
              key={change.id}
              change={change}
              selected={selected.has(change.id)}
              onToggle={() => toggleChange(change.id)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={() => { updateStatus(integration.id, 'synced'); navigate(`/integrations/${integration.id}`) }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel Sync
        </button>
        <button
          onClick={handleApprove}
          disabled={selected.size === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Approve {selected.size} Changes
        </button>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
