import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HistoryDetail } from '../HistoryDetail'
import { useHistoryStore } from '@/stores/history_store'
import { mockHistory } from '@/data/history'

function renderPage(id = 'hubspot', version = '2.4.1') {
  return render(
    <MemoryRouter initialEntries={[`/integrations/${id}/history/${version}`]}>
      <Routes>
        <Route path="/integrations/:id/history/:version" element={<HistoryDetail />} />
        <Route path="/integrations/:id/history" element={<div>History Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  useHistoryStore.setState({ entries: mockHistory })
})

describe('HistoryDetail', () => {
  // h1 (hubspot v2.4.1): c1 UPDATE, c2 UPDATE, c3 ADD → Added=1, Updated=2, Deleted=0, Total=3
  it('shows integration name in heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /hubspot/i })).toBeInTheDocument()
  })

  it('shows version in heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /2\.4\.1/i })).toBeInTheDocument()
  })

  it('shows stat labels', () => {
    renderPage()
    expect(screen.getByText('Added')).toBeInTheDocument()
    expect(screen.getByText('Updated')).toBeInTheDocument()
    expect(screen.getByText('Deleted')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('shows Added count', () => {
    renderPage()
    // h1 has 1 ADD change — StatCard div contains label + value
    const addedLabel = screen.getByText('Added')
    expect(addedLabel.closest('div')).toHaveTextContent('1')
  })

  it('shows Updated count', () => {
    renderPage()
    // h1 has 2 UPDATE changes
    const updatedLabel = screen.getByText('Updated')
    expect(updatedLabel.closest('div')).toHaveTextContent('2')
  })

  it('shows Deleted count', () => {
    renderPage()
    // h1 has 0 DELETE changes
    const deletedLabel = screen.getByText('Deleted')
    expect(deletedLabel.closest('div')).toHaveTextContent('0')
  })

  it('shows Total count', () => {
    renderPage()
    // h1 has 3 total changes
    const totalLabel = screen.getByText('Total')
    expect(totalLabel.closest('div')).toHaveTextContent('3')
  })

  it('shows correct Deleted count for entry with DELETE change', () => {
    // h3 (hubspot v2.3.9): c6 DELETE → Added=0, Updated=0, Deleted=1, Total=1
    renderPage('hubspot', '2.3.9')
    const deletedLabel = screen.getByText('Deleted')
    expect(deletedLabel.closest('div')).toHaveTextContent('1')
  })

  it('ADD change shows new_value only', () => {
    renderPage()
    // c3: entity_type=Company, entity_id=co-001, field=name, ADD, new_value='Acme Corp'
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('UPDATE change shows previous_value', () => {
    renderPage()
    // c1: UPDATE, previous='old@example.com', new='new@example.com'
    expect(screen.getByText('old@example.com')).toBeInTheDocument()
  })

  it('UPDATE change shows new_value', () => {
    renderPage()
    expect(screen.getByText('new@example.com')).toBeInTheDocument()
  })

  it('DELETE change shows previous_value only', () => {
    renderPage('hubspot', '2.3.9')
    // c6: DELETE, previous_value='John Doe'
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows field name on change card', () => {
    renderPage()
    expect(screen.getByText('email')).toBeInTheDocument()
  })

  it('shows change_type badge', () => {
    renderPage()
    expect(screen.getByText('ADD')).toBeInTheDocument()
    expect(screen.getAllByText('UPDATE').length).toBeGreaterThanOrEqual(1)
  })

  it('shows back link to history page', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute(
      'href',
      '/integrations/hubspot/history'
    )
  })

  it('shows not found for unknown version', () => {
    renderPage('hubspot', '0.0.0')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })
})
