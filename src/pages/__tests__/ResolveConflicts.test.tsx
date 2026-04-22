import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ResolveConflicts } from '../ResolveConflicts'
import { useConflictStore } from '@/stores/conflict_store'
import { useIntegrationStore } from '@/stores/integration_store'
import { mockConflicts } from '@/data/conflicts'

function renderPage(id = 'hubspot') {
  return render(
    <MemoryRouter initialEntries={[`/integrations/${id}/conflicts`]}>
      <Routes>
        <Route path="/integrations/:id/conflicts" element={<ResolveConflicts />} />
        <Route path="/integrations/:id" element={<div>Detail Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  useConflictStore.setState({ items: mockConflicts })
  useIntegrationStore.setState({
    integrations: useIntegrationStore.getState().integrations.map((i) =>
      i.id === 'hubspot' ? { ...i, status: 'conflict' } : i
    ),
  })
})

afterEach(() => {
  useConflictStore.setState({ items: mockConflicts })
})

describe('ResolveConflicts', () => {
  it('shows page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /resolve conflicts/i })).toBeInTheDocument()
  })

  it('groups conflicts by entity — shows 3 entity groups', () => {
    renderPage()
    expect(screen.getByText(/ct-101/)).toBeInTheDocument()
    expect(screen.getByText(/ct-102/)).toBeInTheDocument()
    expect(screen.getByText(/d-201/)).toBeInTheDocument()
  })

  it('shows all field names', () => {
    renderPage()
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('phone')).toBeInTheDocument()
    expect(screen.getByText('company')).toBeInTheDocument()
    expect(screen.getByText('job_title')).toBeInTheDocument()
    expect(screen.getByText('amount')).toBeInTheDocument()
    expect(screen.getByText('close_date')).toBeInTheDocument()
  })

  it('shows local and external values for a field', () => {
    renderPage()
    expect(screen.getByText('alice@acme.com')).toBeInTheDocument()
    expect(screen.getByText('alice.jones@acme.com')).toBeInTheDocument()
  })

  it('merge button is disabled when no conflicts are resolved', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /merge changes/i })).toBeDisabled()
  })

  it('merge button shows 0/6 resolved initially', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /0.*6/i })).toBeInTheDocument()
  })

  it('"Use This" on local side resolves that conflict', async () => {
    renderPage()
    const useThisButtons = screen.getAllByRole('button', { name: /use this/i })
    await userEvent.click(useThisButtons[0])
    expect(screen.getByRole('button', { name: /1.*6/i })).toBeInTheDocument()
  })

  it('Accept All Local resolves all 6 conflicts', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /accept all local/i }))
    expect(screen.getByRole('button', { name: /6.*6/i })).toBeInTheDocument()
  })

  it('Accept All External resolves all conflicts', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /accept all external/i }))
    expect(screen.getByRole('button', { name: /6.*6/i })).toBeInTheDocument()
  })

  it('merge button enabled after all conflicts resolved', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /accept all local/i }))
    expect(screen.getByRole('button', { name: /merge changes/i })).not.toBeDisabled()
  })

  it('merge navigates to detail page', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /accept all local/i }))
    await userEvent.click(screen.getByRole('button', { name: /merge changes/i }))
    expect(screen.getByText('Detail Page')).toBeInTheDocument()
  })

  it('merge updates integration status to synced', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /accept all local/i }))
    await userEvent.click(screen.getByRole('button', { name: /merge changes/i }))
    const status = useIntegrationStore.getState().integrations.find((i) => i.id === 'hubspot')?.status
    expect(status).toBe('synced')
  })

  it('merge clears conflict items for this integration', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /accept all local/i }))
    await userEvent.click(screen.getByRole('button', { name: /merge changes/i }))
    const remaining = useConflictStore.getState().items.filter((i) => i.integration_id === 'hubspot')
    expect(remaining).toHaveLength(0)
  })

  it('shows back link to integration', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument()
  })
})
