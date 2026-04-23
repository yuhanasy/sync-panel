import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, beforeEach } from 'vitest'
import { IntegrationDetail } from '../IntegrationDetail'
import { useIntegrationStore } from '@/stores/integration_store'

function renderDetail(id: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/integrations/${id}`]}>
        <Routes>
          <Route path="/integrations/:id" element={<IntegrationDetail />} />
          <Route path="/integrations/:id/review" element={<div>Review</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('IntegrationDetail', () => {
  beforeEach(() => {
    useIntegrationStore.setState((state) => ({
      integrations: state.integrations.map((i) =>
        i.id === 'hubspot' ? { ...i, status: 'conflict' as const } : i
      ),
    }))
  })

  describe('header', () => {
    it('shows integration name', () => {
      renderDetail('hubspot')
      expect(screen.getByRole('heading', { name: /HubSpot/i })).toBeInTheDocument()
    })

    it('shows version', () => {
      renderDetail('hubspot')
      expect(screen.getAllByText(/v2\.4\.1/i).length).toBeGreaterThanOrEqual(1)
    })

    it('shows status badge', () => {
      renderDetail('hubspot')
      expect(screen.getByText('Conflict')).toBeInTheDocument()
    })

    it('shows Sync Now button', () => {
      renderDetail('salesforce')
      expect(screen.getByRole('button', { name: /sync now/i })).toBeInTheDocument()
    })
  })

  describe('conflict banner', () => {
    it('shows conflict alert for conflict status', () => {
      renderDetail('hubspot')
      expect(screen.getAllByRole('link', { name: /resolve conflicts/i }).length).toBeGreaterThanOrEqual(1)
    })

    it('does not show conflict alert for synced status', () => {
      renderDetail('salesforce')
      expect(screen.queryByRole('link', { name: /resolve conflicts/i })).not.toBeInTheDocument()
    })
  })

  describe('stats cards', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('shows total records', () => {
      renderDetail('hubspot')
      act(() => vi.runAllTimers())
      expect(screen.getByText('4,821')).toBeInTheDocument()
    })

    it('shows last sync duration', () => {
      renderDetail('hubspot')
      act(() => vi.runAllTimers())
      expect(screen.getByText(/47/)).toBeInTheDocument()
    })
  })

  describe('quick actions', () => {
    it('always shows View History link', () => {
      renderDetail('salesforce')
      expect(screen.getByRole('link', { name: /view history/i })).toHaveAttribute(
        'href',
        '/integrations/salesforce/history'
      )
    })

    it('shows Resolve Conflicts action for conflict status', () => {
      renderDetail('hubspot')
      const links = screen.getAllByRole('link', { name: /resolve conflicts/i })
      expect(links.length).toBeGreaterThanOrEqual(1)
    })

    it('does not show Resolve Conflicts action for synced status', () => {
      renderDetail('salesforce')
      expect(screen.queryByRole('link', { name: /resolve conflicts/i })).not.toBeInTheDocument()
    })
  })

  describe('unknown integration', () => {
    it('shows not found message for unknown id', () => {
      renderDetail('nonexistent')
      expect(screen.getByText(/not found/i)).toBeInTheDocument()
    })
  })
})
