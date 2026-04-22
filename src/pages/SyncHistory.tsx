import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useHistoryStore } from '@/stores/history_store'
import type { HistoryEntry } from '@/types'

const SOURCE_STYLES: Record<HistoryEntry['source'], string> = {
  System: 'bg-blue-100 text-blue-700',
  User: 'bg-purple-100 text-purple-700',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SyncHistory() {
  const { id } = useParams<{ id: string }>()

  const entries = useHistoryStore(
    useShallow((s) =>
      [...s.entries]
        .filter((e) => e.integration_id === id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    )
  )

  return (
    <div className="space-y-6">
      <Link
        to={`/integrations/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Back to integration"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Integration
      </Link>

      <h1 className="text-xl font-semibold text-gray-900">Sync History</h1>

      {entries.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-gray-400">No sync history yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
              {entries.map((entry) => (
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
                        to={`/integrations/${id}/history/${entry.version}`}
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
        </div>
      )}
    </div>
  )
}
