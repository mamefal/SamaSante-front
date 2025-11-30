"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, Calendar, Clock, User, MapPin, Loader2, Stethoscope } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Appointment {
  id: number
  start: string
  end: string
  status: string
  motive: string
  doctor: {
    firstName: string
    lastName: string
  }
  patient: {
    firstName: string
    lastName: string
  }
  site?: {
    name: string
  }
}

export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments")
      setAppointments(res.data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast.error("Erreur lors du chargement des rendez-vous")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "booked":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmé</Badge>
      case "done":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terminé</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Annulé</Badge>
      case "no_show":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Absent</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredAppointments = appointments.filter(a =>
    a.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des rendez-vous</h1>
          <p className="text-muted-foreground">Supervision des consultations sur la plateforme</p>
        </div>
        <Button onClick={fetchAppointments}>
          Actualiser
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par patient ou médecin..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des rendez-vous ({filteredAppointments.length})</CardTitle>
          <CardDescription>Toutes les consultations de la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAppointments.map((appt) => (
              <Card key={appt.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary">
                      <span className="text-xs font-bold">{format(new Date(appt.start), 'dd')}</span>
                      <span className="text-xs uppercase">{format(new Date(appt.start), 'MMM', { locale: fr })}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          {format(new Date(appt.start), 'HH:mm')} - {format(new Date(appt.end), 'HH:mm')}
                        </h3>
                        {getStatusBadge(appt.status)}
                      </div>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm flex items-center text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          Patient: <span className="font-medium text-foreground ml-1">{appt.patient.firstName} {appt.patient.lastName}</span>
                        </p>
                        <p className="text-sm flex items-center text-muted-foreground">
                          <Stethoscope className="h-3 w-3 mr-1" />
                          Médecin: <span className="font-medium text-foreground ml-1">Dr. {appt.doctor.firstName} {appt.doctor.lastName}</span>
                        </p>
                        {appt.site && (
                          <p className="text-sm flex items-center text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            Lieu: {appt.site.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{appt.motive}</Badge>
                  </div>
                </div>
              </Card>
            ))}
            {filteredAppointments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun rendez-vous trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
