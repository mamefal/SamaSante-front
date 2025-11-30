"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    TrendingUp,
    TrendingDown,
    Users,
    Calendar,
    DollarSign,
    BarChart3,
    Download,
    Activity,
    PieChart
} from "lucide-react"

export default function HospitalStats() {
    // Mock data
    const stats = {
        overview: {
            totalRevenue: 1250000,
            revenueGrowth: 18.5,
            totalAppointments: 77,
            appointmentsGrowth: 12.3,
            totalDoctors: 2,
            totalPatients: 42,
            patientsGrowth: 15.2
        },
        monthlyData: [
            { month: "Nov 2024", appointments: 22, revenue: 350000, patients: 12, percentage: 65 },
            { month: "Déc 2024", appointments: 28, revenue: 420000, patients: 15, percentage: 78 },
            { month: "Jan 2025", appointments: 27, revenue: 480000, patients: 15, percentage: 85 }
        ],
        doctorStats: [
            { name: "Dr. Awa Diop", specialty: "Pédiatrie", appointments: 45, patients: 28, revenue: 750000, performance: 92 },
            { name: "Dr. Ibrahima Seck", specialty: "Cardiologie", appointments: 32, patients: 14, revenue: 500000, performance: 78 }
        ]
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
            <Badge variant="secondary" className={isPositive ? "bg-green-100 text-green-700 hover:bg-green-200 border-none" : "bg-red-100 text-red-700 hover:bg-red-200 border-none"}>
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(growth)}%
            </Badge>
        )
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
                    <p className="text-muted-foreground mt-1">
                        Tableau de bord analytique et performance
                    </p>
                </div>
                <div className="flex gap-2">
                    <Select defaultValue="month">
                        <SelectTrigger className="w-40 bg-white border-gray-200">
                            <SelectValue placeholder="Période" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Cette semaine</SelectItem>
                            <SelectItem value="month">Ce mois</SelectItem>
                            <SelectItem value="quarter">Ce trimestre</SelectItem>
                            <SelectItem value="year">Cette année</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Revenus</p>
                                <h3 className="text-3xl font-bold mt-2 text-gray-900">{formatCurrency(stats.overview.totalRevenue)}</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            {getGrowthBadge(stats.overview.revenueGrowth)}
                            <span className="text-xs text-muted-foreground">vs mois dernier</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Consultations</p>
                                <h3 className="text-3xl font-bold mt-2 text-gray-900">{stats.overview.totalAppointments}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            {getGrowthBadge(stats.overview.appointmentsGrowth)}
                            <span className="text-xs text-muted-foreground">vs mois dernier</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Patients</p>
                                <h3 className="text-3xl font-bold mt-2 text-gray-900">{stats.overview.totalPatients}</h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            {getGrowthBadge(stats.overview.patientsGrowth)}
                            <span className="text-xs text-muted-foreground">vs mois dernier</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Médecins Actifs</p>
                                <h3 className="text-3xl font-bold mt-2 text-gray-900">{stats.overview.totalDoctors}</h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Activity className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            Taux d'occupation: 85%
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trends */}
                <Card className="bg-white shadow-sm border-none">
                    <CardHeader className="border-b bg-white px-6 py-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Évolution mensuelle
                        </CardTitle>
                        <CardDescription>Analyse comparative des revenus et activités</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-8">
                            {stats.monthlyData.map((month) => (
                                <div key={month.month} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{month.month}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">{month.appointments} consultations • {month.patients} patients</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-600">{formatCurrency(month.revenue)}</p>
                                            <p className="text-xs text-green-600 font-medium">Objectif atteint</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Progression</span>
                                            <span className="font-medium text-blue-600">{month.percentage}%</span>
                                        </div>
                                        <Progress value={month.percentage} className="h-2 bg-gray-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Doctor Performance */}
                <Card className="bg-white shadow-sm border-none">
                    <CardHeader className="border-b bg-white px-6 py-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5 text-purple-600" />
                            Performance par médecin
                        </CardTitle>
                        <CardDescription>Top performeurs du mois</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {stats.doctorStats.map((doctor) => (
                                <div key={doctor.name} className="group p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all duration-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 font-bold border border-purple-100">
                                                {doctor.name.split(' ')[1][0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{doctor.name}</p>
                                                <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600">
                                                    {doctor.specialty}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">{formatCurrency(doctor.revenue)}</p>
                                            <p className="text-xs text-muted-foreground">Revenus générés</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
                                            <span className="block font-bold text-gray-900 text-lg">{doctor.appointments}</span>
                                            <span className="text-xs text-muted-foreground">Consultations</span>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
                                            <span className="block font-bold text-gray-900 text-lg">{doctor.patients}</span>
                                            <span className="text-xs text-muted-foreground">Patients</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground font-medium">Score de performance</span>
                                            <span className="font-bold text-purple-600">{doctor.performance}/100</span>
                                        </div>
                                        <Progress value={doctor.performance} className="h-1.5 bg-gray-100" />
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
