import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SyncHistory } from '../SyncHistory'
import { useHistoryStore } from '@/stores/history_store'
import { mockHistory } from '@/data/history'

function renderPage(id = 'hubspot') {
  return render(
    <MemoryRouter initialEntries={[`/integrations/${id}/history`]}>
      <Routes>
        <Route path="/integrations/:id/history" element={<SyncHistory />} />
        <Route path="/integrations/:id/history/:version" element={<div>History Detail</div>} />
        <Route path="/integrations/:id" element={<div>Detail Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  useHistoryStore.setState({ entries: mockHistory })
})

describe('SyncHistory', () => {
  it('shows page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /sync history/i })).toBeInTheDocument()
  })

  it('shows history entries for integration', () => {
    renderPage()
    expect(screen.getByText('Scheduled sync — 12 contacts updated')).toBeInTheDocument()
    expect(screen.getByText('Manual sync — deal pipeline updated')).toBeInTheDocument()
    expect(screen.getByText('Scheduled sync — contact deleted')).toBeInTheDocument()
  })

  it('does not show entries from other integrations', () => {
    renderPage()
    expect(screen.queryByText('Full sync — 230 records processed')).not.toBeInTheDocument()
  })

  it('shows version for each entry', () => {
    renderPage()
    expect(screen.getByText(/v2\.4\.1/)).toBeInTheDocument()
    expect(screen.getByText(/v2\.4\.0/)).toBeInTheDocument()
    expect(screen.getByText(/v2\.3\.9/)).toBeInTheDocument()
  })

  it('shows System source badge', () => {
    renderPage()
    const badges = screen.getAllByText('System')
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  it('shows User source badge', () => {
    renderPage()
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('shows View Changes links', () => {
    renderPage()
    const links = screen.getAllByRole('link', { name: /view changes/i })
    expect(links.length).toBe(3)
  })

  it('View Changes link for most recent entry points to correct route', () => {
    renderPage()
    const links = screen.getAllByRole('link', { name: /view changes/i })
    expect(links[0]).toHaveAttribute('href', '/integrations/hubspot/history/2.4.1')
  })

  it('shows empty state when no history for integration', () => {
    renderPage('stripe')
    expect(screen.queryAllByRole('link', { name: /view changes/i })).toHaveLength(0)
    expect(screen.getByText(/no sync history/i)).toBeInTheDocument()
  })

  it('shows back link to integration', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument()
  })
})
