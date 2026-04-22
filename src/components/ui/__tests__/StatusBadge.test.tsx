import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('renders "Synced" for synced status', () => {
    render(<StatusBadge status="synced" />)
    expect(screen.getByText('Synced')).toBeInTheDocument()
  })

  it('renders "Syncing" for syncing status', () => {
    render(<StatusBadge status="syncing" />)
    expect(screen.getByText('Syncing')).toBeInTheDocument()
  })

  it('renders "Conflict" for conflict status', () => {
    render(<StatusBadge status="conflict" />)
    expect(screen.getByText('Conflict')).toBeInTheDocument()
  })

  it('renders "Error" for error status', () => {
    render(<StatusBadge status="error" />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('applies green class for synced', () => {
    const { container } = render(<StatusBadge status="synced" />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('applies blue class for syncing', () => {
    const { container } = render(<StatusBadge status="syncing" />)
    expect(container.firstChild).toHaveClass('bg-blue-100')
  })

  it('applies amber class for conflict', () => {
    const { container } = render(<StatusBadge status="conflict" />)
    expect(container.firstChild).toHaveClass('bg-amber-100')
  })

  it('applies red class for error', () => {
    const { container } = render(<StatusBadge status="error" />)
    expect(container.firstChild).toHaveClass('bg-red-100')
  })
})
