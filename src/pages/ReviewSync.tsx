import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, ArrowLeft, AlertCircle, Inbox, Users, DoorOpen, Key } from 'lucide-react'
import { useReviewSync } from '@/hooks/useReviewSync'
import { EmptyState } from '@/components/ui/EmptyState'
import { EntityGroup } from '@/components/conflicts/EntityGroup'

export function ReviewSync() {
  const { id } = useParams<{ id: string }>()
  const {
    integration,
    groupedChanges,
    counts,
    selected,
    hasUnresolvedConflicts,
    totalChanges,
    handleToggle,
    handleResolve,
    handleSelectAll,
    handleDeselectAll,
    handleCancel,
    handleApprove,
  } = useReviewSync(id)

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

      <div className={`border rounded-lg p-4 flex items-start gap-3 ${
        counts.conflict > 0 ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
      }`}>
        {counts.conflict > 0 ? (
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`text-sm font-medium ${counts.conflict > 0 ? 'text-amber-800' : 'text-blue-800'}`}>
            {counts.conflict > 0 ? 'Conflicts Detected' : 'Approval Required'}
          </p>
          <p className={`text-sm mt-0.5 ${counts.conflict > 0 ? 'text-amber-700' : 'text-blue-600'}`}>
            {counts.conflict > 0
              ? `There ${counts.conflict === 1 ? 'is 1 conflict' : `are ${counts.conflict} conflicts`} that must be resolved before this sync can be fully approved.`
              : 'This sync will update your integration. Please review all changes before approving.'}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatBox label="Added"    value={counts.add} />
        <StatBox label="Updated"  value={counts.update} />
        <StatBox label="Deleted"  value={counts.delete} />
        <StatBox label="Conflicts" value={counts.conflict} />
        <StatBox label="Total"    value={counts.total} />
      </div>

      {/* Select / deselect controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleSelectAll} className="text-sm text-blue-600 hover:underline">
            Select All
          </button>
          <button onClick={handleDeselectAll} className="text-sm text-gray-500 hover:underline">
            Deselect All
          </button>
        </div>
        <span className="text-sm text-gray-500">{selected.size} of {totalChanges} selected</span>
      </div>

      {/* Change list */}
      {totalChanges === 0 ? (
        <EmptyState
          icon={<Inbox className="w-10 h-10" />}
          title="No pending changes"
          description="There are currently no changes to review for this integration."
        />
      ) : (
        <div className="space-y-6">
          {Array.from(groupedChanges.entries()).map(([entityType, byId]) => (
            <div key={entityType} className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 w-fit">
                {(() => { const Icon = { user: Users, door: DoorOpen, key: Key }[entityType as 'user' | 'door' | 'key'] ?? Users; return <Icon className="w-4 h-4 text-blue-600" /> })()}
                <span className="text-xs font-medium text-blue-700 capitalize">{entityType}s</span>
              </div>
              <div className="space-y-3">
                {Array.from(byId.entries()).map(([entityId, changes]) => (
                  <EntityGroup
                    key={`${entityType}-${entityId}`}
                    entity_type={entityType}
                    entity_id={entityId}
                    changes={changes}
                    selected={selected}
                    onToggle={handleToggle}
                    onResolve={handleResolve}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel Sync
        </button>
        <div className="flex items-center gap-3">
          {(selected.size === 0 || hasUnresolvedConflicts) && (
            <span className="text-sm text-red-600 font-medium">
              {selected.size === 0 ? 'Select at least one change to approve' : 'Resolve all selected conflicts first'}
            </span>
          )}
          <button
            onClick={handleApprove}
            disabled={selected.size === 0 || hasUnresolvedConflicts}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve {selected.size} Changes
          </button>
        </div>
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
