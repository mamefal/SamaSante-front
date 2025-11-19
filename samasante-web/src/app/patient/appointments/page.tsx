"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Appointment {
  id: string
  appointment_date: string
  status: string
  reason: string
  notes: string
  consultation_fee: number
  doctor: {
    speciality: string
    profiles: {
      first_name: string
      last_name: string
      city: string
    }
  }
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchAppointments()
    }
  }, [currentUser])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`/api/appointments?patientId=${currentUser.id}`)
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) return

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (response.ok) {
        fetchAppointments() // Refresh the list
      } else {
        alert("Erreur lors de l'annulation du rendez-vous")
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      alert("Erreur lors de l'annulation du rendez-vous")
    }
  }

  const upcomingAppointments = appointments.filter((apt) => new Date(apt.appointment_date) >= new Date())
  const pastAppointments = appointments.filter((apt) => new Date(apt.appointment_date) < new Date())

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmé"
      case "scheduled":
        return "Programmé"
      case "cancelled":
        return "Annulé"
      case "completed":
        return "Terminé"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="pb-20">
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Mes rendez-vous</h1>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Mes rendez-vous</h1>
          <Button
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700"
            onClick={() => (window.location.href = "/patient/search")}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau RDV
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {upcomingAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-700">Rendez-vous à venir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-cyan-600">
                          {appointment.doctor?.profiles?.first_name?.[0]}
                          {appointment.doctor?.profiles?.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Dr. {appointment.doctor?.profiles?.first_name} {appointment.doctor?.profiles?.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.doctor?.speciality}</p>
                        <p className="text-xs text-gray-500">📍 {appointment.doctor?.profiles?.city}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>{getStatusText(appointment.status)}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">
                        {format(new Date(appointment.appointment_date), "EEEE d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Heure</p>
                      <p className="font-medium">{format(new Date(appointment.appointment_date), "HH:mm")}</p>
                    </div>
                  </div>

                  {appointment.reason && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Motif</p>
                      <p className="text-sm">{appointment.reason}</p>
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm">{appointment.notes}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                      onClick={() => handleCancelAppointment(appointment.id)}
                      disabled={appointment.status === "cancelled"}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {pastAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">Historique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-600">
                          {appointment.doctor?.profiles?.first_name?.[0]}
                          {appointment.doctor?.profiles?.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          Dr. {appointment.doctor?.profiles?.first_name} {appointment.doctor?.profiles?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{appointment.doctor?.speciality}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(appointment.appointment_date), "dd/MM/yyyy à HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(appointment.status)} variant="outline">
                        {getStatusText(appointment.status)}
                      </Badge>
                      <Button size="sm" variant="ghost" className="mt-1 text-xs">
                        Détails
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {pastAppointments.length > 5 && (
                <Button variant="outline" className="w-full bg-transparent">
                  Voir plus d'historique
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {appointments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Aucun rendez-vous</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Vous n'avez pas encore de rendez-vous programmé</p>
            <Button
              className="bg-cyan-600 hover:bg-cyan-700"
              onClick={() => (window.location.href = "/patient/search")}
            >
              Prendre mon premier rendez-vous
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
