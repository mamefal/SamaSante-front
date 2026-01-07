import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

interface AppointmentBookingModalProps {
  isOpen: boolean
  onClose: () => void
  doctorId: string
  doctorName: string
  speciality: string
  patientId: string
}

export default function AppointmentBookingModal({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  speciality,
  patientId,
}: AppointmentBookingModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const date = formData.get('date') as string
    const time = formData.get('time') as string

    if (!date || !time) return

    try {
      // Calculer l'heure de début et de fin (+30 min par défaut)
      const startDate = new Date(`${date}T${time}`)
      const endDate = new Date(startDate.getTime() + 30 * 60000)

      await api.post('/appointments', {
        doctorId: parseInt(doctorId),
        patientId: parseInt(patientId),
        motive: 'Consultation',
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      })

      import('sonner').then(({ toast }) => {
        toast.success('Rendez-vous confirmé !')
      })
      onClose()
    } catch (error) {
      console.error('Erreur lors de la prise de RDV:', error)
      import('sonner').then(({ toast }) => {
        toast.error('Erreur lors de la prise de rendez-vous.')
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Prendre rendez‑vous avec {doctorName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="hidden" name="doctorId" value={doctorId} />
          <Input type="hidden" name="patientId" value={patientId} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" name="date" required placeholder="Date" />
            <Input type="time" name="time" required placeholder="Heure" />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Confirmer
            </Button>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
