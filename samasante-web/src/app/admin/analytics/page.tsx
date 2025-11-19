import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Activity, MapPin, Clock } from "lucide-react"

export default async function Analytics() {
  const supabase = await createClient()

  // Mock analytics data
  const analytics = {
    overview: {
      totalRevenue: 2450000,
      revenueGrowth: 12.5,
      totalAppointments: 156,
      appointmentsGrowth: 8.3,
      activeUsers: 89,
      usersGrowth: -2.1,
      averageRating: 4.7,
      ratingGrowth: 0.2,
    },
    regions: [
      { name: "Dakar", users: 45, appointments: 89, revenue: 1200000 },
      { name: "Thiès", users: 18, appointments: 34, revenue: 580000 },
      { name: "Saint-Louis", users: 12, appointments: 21, revenue: 420000 },
      { name: "Kaolack", users: 8, appointments: 8, revenue: 150000 },
      { name: "Ziguinchor", users: 6, appointments: 4, revenue: 100000 },
    ],
    specialties: [
      { name: "Médecine Générale", appointments: 45, revenue: 900000 },
      { name: "Pédiatrie", appointments: 38, revenue: 760000 },
      { name: "Gynécologie", appointments: 32, revenue: 640000 },
      { name: "Cardiologie", appointments: 25, revenue: 875000 },
      { name: "Dermatologie", appointments: 16, revenue: 320000 },
    ],
    monthlyStats: [
      { month: "Nov 2024", appointments: 45, revenue: 850000 },
      { month: "Déc 2024", appointments: 67, revenue: 1200000 },
      { month: "Jan 2025", appointments: 44, revenue: 900000 },
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
          <h1 className="text-3xl font-bold text-foreground">Statistiques et analyses</h1>
          <p className="text-muted-foreground">Données de performance de la plateforme SAMASANTE</p>
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
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
            <div className="flex items-center space-x-2 mt-1">
              {getGrowthBadge(analytics.overview.revenueGrowth)}
              <span className="text-xs text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendez-vous</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalAppointments}</div>
            <div className="flex items-center space-x-2 mt-1">
              {getGrowthBadge(analytics.overview.appointmentsGrowth)}
              <span className="text-xs text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.activeUsers}</div>
            <div className="flex items-center space-x-2 mt-1">
              {getGrowthBadge(analytics.overview.usersGrowth)}
              <span className="text-xs text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.averageRating}/5</div>
            <div className="flex items-center space-x-2 mt-1">
              {getGrowthBadge(analytics.overview.ratingGrowth)}
              <span className="text-xs text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Performance par région
            </CardTitle>
            <CardDescription>Répartition géographique de l'activité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.regions.map((region, index) => (
                <div key={region.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{region.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {region.users} utilisateurs • {region.appointments} RDV
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(region.revenue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {((region.revenue / analytics.overview.totalRevenue) * 100).toFixed(1)}%
                    </p>
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
              Spécialités populaires
            </CardTitle>
            <CardDescription>Consultations par spécialité médicale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.specialties.map((specialty, index) => (
                <div key={specialty.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{specialty.name}</p>
                      <p className="text-xs text-muted-foreground">{specialty.appointments} consultations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(specialty.revenue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {((specialty.revenue / analytics.overview.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Évolution mensuelle
          </CardTitle>
          <CardDescription>Tendances des 3 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analytics.monthlyStats.map((month) => (
              <Card key={month.month} className="p-4">
                <div className="text-center">
                  <h3 className="font-medium mb-2">{month.month}</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold text-primary">{month.appointments}</p>
                      <p className="text-xs text-muted-foreground">Rendez-vous</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{formatCurrency(month.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Chiffre d'affaires</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
