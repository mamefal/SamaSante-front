import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Plus } from "lucide-react"

export default async function DoctorCalendar() {
  const supabase = await createClient()

  // Mock calendar data
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  const appointments = [
    {
      id: "1",
      date: "2025-01-10",
      time: "09:00",
      patient: "Fatou Ndiaye",
      type: "Consultation",
      status: "confirmed",
      duration: 30,
    },
    {
      id: "2",
      date: "2025-01-10",
      time: "10:30",
      patient: "Moussa Ba",
      type: "Suivi",
      status: "pending",
      duration: 45,
    },
    {
      id: "3",
      date: "2025-01-10",
      time: "14:00",
      patient: "Awa Sarr",
      type: "Consultation",
      status: "confirmed",
      duration: 30,
    },
    {
      id: "4",
      date: "2025-01-11",
      time: "09:30",
      patient: "Omar Diop",
      type: "Contrôle",
      status: "confirmed",
      duration: 30,
    },
    {
      id: "5",
      date: "2025-01-11",
      time: "15:00",
      patient: "Aminata Fall",
      type: "Consultation",
      status: "pending",
      duration: 30,
    },
  ]

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayAppointments = appointments.filter((apt) => apt.date === dateStr)
      days.push({
        day,
        date: dateStr,
        appointments: dayAppointments,
        isToday: dateStr === currentDate.toISOString().split("T")[0],
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            Confirmé
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
            En attente
          </Badge>
        )
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mon agenda</h1>
          <p className="text-muted-foreground">Gérez vos rendez-vous et consultations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Jour</SelectItem>
              <SelectItem value="week">Semaine</SelectItem>
              <SelectItem value="month">Mois</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau créneau
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {currentMonth}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="bg-transparent">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                Aujourd'hui
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  day
                    ? day.isToday
                      ? "bg-primary/5 border-primary"
                      : "bg-background hover:bg-muted/50"
                    : "bg-muted/20"
                } transition-colors cursor-pointer`}
              >
                {day && (
                  <>
                    <div className="font-medium text-sm mb-1">{day.day}</div>
                    <div className="space-y-1">
                      {day.appointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className="text-xs p-1 bg-primary/10 text-primary rounded truncate"
                          title={`${apt.time} - ${apt.patient}`}
                        >
                          {apt.time} {apt.patient}
                        </div>
                      ))}
                      {day.appointments.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{day.appointments.length - 2} autres</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Rendez-vous d'aujourd'hui
          </CardTitle>
          <CardDescription>Vos consultations du {new Date().toLocaleDateString("fr-FR")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments
              .filter((apt) => apt.date === "2025-01-10")
              .map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{appointment.patient}</h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.type} • {appointment.duration} minutes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{appointment.time}</p>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Voir patient
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
