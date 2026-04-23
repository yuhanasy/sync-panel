import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReviewSync } from '../ReviewSync'
import { useIntegrationStore } from '@/stores/integration_store'
import type { SyncChange } from '@/types'

const mockChanges: SyncChange[] = [
  { id: 'sc1', field_name: 'user.email', change_type: 'UPDATE', current_value: 'old@test.com', new_value: 'new@test.com' },
  { id: 'sc2', field_name: 'user.status', change_type: 'ADD', new_value: 'active' },
  { id: 'sc3', field_name: 'key.id', change_type: 'DELETE', current_value: 'key-abc' },
]

function renderReview(id = 'salesforce') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/integrations/${id}/review`]}>
        <Routes>
          <Route path="/integrations/:id/review" element={<ReviewSync />} />
          <Route path="/integrations/:id" element={<div>Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  useIntegrationStore.setState({ pending_changes: mockChanges })
})

afterEach(() => {
  useIntegrationStore.setState({ pending_changes: [] })
})

describe('ReviewSync', () => {
  it('shows Approval Required banner', () => {
    renderReview()
    expect(screen.getByText('Approval Required')).toBeInTheDocument()
  })

  it('shows integration name in heading', () => {
    renderReview()
    expect(screen.getByRole('heading', { name: /salesforce/i })).toBeInTheDocument()
  })

  it('renders all change cards', () => {
    renderReview()
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('status')).toBeInTheDocument()
    expect(screen.getByText('id')).toBeInTheDocument()
  })

  it('starts with all changes selected', () => {
    renderReview()
    expect(screen.getByText('3 of 3 selected')).toBeInTheDocument()
  })

  it('approve button shows selected count', () => {
    renderReview()
    expect(screen.getByRole('button', { name: /approve 3 changes/i })).toBeInTheDocument()
  })

  it('deselect all sets counter to 0', async () => {
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /deselect all/i }))
    expect(screen.getByText('0 of 3 selected')).toBeInTheDocument()
  })

  it('approve button disabled when nothing selected', async () => {
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /deselect all/i }))
    expect(screen.getByRole('button', { name: /approve 0 changes/i })).toBeDisabled()
  })

  it('select all restores full selection after deselect', async () => {
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /deselect all/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Select All' }))
    expect(screen.getByText('3 of 3 selected')).toBeInTheDocument()
  })

  it('toggling individual checkbox decrements counter', async () => {
    renderReview()
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[0])
    expect(screen.getByText('2 of 3 selected')).toBeInTheDocument()
  })

  it('shows correct add/update/delete stat counts', () => {
    renderReview()
    // 1 ADD, 1 UPDATE, 1 DELETE — each stat box shows value
    const headings = screen.getAllByText('1')
    expect(headings.length).toBeGreaterThanOrEqual(3)
  })

  it('cancel navigates back to detail', async () => {
    renderReview()
    await userEvent.click(screen.getByRole('button', { name: /cancel sync/i }))
    expect(screen.getByText('Detail Page')).toBeInTheDocument()
  })
})
