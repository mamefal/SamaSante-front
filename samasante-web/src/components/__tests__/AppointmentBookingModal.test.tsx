import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import AppointmentBookingModal from '../appointment-booking-modal'

describe('AppointmentBookingModal', () => {
    const mockOnClose = jest.fn()

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        doctorId: '1',
        doctorName: 'Dr. Marie Diop',
        speciality: 'Médecine Générale',
        patientId: '42',
    }

    beforeEach(() => {
        mockOnClose.mockClear()
    })

    it('renders modal with doctor name', () => {
        render(<AppointmentBookingModal {...defaultProps} />)
        expect(screen.getByText(/Prendre rendez‑vous avec Dr. Marie Diop/i)).toBeInTheDocument()
    })

    it('calls onClose when cancel button is clicked', () => {
        render(<AppointmentBookingModal {...defaultProps} />)
        const cancelButton = screen.getByRole('button', { name: /Annuler/i })
        fireEvent.click(cancelButton)
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('submits form and closes modal', () => {
        render(<AppointmentBookingModal {...defaultProps} />)

        const dateInput = screen.getByPlaceholderText('Date')
        const timeInput = screen.getByPlaceholderText('Heure')
        const confirmButton = screen.getByRole('button', { name: /Confirmer/i })

        fireEvent.change(dateInput, { target: { value: '2025-12-20' } })
        fireEvent.change(timeInput, { target: { value: '10:00' } })
        fireEvent.click(confirmButton)

        expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not render when isOpen is false', () => {
        render(<AppointmentBookingModal {...defaultProps} isOpen={false} />)
        expect(screen.queryByText(/Prendre rendez‑vous/i)).not.toBeInTheDocument()
    })
})
