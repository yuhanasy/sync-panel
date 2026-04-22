import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { IntegrationsList } from '../IntegrationsList'

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <IntegrationsList />
    </MemoryRouter>
  )
}

describe('IntegrationsList', () => {
  it('renders all 6 integrations by default', () => {
    renderWithRouter()
    expect(screen.getByText('HubSpot')).toBeInTheDocument()
    expect(screen.getByText('Salesforce')).toBeInTheDocument()
    expect(screen.getByText('Zendesk')).toBeInTheDocument()
    expect(screen.getByText('Stripe')).toBeInTheDocument()
    expect(screen.getByText('Intercom')).toBeInTheDocument()
    expect(screen.getByText('Shopify')).toBeInTheDocument()
  })

  it('renders all 4 status badges', () => {
    renderWithRouter()
    expect(screen.getAllByText('Conflict').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Syncing').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Error').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Synced').length).toBeGreaterThanOrEqual(1)
  })

  it('filters by name search', async () => {
    renderWithRouter()
    const searchInput = screen.getByPlaceholderText(/search/i)
    await userEvent.type(searchInput, 'hub')
    expect(screen.getByText('HubSpot')).toBeInTheDocument()
    expect(screen.queryByText('Salesforce')).not.toBeInTheDocument()
  })

  it('shows empty state when search matches nothing', async () => {
    renderWithRouter()
    const searchInput = screen.getByPlaceholderText(/search/i)
    await userEvent.type(searchInput, 'zzznomatch')
    expect(screen.getByText(/no integrations/i)).toBeInTheDocument()
  })

  it('filters by status', async () => {
    renderWithRouter()
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'error')
    expect(screen.getByText('Stripe')).toBeInTheDocument()
    expect(screen.queryByText('HubSpot')).not.toBeInTheDocument()
  })

  it('each row links to integration detail', () => {
    renderWithRouter()
    const hubspotLink = screen.getByRole('link', { name: /HubSpot/i })
    expect(hubspotLink).toHaveAttribute('href', '/integrations/hubspot')
  })
})
