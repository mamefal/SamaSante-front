"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Calendar, Clock, User, MapPin, Plus, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface Appointment {
  id: number
  start: string
  end: string
  status: string
  motive: string
  doctor: {
    firstName: string
    lastName: string
    specialty: string
  }
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/my")
      setAppointments(res.data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast.error("Erreur lors du chargement des rendez-vous")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) return

    try {
      await api.patch(`/appointments/${appointmentId}/cancel`)
      toast.success("Rendez-vous annulé")
      fetchAppointments()
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast.error("Erreur lors de l'annulation du rendez-vous")
    }
  }

  const upcomingAppointments = appointments.filter((apt) => new Date(apt.start) >= new Date())
  const pastAppointments = appointments.filter((apt) => new Date(apt.start) < new Date())

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100"
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "no_show":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "booked":
        return "Confirmé"
      case "done":
        return "Terminé"
      case "cancelled":
        return "Annulé"
      case "no_show":
        return "Absent"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Mes Rendez-vous
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gérez vos consultations médicales
          </p>
        </div>
        <Link href="/patient/search">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="mr-2 h-5 w-5" />
            Prendre un rendez-vous
          </Button>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <Card className="shadow-lg border-l-4 border-l-blue-500">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl">Rendez-vous à venir</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div key={apt.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm">
                        <span className="text-xs font-semibold uppercase">
                          {format(new Date(apt.start), "MMM", { locale: fr })}
                        </span>
                        <span className="text-2xl font-bold">
                          {format(new Date(apt.start), "dd")}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          Dr. {apt.doctor.firstName} {apt.doctor.lastName}
                          <Badge className={getStatusColor(apt.status)}>
                            {getStatusText(apt.status)}
                          </Badge>
                        </h3>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {apt.doctor.specialty}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {format(new Date(apt.start), "HH:mm")} - {format(new Date(apt.end), "HH:mm")}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Cabinet médical
                          </div>
                        </div>
                      </div>
                    </div>
                    {apt.status === "booked" && (
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                        onClick={() => handleCancelAppointment(apt.id)}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-semibold mb-2">Aucun rendez-vous à venir</h3>
                <p className="text-muted-foreground mb-6">
                  Vous n&apos;avez pas de rendez-vous programmé.
                </p>
                <Link href="/patient/search">
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    Trouver un médecin
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card className="shadow-md">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-xl text-gray-700">Historique des rendez-vous</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((apt) => (
                <div key={apt.id} className="p-6 hover:bg-gray-50 transition-colors opacity-75 hover:opacity-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Dr. {apt.doctor.firstName} {apt.doctor.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {format(new Date(apt.start), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-gray-50">
                      {getStatusText(apt.status)}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun historique disponible
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
