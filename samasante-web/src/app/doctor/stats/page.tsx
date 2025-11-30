
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Star, Clock, Activity } from "lucide-react"

export default async function DoctorStats() {


  // Mock statistics data
  const stats = {
    overview: {
      totalRevenue: 0,
      revenueGrowth: 0,
      totalAppointments: 0,
      appointmentsGrowth: 0,
      totalPatients: 0,
      patientsGrowth: 0,
      averageRating: 0,
      ratingGrowth: 0,
    },
    monthlyData: [
      { month: "Nov 2024", appointments: 0, revenue: 0, newPatients: 0 },
      { month: "Déc 2024", appointments: 0, revenue: 0, newPatients: 0 },
      { month: "Jan 2025", appointments: 0, revenue: 0, newPatients: 0 },
    ],
    appointmentTypes: [
      { type: "Consultation", count: 0, percentage: 0, revenue: 0 },
      { type: "Suivi", count: 0, percentage: 0, revenue: 0 },
      { type: "Contrôle", count: 0, percentage: 0, revenue: 0 },
    ],
    patientAgeGroups: [
      { group: "0-2 ans", count: 0, percentage: 0 },
      { group: "3-6 ans", count: 0, percentage: 0 },
      { group: "7-12 ans", count: 0, percentage: 0 },
      { group: "13-18 ans", count: 0, percentage: 0 },
    ],
    weeklySchedule: [
      { day: "Lundi", appointments: 0, hours: 0 },
      { day: "Mardi", appointments: 0, hours: 0 },
      { day: "Mercredi", appointments: 0, hours: 0 },
      { day: "Jeudi", appointments: 0, hours: 0 },
      { day: "Vendredi", appointments: 0, hours: 0 },
      { day: "Samedi", appointments: 0, hours: 0 },
      { day: "Dimanche", appointments: 0, hours: 0 },
    ],
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getGrowthBadge = (growth: number) => {
    const isPositive = growth > 0
    return (
      <Badge variant="secondary" className={isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs(growth)}%
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes statistiques</h1>
          <p className="text-muted-foreground">Analyse de votre activité médicale</p>
        </div>
        <Select defaultValue="month">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="quarter">Ce trimestre</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.overview.totalRevenue)}</div>
            <div className="flex items-center space-x-2 mt-1">
              {getGrowthBadge(stats.overview.revenueGrowth)}
              <span className="text-xs text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalAppointments}</div>
            <div className="flex items-center space-x-2 mt-1">
              {getGrowthBadge(stats.overview.appointmentsGrowth)}
              <span className="text-xs text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalPatients}</div>
            <div className="flex items-center space-x-2 mt-1">
              {getGrowthBadge(stats.overview.patientsGrowth)}
              <span className="text-xs text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Évaluation</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.averageRating}/5</div>
            <div className="flex items-center space-x-2 mt-1">
              {getGrowthBadge(stats.overview.ratingGrowth)}
              <span className="text-xs text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends & Appointment Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Évolution mensuelle
            </CardTitle>
            <CardDescription>Tendances des 3 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyData.map((month) => (
                <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{month.month}</h3>
                    <p className="text-sm text-muted-foreground">{month.newPatients} nouveaux patients</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{month.appointments} consultations</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(month.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Types de consultation
            </CardTitle>
            <CardDescription>Répartition par type de rendez-vous</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.appointmentTypes.map((type) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{type.percentage}%</span>
                    </div>
                    <div>
                      <p className="font-medium">{type.type}</p>
                      <p className="text-xs text-muted-foreground">{type.count} consultations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(type.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Demographics & Weekly Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Répartition par âge
            </CardTitle>
            <CardDescription>Groupes d'âge de vos patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.patientAgeGroups.map((group) => (
                <div key={group.group} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{group.percentage}%</span>
                    </div>
                    <div>
                      <p className="font-medium">{group.group}</p>
                      <p className="text-xs text-muted-foreground">{group.count} patients</p>
                    </div>
                  </div>
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${group.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Planning hebdomadaire
            </CardTitle>
            <CardDescription>Votre charge de travail par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.weeklySchedule.map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 text-sm font-medium">{day.day}</div>
                    <div>
                      <p className="text-sm">{day.appointments} consultations</p>
                      <p className="text-xs text-muted-foreground">{day.hours}h de travail</p>
                    </div>
                  </div>
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(day.appointments / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
