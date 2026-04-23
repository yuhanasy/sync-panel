import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useIntegrationStore } from '@/stores/integration_store'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

function Breadcrumb() {
  const location = useLocation()
  const { id, version } = useParams()
  const integrations = useIntegrationStore((s) => s.integrations)
  const integration = integrations.find((i) => i.id === id)

  const segments: { label: string; href?: string }[] = [
    { label: 'Integrations', href: '/' },
  ]

  if (integration) {
    segments.push({ label: integration.name, href: `/integrations/${id}` })
  }

  const path = location.pathname
  if (id && path.endsWith('/review')) {
    segments.push({ label: 'Review Sync' })
  } else if (version) {
    segments.push({ label: 'History', href: `/integrations/${id}/history` })
    segments.push({ label: `v${version}` })
  } else if (id && path.endsWith('/history')) {
    segments.push({ label: 'History' })
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500" aria-label="Breadcrumb">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-300">/</span>}
          {seg.href && i < segments.length - 1 ? (
            <Link to={seg.href} className="hover:text-gray-800 transition-colors">
              {seg.label}
            </Link>
          ) : (
            <span className={i === segments.length - 1 ? 'text-gray-800 font-medium' : ''}>
              {seg.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function Shell() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link to="/" className="font-semibold text-gray-900 text-sm tracking-tight">
            Portier Sync
          </Link>
          <span className="text-gray-200">|</span>
          <Breadcrumb />
        </div>
        <nav className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 flex items-center gap-4">
            <Link
              to="/"
              className={`py-3 px-0 text-sm font-medium border-b-2 transition-colors ${
                location.pathname === '/'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Integrations
            </Link>
            <Link
              to="/local-data"
              className={`py-3 px-0 text-sm font-medium border-b-2 transition-colors ${
                location.pathname === '/local-data'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Local Data
            </Link>
          </div>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Toaster />
    </div>
  )
}
