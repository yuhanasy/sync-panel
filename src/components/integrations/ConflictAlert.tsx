import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useConflictStore } from '@/stores/conflict_store'

interface Props {
  integration_id: string
}

export function ConflictAlert({ integration_id }: Props) {
  const conflictCount = useConflictStore((s) => s.items.filter((i) => i.integration_id === integration_id).length)

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 font-medium">
          {conflictCount} conflict{conflictCount !== 1 ? 's' : ''} detected — review and resolve before syncing again.
        </p>
      </div>
      <Link
        to={`/integrations/${integration_id}/conflicts`}
        className="text-sm font-medium text-amber-700 hover:text-amber-900 whitespace-nowrap transition-colors"
        aria-label="Resolve conflicts"
      >
        Resolve Conflicts →
      </Link>
    </div>
  )
}
