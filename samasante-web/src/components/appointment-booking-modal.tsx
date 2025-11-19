"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface AppointmentBookingModalProps {
  isOpen: boolean
  onClose: () => void
  doctorId: string
  doctorName: string
  speciality: string
  patientId: string
}

export function AppointmentBookingModal({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  speciality,
  patientId,
}: AppointmentBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [reason, setReason] = useState("")
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string; display: string }>>([])
  const [loading, setLoading] = useState(false)

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    setSelectedTime("")

    // Fetch available time slots for the selected date
    try {
      const response = await fetch(`/api/doctors/${doctorId}/availability?date=${format(date, "yyyy-MM-dd")}`)
      const slots = await response.json()
      setAvailableSlots(slots)
    } catch (error) {
      console.error("Error fetching availability:", error)
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !reason.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: patientId,
          doctor_id: doctorId,
          appointment_date: selectedTime,
          reason: reason.trim(),
        }),
      })

      if (response.ok) {
        onClose()
        // Reset form
        setSelectedDate(undefined)
        setSelectedTime("")
        setReason("")
        // Show success message or refresh appointments
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || "Erreur lors de la prise de rendez-vous")
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
      alert("Erreur lors de la prise de rendez-vous")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Prendre rendez-vous</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Dr. {doctorName} - {speciality}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Sélectionner une date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              locale={fr}
              className="rounded-md border"
            />
          </div>

          {selectedDate && availableSlots.length > 0 && (
            <div>
              <Label>Créneaux disponibles</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un créneau" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot.time} value={slot.time}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {slot.display}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="reason">Motif de consultation</Label>
            <Textarea
              id="reason"
              placeholder="Décrivez brièvement le motif de votre consultation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Annuler
            </Button>
            <Button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime || !reason.trim() || loading}
              className="flex-1"
            >
              {loading ? "Réservation..." : "Confirmer le rendez-vous"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
