import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LogForm from '@/features/logging/LogForm'

interface LogData {
  date: string
  start_time: string
  end_time: string
  notes?: string
  duration_minutes: number
}

describe('LogForm', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn<[LogData], Promise<void>>>

  beforeEach(() => {
    mockOnSubmit = vi.fn<[LogData], Promise<void>>().mockResolvedValue(undefined)
  })

  it('should render form fields', () => {
     mockOnSubmit.mockResolvedValue(undefined)
     render(<LogForm onSubmit={mockOnSubmit} />)

     expect(screen.getByLabelText(/Date/i)).toBeInTheDocument()
     expect(screen.getByLabelText(/Start Time/i)).toBeInTheDocument()
     expect(screen.getByLabelText(/End Time/i)).toBeInTheDocument()
   })

   it('should submit form with valid data', async () => {
     mockOnSubmit.mockResolvedValue(undefined)

    render(<LogForm onSubmit={mockOnSubmit} />)

    const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement
    const startInput = screen.getByLabelText(/Start Time/i) as HTMLInputElement
    const endInput = screen.getByLabelText(/End Time/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /Add Log/i })

    fireEvent.change(dateInput, { target: { value: '2024-01-15' } })
    fireEvent.change(startInput, { target: { value: '09:00' } })
    fireEvent.change(endInput, { target: { value: '10:30' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:30',
          duration_minutes: 90,
        }),
      )
    })
  })

  it('should show error on invalid submission', async () => {
    const errorMsg = 'Failed to add log'
    mockOnSubmit.mockRejectedValue(new Error(errorMsg))

    render(<LogForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /Add Log/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument()
    })
  })
})
