import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle2, ArrowLeft, AlertCircle, Inbox } from 'lucide-react'
import { useIntegrationStore } from '@/stores/integration_store'
import { useHistoryStore } from '@/stores/history_store'
import { useLocalEntityStore } from '@/stores/local_entity_store'
import { ChangeCard } from '@/components/sync/ChangeCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { FieldConflict } from '@/components/conflicts/FieldConflict'
import { detectConflicts } from '@/utils/conflict_detection'
import type { ConflictItem } from '@/types'

export function ReviewSync() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const integration = useIntegrationStore((s) => s.integrations.find((i) => i.id === id))
  const pendingChanges = useIntegrationStore((s) => s.pending_changes)
  const bumpVersion = useIntegrationStore((s) => s.bumpVersion)
  const updateStatus = useIntegrationStore((s) => s.updateStatus)
  const addEntry = useHistoryStore((s) => s.addEntry)

  const users = useLocalEntityStore((s) => s.users)
  const doors = useLocalEntityStore((s) => s.doors)
  const keys = useLocalEntityStore((s) => s.keys)
  const applyUserChange = useLocalEntityStore((s) => s.applyUserChange)
  const applyDoorChange = useLocalEntityStore((s) => s.applyDoorChange)
  const applyKeyChange = useLocalEntityStore((s) => s.applyKeyChange)

  const [selected, setSelected] = useState<Set<string>>(() => new Set(pendingChanges.map((c) => c.id)))
  const [resolutions, setResolutions] = useState<Map<string, 'local' | 'external'>>(new Map())

  const { conflicts, cleanChanges } = useMemo(() => {
    const detected = detectConflicts(pendingChanges, { users, doors, keys })
    const conflictChangeIds = new Set(detected.map((c) => {
      const [entityType, fieldName] = c.field_name.split('.')
      return pendingChanges.find((ch) => {
        const [chType, chField] = ch.field_name.split('.')
        return chType === entityType && chField === fieldName && ch.change_type === 'UPDATE'
      })?.id
    }).filter(Boolean))

    const conflictItems: ConflictItem[] = detected.map((dc) => ({
      id: dc.id,
      integration_id: id!,
      entity_type: dc.entity_type,
      entity_id: dc.local_id,
      field_name: dc.field_name,
      local_value: dc.local_value,
      external_value: dc.external_value,
      resolution: resolutions.get(dc.id) ?? null,
    }))

    const clean = pendingChanges.filter((c) => !conflictChangeIds.has(c.id))

    return { conflicts: conflictItems, cleanChanges: clean }
  }, [pendingChanges, users, doors, keys, resolutions, id])

  const counts = useMemo(() => ({
    add: cleanChanges.filter((c) => c.change_type === 'ADD').length,
    update: cleanChanges.filter((c) => c.change_type === 'UPDATE').length,
    delete: cleanChanges.filter((c) => c.change_type === 'DELETE').length,
    conflict: conflicts.length,
  }), [cleanChanges, conflicts])

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

  function handleResolveConflict(conflictId: string, side: 'local' | 'external') {
    setResolutions((prev) => new Map(prev).set(conflictId, side))
  }

  function handleCancel() {
    const unresolvedCount = conflicts.filter((c) => c.resolution === null).length
    const newStatus = unresolvedCount > 0 ? 'conflict' : 'pending_approve'
    updateStatus(integration!.id, newStatus)
    navigate(`/integrations/${integration!.id}`)
  }

  function handleApprove() {
    if (selected.size === 0) return

    try {
      const versionParts = integration!.version.split('.').map(Number)
      versionParts[2] = (versionParts[2] ?? 0) + 1
      const newVersion = versionParts.join('.')

      bumpVersion(integration!.id)

      const selectedChanges = pendingChanges.filter((c) => selected.has(c.id))
      const selectedConflicts = conflicts.filter((c) => resolutions.has(c.id))

      // Apply resolved conflicts to local store
      for (const conflict of selectedConflicts) {
        const resolution = resolutions.get(conflict.id)
        if (!resolution) continue

        const [entityType, fieldName] = conflict.field_name.split('.')
        const changeForConflict = pendingChanges.find((c) => {
          const [chType, chField] = c.field_name.split('.')
          return chType === entityType && chField === fieldName && c.change_type === 'UPDATE'
        })

        if (!changeForConflict) continue

        if (resolution === 'external') {
          if (entityType === 'user') {
            applyUserChange(changeForConflict)
          } else if (entityType === 'door') {
            applyDoorChange(changeForConflict)
          } else if (entityType === 'key') {
            applyKeyChange(changeForConflict)
          }
        }
      }

      // Apply clean changes to local store
      for (const change of selectedChanges) {
        const [entityType] = change.field_name.split('.')
        if (entityType === 'user') {
          applyUserChange(change)
        } else if (entityType === 'door') {
          applyDoorChange(change)
        } else if (entityType === 'key') {
          applyKeyChange(change)
        }
      }

      // Build history changes with real entity_type/entity_id from conflicts
      const historyChanges = selectedChanges.map((c) => {
        const conflictForChange = conflicts.find((conf) => {
          const [confType, confField] = conf.field_name.split('.')
          const [chType, chField] = c.field_name.split('.')
          return confType === chType && confField === chField && c.change_type === 'UPDATE'
        })

        return {
          id: c.id,
          entity_type: conflictForChange?.entity_type ?? 'Record',
          entity_id: conflictForChange?.entity_id ?? c.id,
          field_name: c.field_name,
          change_type: c.change_type,
          previous_value: c.current_value,
          new_value: c.new_value,
        }
      })

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
        changes: historyChanges,
      })

      updateStatus(integration!.id, 'synced')
      toast.success('Sync approved', { description: `Applied ${selectedChanges.length} changes` })
      navigate(`/integrations/${integration!.id}`)
    } catch (error) {
      toast.error('Failed to approve sync', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
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

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatBox label="Added" value={counts.add} />
        <StatBox label="Updated" value={counts.update} />
        <StatBox label="Deleted" value={counts.delete} />
        <StatBox label="Conflicts" value={counts.conflict} />
        <StatBox label="Total" value={pendingChanges.length} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(new Set([...cleanChanges.map((c) => c.id), ...conflicts.filter((c) => c.resolution).map((c) => {
              const changeForConflict = pendingChanges.find((ch) => {
                const [chType, chField] = ch.field_name.split('.')
                const [cType, cField] = c.field_name.split('.')
                return chType === cType && chField === cField && ch.change_type === 'UPDATE'
              })
              return changeForConflict?.id || ''
            }).filter(Boolean)]))}
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
        <div className="space-y-6">
          {conflicts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-gray-900">Conflicting Changes</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                {conflicts.map((conflict) => (
                  <FieldConflict
                    key={conflict.id}
                    item={conflict}
                    onResolve={handleResolveConflict}
                  />
                ))}
              </div>
            </div>
          )}

          {cleanChanges.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-gray-900">Clean Changes</h2>
              {cleanChanges.map((change) => (
                <ChangeCard
                  key={change.id}
                  change={change}
                  selected={selected.has(change.id)}
                  onToggle={() => toggleChange(change.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel Sync
        </button>
        <button
          onClick={handleApprove}
          disabled={selected.size === 0 || conflicts.some((c) => c.resolution === null)}
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
