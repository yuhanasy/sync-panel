import type { Integration } from '@/types'

const config: Record<Integration['status'], { label: string; bg: string; text: string; dot?: string }> = {
  synced: { label: 'Synced', bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  syncing: { label: 'Syncing', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  conflict: { label: 'Conflict', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  pending_approve: { label: 'Pending Review', bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  error: { label: 'Error', bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
}

interface Props {
  status: Integration['status']
}

export function StatusBadge({ status }: Props) {
  const { label, bg, text, dot } = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'syncing' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}
