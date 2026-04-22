import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangeCard } from '../ChangeCard'

describe('ChangeCard', () => {
  it('shows field name', () => {
    render(<ChangeCard change={{ id: 'c1', field_name: 'user.email', change_type: 'UPDATE', current_value: 'a', new_value: 'b' }} selected={false} onToggle={() => {}} />)
    expect(screen.getByText('user.email')).toBeInTheDocument()
  })

  it('shows UPDATE badge', () => {
    render(<ChangeCard change={{ id: 'c1', field_name: 'user.email', change_type: 'UPDATE', current_value: 'a', new_value: 'b' }} selected={false} onToggle={() => {}} />)
    expect(screen.getByText('UPDATE')).toBeInTheDocument()
  })

  it('shows ADD badge', () => {
    render(<ChangeCard change={{ id: 'c2', field_name: 'key.id', change_type: 'ADD', new_value: 'key-123' }} selected={false} onToggle={() => {}} />)
    expect(screen.getByText('ADD')).toBeInTheDocument()
  })

  it('shows DELETE badge', () => {
    render(<ChangeCard change={{ id: 'c3', field_name: 'key.id', change_type: 'DELETE', current_value: 'key-old' }} selected={false} onToggle={() => {}} />)
    expect(screen.getByText('DELETE')).toBeInTheDocument()
  })

  it('shows current and new value for UPDATE', () => {
    render(<ChangeCard change={{ id: 'c1', field_name: 'user.email', change_type: 'UPDATE', current_value: 'old@test.com', new_value: 'new@test.com' }} selected={false} onToggle={() => {}} />)
    expect(screen.getByText('old@test.com')).toBeInTheDocument()
    expect(screen.getByText('new@test.com')).toBeInTheDocument()
  })

  it('shows only new value for ADD — no Current Value label', () => {
    render(<ChangeCard change={{ id: 'c2', field_name: 'key.id', change_type: 'ADD', new_value: 'key-123' }} selected={false} onToggle={() => {}} />)
    expect(screen.getByText('key-123')).toBeInTheDocument()
    expect(screen.queryByText('Current Value')).not.toBeInTheDocument()
  })

  it('shows only current value for DELETE — no New Value label', () => {
    render(<ChangeCard change={{ id: 'c3', field_name: 'key.id', change_type: 'DELETE', current_value: 'key-old' }} selected={false} onToggle={() => {}} />)
    expect(screen.getByText('key-old')).toBeInTheDocument()
    expect(screen.queryByText('New Value')).not.toBeInTheDocument()
  })

  it('calls onToggle when checkbox clicked', async () => {
    const onToggle = vi.fn()
    render(<ChangeCard change={{ id: 'c1', field_name: 'x', change_type: 'UPDATE', current_value: 'a', new_value: 'b' }} selected={false} onToggle={onToggle} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('checkbox is checked when selected=true', () => {
    render(<ChangeCard change={{ id: 'c1', field_name: 'x', change_type: 'UPDATE', current_value: 'a', new_value: 'b' }} selected={true} onToggle={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
