import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchInput } from '../SearchInput'

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Search integrations" />)
    expect(screen.getByPlaceholderText('Search integrations')).toBeInTheDocument()
  })

  it('shows current value', () => {
    render(<SearchInput value="hub" onChange={() => {}} />)
    expect(screen.getByDisplayValue('hub')).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const onChange = vi.fn()
    render(<SearchInput value="" onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'h')
    expect(onChange).toHaveBeenCalled()
  })
})
