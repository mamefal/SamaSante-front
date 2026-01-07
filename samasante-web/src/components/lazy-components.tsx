import dynamic from 'next/dynamic'

// Lazy load Recharts components
export const AppointmentChart = dynamic(
    () => import('@/components/doctor/appointment-chart'),
    {
        loading: () => (
            <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        ),
        ssr: false,
    }
)

// Lazy load PDF generator
import { generatePrescriptionPDF as PDFGenerator } from '@/lib/pdf-generator'
import AppointmentBookingModal from '@/components/appointment-booking-modal'
import MedicalRecordViewer from '@/components/medical-record-viewer'

export { PDFGenerator, AppointmentBookingModal, MedicalRecordViewer }
