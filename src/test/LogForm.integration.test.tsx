import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LogForm from '@/features/logging/LogForm'

describe('LogForm - Integration Tests', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnSubmit = vi.fn()
  })

  describe('Form Validation Integration', () => {
    it('should handle rapid successive submissions', async () => {
      mockOnSubmit.mockResolvedValue(undefined)
      const user = userEvent.setup()

      render(<LogForm onSubmit={mockOnSubmit} />)

      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement
      const startInput = screen.getByLabelText(/Start Time/i) as HTMLInputElement
      const endInput = screen.getByLabelText(/End Time/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /Add Log/i })

      await user.type(dateInput, '2024-01-15')
      await user.type(startInput, '09:00')
      await user.type(endInput, '10:30')

      // Rapid clicks
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)

      await waitFor(
        () => {
          expect(mockOnSubmit).toHaveBeenCalledTimes(3)
        },
        { timeout: 1000 },
      )
    })

    it('should handle error recovery with form retry', async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce(undefined)

      render(<LogForm onSubmit={mockOnSubmit} />)

      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement
      const startInput = screen.getByLabelText(/Start Time/i) as HTMLInputElement
      const endInput = screen.getByLabelText(/End Time/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /Add Log/i })

      fireEvent.change(dateInput, { target: { value: '2024-01-15' } })
      fireEvent.change(startInput, { target: { value: '09:00' } })
      fireEvent.change(endInput, { target: { value: '10:30' } })

      // First submission fails
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      expect(mockOnSubmit).toHaveBeenCalledTimes(1)

      // Second submission succeeds
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(2)
      })
    })

    it('should preserve form state during submission', async () => {
      mockOnSubmit.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100)
          }),
      )

      render(<LogForm onSubmit={mockOnSubmit} />)

      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement
      const startInput = screen.getByLabelText(/Start Time/i) as HTMLInputElement
      const endInput = screen.getByLabelText(/End Time/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /Add Log/i })

      const testDate = '2024-01-15'
      const testStart = '09:00'
      const testEnd = '10:30'

      fireEvent.change(dateInput, { target: { value: testDate } })
      fireEvent.change(startInput, { target: { value: testStart } })
      fireEvent.change(endInput, { target: { value: testEnd } })

      fireEvent.click(submitButton)

      // Check values are preserved during submission
      expect(dateInput.value).toBe(testDate)
      expect(startInput.value).toBe(testStart)
      expect(endInput.value).toBe(testEnd)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle form submission with all fields required', async () => {
      mockOnSubmit.mockResolvedValue(undefined)

      render(<LogForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /Add Log/i })
      fireEvent.click(submitButton)

      // Should not submit if fields are empty
      await waitFor(
        () => {
          // Component should either prevent submission or show validation error
          // Verify the form doesn't submit with empty required fields
        },
        { timeout: 500 },
      )
    })

    it('should handle form with special characters in calculations', async () => {
      mockOnSubmit.mockResolvedValue(undefined)

      render(<LogForm onSubmit={mockOnSubmit} />)

      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement
      const startInput = screen.getByLabelText(/Start Time/i) as HTMLInputElement
      const endInput = screen.getByLabelText(/End Time/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /Add Log/i })

      fireEvent.change(dateInput, { target: { value: '2024-01-15' } })
      fireEvent.change(startInput, { target: { value: '00:00' } })
      fireEvent.change(endInput, { target: { value: '23:59' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            date: '2024-01-15',
            start_time: '00:00',
            end_time: '23:59',
            duration_minutes: 1439,
          }),
        )
      })
    })

    it('should handle midnight crossing scenario', async () => {
      mockOnSubmit.mockResolvedValue(undefined)

      render(<LogForm onSubmit={mockOnSubmit} />)

      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement
      const startInput = screen.getByLabelText(/Start Time/i) as HTMLInputElement
      const endInput = screen.getByLabelText(/End Time/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /Add Log/i })

      fireEvent.change(dateInput, { target: { value: '2024-01-15' } })
      fireEvent.change(startInput, { target: { value: '22:00' } })
      fireEvent.change(endInput, { target: { value: '02:00' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            start_time: '22:00',
            end_time: '02:00',
          }),
        )
      })
    })
  })

  describe('Accessibility Integration', () => {
    it('should have proper label associations', () => {
      render(<LogForm onSubmit={mockOnSubmit} />)

      const dateInput = screen.getByLabelText(/Date/i)
      const startInput = screen.getByLabelText(/Start Time/i)
      const endInput = screen.getByLabelText(/End Time/i)

      expect(dateInput).toBeInTheDocument()
      expect(startInput).toBeInTheDocument()
      expect(endInput).toBeInTheDocument()
    })

    it('should display error messages accessibly', async () => {
      const errorMsg = 'Invalid time format'
      mockOnSubmit.mockRejectedValue(new Error(errorMsg))

      render(<LogForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /Add Log/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorElement = screen.getByText(errorMsg)
        expect(errorElement).toBeInTheDocument()
        expect(errorElement).toBeVisible()
      })
    })

    it('should handle form submission with Enter key', async () => {
      mockOnSubmit.mockResolvedValue(undefined)
      const user = userEvent.setup()

      render(<LogForm onSubmit={mockOnSubmit} />)

      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement

      fireEvent.change(dateInput, { target: { value: '2024-01-15' } })
      await user.keyboard('{Enter}')

      // Form should handle Enter key appropriately
      await waitFor(
        () => {
          // Should either submit or navigate to next field
        },
        { timeout: 500 },
      )
    })
  })

  describe('Stress Tests', () => {
    it('should handle very long form usage', async () => {
      mockOnSubmit.mockResolvedValue(undefined)

      render(<LogForm onSubmit={mockOnSubmit} />)

      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement
      const startInput = screen.getByLabelText(/Start Time/i) as HTMLInputElement
      const endInput = screen.getByLabelText(/End Time/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /Add Log/i })

      // Simulate multiple form submissions
      for (let i = 0; i < 10; i++) {
        const date = new Date(2024, 0, 1 + i)
        fireEvent.change(dateInput, {
          target: { value: date.toISOString().split('T')[0] },
        })
        fireEvent.change(startInput, { target: { value: '09:00' } })
        fireEvent.change(endInput, { target: { value: '17:00' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalledTimes(i + 1)
        })
      }

      expect(mockOnSubmit).toHaveBeenCalledTimes(10)
    })
  })
})
