import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useIntegrationStore } from '@/stores/integration_store'
import { useHistoryStore } from '@/stores/history_store'
import { useLocalEntityStore } from '@/stores/local_entity_store'
import { enrichChanges } from '@/utils/enrich_changes'
import { groupChanges } from '@/utils/group_changes'
import type { EnrichedChange } from '@/types'

export function useReviewSync(integrationId: string | undefined) {
  const navigate = useNavigate()

  // ── Store selectors ──────────────────────────────────────────────────────
  const integration = useIntegrationStore((s) =>
    s.integrations.find((i) => i.id === integrationId),
  )
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
  const clearUserDirtyField = useLocalEntityStore((s) => s.clearUserDirtyField)
  const clearDoorDirtyField = useLocalEntityStore((s) => s.clearDoorDirtyField)
  const clearKeyDirtyField = useLocalEntityStore((s) => s.clearKeyDirtyField)

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(pendingChanges.map((c) => c.id)),
  )
  const [resolutions, setResolutions] = useState<Map<string, 'local' | 'external'>>(new Map())

  // ── Derived: enrich + group ───────────────────────────────────────────────
  const enriched = useMemo(
    () => enrichChanges(pendingChanges, { users, doors, keys }),
    [pendingChanges, users, doors, keys],
  )

  // Merge resolutions into enriched list so components see current resolution state
  const enrichedWithResolutions = useMemo<EnrichedChange[]>(
    () =>
      enriched.map((c) =>
        c.change_type === 'CONFLICT'
          ? { ...c, resolution: resolutions.get(c.id) ?? null }
          : c,
      ),
    [enriched, resolutions],
  )

  const groupedChanges = useMemo(
    () => groupChanges(enrichedWithResolutions),
    [enrichedWithResolutions],
  )

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = useMemo(
    () => ({
      add: enriched.filter((c) => c.change_type === 'ADD').length,
      update: enriched.filter((c) => c.change_type === 'UPDATE').length,
      delete: enriched.filter((c) => c.change_type === 'DELETE').length,
      conflict: enriched.filter((c) => c.change_type === 'CONFLICT').length,
      total: enriched.length,
    }),
    [enriched],
  )

  // Block approve only if a SELECTED conflict has no resolution yet
  const hasUnresolvedConflicts = useMemo(
    () =>
      enrichedWithResolutions.some(
        (c) => c.change_type === 'CONFLICT' && selected.has(c.id) && (c.resolution ?? null) === null,
      ),
    [enrichedWithResolutions, selected],
  )

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleToggle(changeId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(changeId)) next.delete(changeId)
      else next.add(changeId)
      return next
    })
  }

  function handleResolve(conflictId: string, side: 'local' | 'external') {
    setResolutions((prev) => new Map(prev).set(conflictId, side))
    // Auto-select resolved conflicts
    setSelected((prev) => new Set(prev).add(conflictId))
  }

  function handleSelectAll() {
    const ids = enrichedWithResolutions
      .filter((c) => c.change_type !== 'CONFLICT' || (c.resolution ?? null) !== null)
      .map((c) => c.id)
    setSelected(new Set(ids))
  }

  function handleDeselectAll() {
    setSelected(new Set())
  }

  function handleCancel() {
    const newStatus = hasUnresolvedConflicts ? 'conflict' : 'pending_review'
    updateStatus(integration!.id, newStatus)
    navigate(`/integrations/${integration!.id}`)
  }

  function handleApprove() {
    if (selected.size === 0 || !integration) return

    try {
      const versionParts = integration.version.split('.').map(Number)
      versionParts[2] = (versionParts[2] ?? 0) + 1
      const newVersion = versionParts.join('.')

      bumpVersion(integration.id)

      const selectedChanges = enrichedWithResolutions.filter((c) => selected.has(c.id))

      for (const change of selectedChanges) {
        const applyChange = (change: EnrichedChange) => {
          const storeChange = {
            field_name: change.field_name,
            change_type: (change.change_type === 'CONFLICT' ? 'UPDATE' : change.change_type) as
              | 'ADD'
              | 'UPDATE'
              | 'DELETE',
            entity_id: change.entity_id,
            current_value: change.committed_value,
            // For CONFLICT: use chosen side's value
            new_value:
              change.change_type === 'CONFLICT'
                ? change.resolution === 'local'
                  ? change.local_value
                  : change.external_value
                : change.new_value,
          }

          if (change.entity_type === 'user') applyUserChange(storeChange)
          else if (change.entity_type === 'door') applyDoorChange(storeChange)
          else if (change.entity_type === 'key') applyKeyChange(storeChange)
        }

        if (change.change_type === 'CONFLICT') {
          applyChange(change)
          // Clear dirty flag regardless of which side won
          if (change.entity_type === 'user')
            clearUserDirtyField(change.entity_id, change.field_name.split('.')[1])
          else if (change.entity_type === 'door')
            clearDoorDirtyField(change.entity_id, change.field_name.split('.')[1])
          else if (change.entity_type === 'key')
            clearKeyDirtyField(change.entity_id, change.field_name.split('.')[1])
        } else {
          applyChange(change)
        }
      }

      // Build history entry
      const historyChanges = selectedChanges.map((c) => ({
        id: c.id,
        entity_type: c.entity_type,
        entity_id: c.entity_id,
        field_name: c.field_name,
        change_type: (c.change_type === 'CONFLICT' ? 'UPDATE' : c.change_type) as
          | 'ADD'
          | 'UPDATE'
          | 'DELETE',
        previous_value: c.committed_value,
        new_value:
          c.change_type === 'CONFLICT'
            ? c.resolution === 'local'
              ? c.local_value
              : c.external_value
            : c.new_value,
      }))

      const summaryParts: string[] = []
      const addCount = selectedChanges.filter((c) => c.change_type === 'ADD').length
      const updateCount = selectedChanges.filter(
        (c) => c.change_type === 'UPDATE' || c.change_type === 'CONFLICT',
      ).length
      const deleteCount = selectedChanges.filter((c) => c.change_type === 'DELETE').length
      if (addCount) summaryParts.push(`${addCount} added`)
      if (updateCount) summaryParts.push(`${updateCount} updated`)
      if (deleteCount) summaryParts.push(`${deleteCount} deleted`)

      addEntry({
        id: `h-${Date.now()}`,
        integration_id: integration.id,
        timestamp: new Date().toISOString(),
        source: 'User',
        version: newVersion,
        summary: `Manual sync — ${summaryParts.join(', ')}`,
        changes: historyChanges,
      })

      // If any conflicts were skipped (unchecked), integration remains in conflict state
      const hasSkippedConflicts = enrichedWithResolutions.some(
        (c) => c.change_type === 'CONFLICT' && !selected.has(c.id),
      )
      updateStatus(integration.id, hasSkippedConflicts ? 'conflict' : 'synced')
      toast.success('Sync approved', {
        description: `Applied ${selectedChanges.length} changes`,
      })
      navigate(`/integrations/${integration.id}`)
    } catch (error) {
      toast.error('Failed to approve sync', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return {
    integration,
    groupedChanges,
    counts,
    selected,
    hasUnresolvedConflicts,
    totalChanges: enriched.length,
    handleToggle,
    handleResolve,
    handleSelectAll,
    handleDeselectAll,
    handleCancel,
    handleApprove,
  }
}
