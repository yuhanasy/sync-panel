import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useIntegrationStore } from '@/stores/integration_store'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SearchInput } from '@/components/ui/SearchInput'
import { formatDate } from '@/utils/format_date'
import type { Integration } from '@/types'

const STATUS_OPTIONS: { value: Integration['status'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'synced', label: 'Synced' },
  { value: 'syncing', label: 'Syncing' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'conflict', label: 'Conflict' },
  { value: 'error', label: 'Error' },
]


export function IntegrationsList() {
  const integrations = useIntegrationStore((s) => s.integrations)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Integration['status'] | 'all'>('all')

  const filtered = integrations.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">{integrations.length} integrations connected</p>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="w-72">
          <SearchInput value={search} onChange={setSearch} placeholder="Search integrations…" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Integration['status'] | 'all')}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-sm">No integrations match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Integration</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Last Synced</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Version</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Records</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((integration) => (
                <tr
                  key={integration.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/integrations/${integration.id}`}
                      className="flex items-center gap-3 font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      <img
                        src={integration.icon_url}
                        alt={integration.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      {integration.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={integration.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(integration.last_synced)}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">v{integration.version}</td>
                  <td className="px-4 py-3 text-gray-500">{integration.total_records.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
