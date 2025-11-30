
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Activity, MapPin, Clock, BarChart3, PieChart, LineChart } from "lucide-react"

export default function Analytics() {
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
      <Badge variant="secondary" className={`ml-2 ${isPositive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs(growth)}%
      </Badge>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Statistiques et analyses
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Données de performance de la plateforme SAMASANTE
          </p>
        </div>
        <Select defaultValue="month">
          <SelectTrigger className="w-48 bg-white shadow-sm">
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
        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.totalRevenue)}</div>
            <div className="flex items-center mt-1">
              {getGrowthBadge(analytics.overview.revenueGrowth)}
              <span className="text-xs text-muted-foreground ml-2">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rendez-vous</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{analytics.overview.totalAppointments}</div>
            <div className="flex items-center mt-1">
              {getGrowthBadge(analytics.overview.appointmentsGrowth)}
              <span className="text-xs text-muted-foreground ml-2">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs actifs</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{analytics.overview.activeUsers}</div>
            <div className="flex items-center mt-1">
              {getGrowthBadge(analytics.overview.usersGrowth)}
              <span className="text-xs text-muted-foreground ml-2">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Note moyenne</CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{analytics.overview.averageRating}/5</div>
            <div className="flex items-center mt-1">
              {getGrowthBadge(analytics.overview.ratingGrowth)}
              <span className="text-xs text-muted-foreground ml-2">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-none">
          <CardHeader className="border-b bg-white/50">
            <CardTitle className="flex items-center text-xl">
              <MapPin className="mr-2 h-5 w-5 text-blue-500" />
              Performance par région
            </CardTitle>
            <CardDescription>Répartition géographique de l'activité</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {analytics.regions.map((region, index) => (
                <div key={region.name} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{region.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {region.users} utilisateurs • {region.appointments} RDV
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(region.revenue)}</p>
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(region.revenue / analytics.overview.totalRevenue) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground w-8 text-right">
                        {((region.revenue / analytics.overview.totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none">
          <CardHeader className="border-b bg-white/50">
            <CardTitle className="flex items-center text-xl">
              <PieChart className="mr-2 h-5 w-5 text-purple-500" />
              Spécialités populaires
            </CardTitle>
            <CardDescription>Consultations par spécialité médicale</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {analytics.specialties.map((specialty, index) => (
                <div key={specialty.name} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{specialty.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{specialty.appointments} consultations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(specialty.revenue)}</p>
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${(specialty.revenue / analytics.overview.totalRevenue) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground w-8 text-right">
                        {((specialty.revenue / analytics.overview.totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="shadow-lg border-none">
        <CardHeader className="border-b bg-white/50">
          <CardTitle className="flex items-center text-xl">
            <LineChart className="mr-2 h-5 w-5 text-green-500" />
            Évolution mensuelle
          </CardTitle>
          <CardDescription>Tendances des 3 derniers mois</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analytics.monthlyStats.map((month) => (
              <Card key={month.month} className="bg-gray-50 border-none shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">{month.month}</h3>
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-2xl font-bold text-blue-600">{month.appointments}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Rendez-vous</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-lg font-bold text-green-600">{formatCurrency(month.revenue)}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Chiffre d'affaires</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
