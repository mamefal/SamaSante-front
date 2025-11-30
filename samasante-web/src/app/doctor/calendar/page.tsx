"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Loader2, Activity, Save, Plus, Trash2, Check, Settings } from "lucide-react"
import { api } from "@/lib/api"
import { getDoctorId } from "@/lib/auth"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Appointment {
  id: number
  start: string
  end: string
  status: string
  motive: string
  patient: {
    firstName: string
    lastName: string
  }
}

type TimeSlot = {
  start: string
  end: string
  type: "morning" | "afternoon"
}

type DaySchedule = {
  day: string
  dayCode: string
  isActive: boolean
  slots: TimeSlot[]
}

type ConsultationSettings = {
  defaultDuration: number
  bufferTime: number
  maxAdvanceBooking: number
  allowSameDayBooking: boolean
  consultationFee: number
}

export default function DoctorCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const doctorId = getDoctorId()

  // Availability State
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([
    {
      day: "Lundi",
      dayCode: "monday",
      isActive: true,
      slots: [
        { start: "09:00", end: "12:00", type: "morning" },
        { start: "14:00", end: "17:00", type: "afternoon" },
      ],
    },
    {
      day: "Mardi",
      dayCode: "tuesday",
      isActive: true,
      slots: [
        { start: "09:00", end: "12:00", type: "morning" },
        { start: "14:00", end: "17:00", type: "afternoon" },
      ],
    },
    {
      day: "Mercredi",
      dayCode: "wednesday",
      isActive: true,
      slots: [{ start: "09:00", end: "12:00", type: "morning" }],
    },
    {
      day: "Jeudi",
      dayCode: "thursday",
      isActive: true,
      slots: [
        { start: "09:00", end: "12:00", type: "morning" },
        { start: "14:00", end: "17:00", type: "afternoon" },
      ],
    },
    {
      day: "Vendredi",
      dayCode: "friday",
      isActive: true,
      slots: [{ start: "09:00", end: "12:00", type: "morning" }],
    },
    {
      day: "Samedi",
      dayCode: "saturday",
      isActive: false,
      slots: [],
    },
    {
      day: "Dimanche",
      dayCode: "sunday",
      isActive: false,
      slots: [],
    },
  ])

  const [settings, setSettings] = useState<ConsultationSettings>({
    defaultDuration: 30,
    bufferTime: 15,
    maxAdvanceBooking: 30,
    allowSameDayBooking: true,
    consultationFee: 25000,
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    if (!doctorId) {
      toast.error("Profil médecin non trouvé")
      setLoading(false)
      return
    }

    try {
      const res = await api.get(`/appointments/doctor/${doctorId}`)
      setAppointments(res.data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast.error("Erreur lors du chargement des rendez-vous")
    } finally {
      setLoading(false)
    }
  }

  // Availability Handlers
  const toggleDay = (dayCode: string) => {
    setWeeklySchedule((prev) =>
      prev.map((day) =>
        day.dayCode === dayCode ? { ...day, isActive: !day.isActive } : day
      )
    )
  }

  const addTimeSlot = (dayCode: string) => {
    setWeeklySchedule((prev) =>
      prev.map((day) => {
        if (day.dayCode === dayCode) {
          const newSlot: TimeSlot = {
            start: "09:00",
            end: "10:00",
            type: day.slots.length === 0 || day.slots[day.slots.length - 1].type === "afternoon" ? "morning" : "afternoon",
          }
          return { ...day, slots: [...day.slots, newSlot] }
        }
        return day
      })
    )
  }

  const updateTimeSlot = (dayCode: string, slotIndex: number, field: "start" | "end", value: string) => {
    setWeeklySchedule((prev) =>
      prev.map((day) => {
        if (day.dayCode === dayCode) {
          const updatedSlots = day.slots.map((slot, index) =>
            index === slotIndex ? { ...slot, [field]: value } : slot
          )
          return { ...day, slots: updatedSlots }
        }
        return day
      })
    )
  }

  const deleteTimeSlot = (dayCode: string, slotIndex: number) => {
    setWeeklySchedule((prev) =>
      prev.map((day) => {
        if (day.dayCode === dayCode) {
          const updatedSlots = day.slots.filter((_, index) => index !== slotIndex)
          return { ...day, slots: updatedSlots }
        }
        return day
      })
    )
  }

  const applyTemplate = (template: "fulltime" | "mornings") => {
    const templates = {
      fulltime: [
        { start: "09:00", end: "12:00", type: "morning" as const },
        { start: "14:00", end: "17:00", type: "afternoon" as const },
      ],
      mornings: [{ start: "09:00", end: "12:00", type: "morning" as const }],
    }

    setWeeklySchedule((prev) =>
      prev.map((day) => {
        if (["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day.dayCode)) {
          return { ...day, isActive: true, slots: templates[template] }
        } else {
          return { ...day, isActive: false, slots: [] }
        }
      })
    )

    toast.success(`Modèle "${template === "fulltime" ? "Temps plein" : "Matinées"}" appliqué`)
  }

  const handleSaveSettings = () => {
    toast.success("Paramètres sauvegardés", {
      description: "Vos disponibilités ont été mises à jour",
      icon: <Check className="h-4 w-4" />,
    })
  }

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.start)
    const today = new Date()
    return aptDate.toDateString() === today.toDateString()
  })

  const upcomingAppointments = appointments.filter(apt => new Date(apt.start) > new Date())

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "booked":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Confirmé</Badge>
      case "done":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Terminé</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Annulé</Badge>
      case "no_show":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">Absent</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/30 dark:to-blue-950/10">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mon Agenda</h1>
              <p className="text-blue-50">Gérez vos rendez-vous et vos disponibilités</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-none"
                onClick={fetchAppointments}
              >
                <Activity className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto bg-blue-100/50 dark:bg-blue-900/20 p-1">
            <TabsTrigger value="calendar" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="availability" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Settings className="h-4 w-4 mr-2" />
              Disponibilités
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                    <p className="text-2xl font-bold text-blue-600">{todayAppointments.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-200" />
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">À venir</p>
                    <p className="text-2xl font-bold text-indigo-600">{upcomingAppointments.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-indigo-200" />
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-purple-600">{appointments.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-200" />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Today's Appointments */}
              <Card className="border-2 border-blue-100 shadow-md h-fit">
                <CardHeader className="bg-blue-50/50 pb-4">
                  <CardTitle className="flex items-center text-blue-700 text-lg">
                    <Clock className="mr-2 h-5 w-5" />
                    Aujourd'hui
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-blue-50">
                    {todayAppointments.length > 0 ? (
                      todayAppointments.map((appointment) => (
                        <div key={appointment.id} className="p-4 hover:bg-blue-50/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm">{appointment.patient.firstName} {appointment.patient.lastName}</h3>
                                <p className="text-xs text-muted-foreground">{appointment.motive}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600">{format(new Date(appointment.start), "HH:mm")}</p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>Aucun rendez-vous aujourd'hui</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* All Appointments */}
              <Card className="h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Prochains rendez-vous</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {upcomingAppointments.length > 0 ? (
                      upcomingAppointments.slice(0, 5).map((appointment) => (
                        <div key={appointment.id} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{appointment.patient.firstName} {appointment.patient.lastName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(appointment.start), "dd/MM/yyyy à HH:mm")}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Aucun rendez-vous à venir</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Configuration des disponibilités</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => applyTemplate("fulltime")}>
                  Modèle Temps plein
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyTemplate("mornings")}>
                  Modèle Matinées
                </Button>
                <Button size="sm" onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Settings Column */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Paramètres généraux</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Durée (min)</Label>
                      <Select
                        value={settings.defaultDuration.toString()}
                        onValueChange={(value) => setSettings({ ...settings, defaultDuration: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="45">45 min</SelectItem>
                          <SelectItem value="60">1 h</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fee">Tarif (FCFA)</Label>
                      <Input
                        id="fee"
                        type="number"
                        value={settings.consultationFee}
                        onChange={(e) => setSettings({ ...settings, consultationFee: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Label htmlFor="same-day" className="text-sm cursor-pointer">RDV jour même</Label>
                      <Switch
                        id="same-day"
                        checked={settings.allowSameDayBooking}
                        onCheckedChange={(checked) => setSettings({ ...settings, allowSameDayBooking: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Schedule Column */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Planning hebdomadaire</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {weeklySchedule.map((daySchedule) => (
                      <div key={daySchedule.dayCode} className="border rounded-lg p-3 hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={daySchedule.isActive}
                              onCheckedChange={() => toggleDay(daySchedule.dayCode)}
                            />
                            <span className="font-medium min-w-[80px]">{daySchedule.day}</span>
                            {!daySchedule.isActive && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Fermé</span>
                            )}
                          </div>
                          {daySchedule.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => addTimeSlot(daySchedule.dayCode)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Ajouter
                            </Button>
                          )}
                        </div>

                        {daySchedule.isActive && (
                          <div className="space-y-2 pl-12">
                            {daySchedule.slots.map((slot, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) => updateTimeSlot(daySchedule.dayCode, index, "start", e.target.value)}
                                  className="w-24 h-8"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => updateTimeSlot(daySchedule.dayCode, index, "end", e.target.value)}
                                  className="w-24 h-8"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => deleteTimeSlot(daySchedule.dayCode, index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {daySchedule.slots.length === 0 && (
                              <p className="text-xs text-muted-foreground italic">Aucun créneau</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
