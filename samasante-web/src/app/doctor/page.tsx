"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    Calendar,
    TrendingUp,
    Star,
    Clock,
    Activity,
    DollarSign,
    ArrowUpRight,
    Loader2,
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { api } from "@/lib/api"
import { getUser } from "@/lib/auth"

type DashboardStats = {
    totalPatients: number
    todayAppointments: Array<{
        id: number
        patient: string
        time: string
        type: string
        status: string
    }>
    weeklyAppointments: any[]
    recentActivity: Array<{
        id: number
        patient: string
        action: string
        time: string
    }>
}

export default function DoctorDashboard() {
    const [loading, setLoading] = useState(true)
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
    const [doctorName, setDoctorName] = useState("Dr.")

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get doctor name from user data
                const user = getUser()
                if (user?.name) {
                    setDoctorName(`Dr. ${user.name}`)
                }

                // Fetch dashboard stats
                const response = await api.get("/doctors/stats")
                setDashboardStats(response.data)
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Mock data for charts (will be replaced with real data later)
    const appointmentsTrend = [
        { day: "Lun", appointments: 4 },
        { day: "Mar", appointments: 6 },
        { day: "Mer", appointments: 8 },
        { day: "Jeu", appointments: 5 },
        { day: "Ven", appointments: 9 },
        { day: "Sam", appointments: 3 },
        { day: "Dim", appointments: 1 },
    ]

    const statsCards = [
        {
            title: "Total Patients",
            value: dashboardStats?.totalPatients || "0",
            change: "+12%",
            trend: "up",
            icon: Users,
            color: "from-blue-500 to-cyan-500",
        },
        {
            title: "RDV Aujourd'hui",
            value: dashboardStats?.todayAppointments?.length || "0",
            change: "Planning chargé",
            trend: "up",
            icon: Calendar,
            color: "from-cyan-500 to-teal-500",
        },
        {
            title: "Revenus (mois)",
            value: "1.2M FCFA",
            change: "+8%",
            trend: "up",
            icon: DollarSign,
            color: "from-green-500 to-emerald-500",
        },
        {
            title: "Satisfaction",
            value: "4.9/5",
            change: "Top 5%",
            trend: "up",
            icon: Star,
            color: "from-yellow-500 to-orange-500",
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Bonjour, {doctorName}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Voici un aperçu de votre activité aujourd&apos;hui
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="shadow-sm hover:shadow-md transition-all">
                        <Calendar className="mr-2 h-4 w-4" />
                        Mon Agenda
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all">
                        <Users className="mr-2 h-4 w-4" />
                        Nouveau Patient
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, index) => (
                    <Card key={index} className={`border-l-4 border-l-${stat.color.split(' ')[0].replace('from-', '')} shadow-md hover:shadow-lg transition-shadow`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                                <stat.icon className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <div className="flex items-center mt-1">
                                {stat.trend === "up" ? (
                                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                ) : (
                                    <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
                                )}
                                <p className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                                    {stat.change}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Appointments Chart */}
                <Card className="col-span-4 shadow-lg">
                    <CardHeader>
                        <CardTitle>Rendez-vous de la semaine</CardTitle>
                        <CardDescription>
                            Aperçu de votre charge de travail hebdomadaire
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={appointmentsTrend}>
                                    <defs>
                                        <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#0ea5e9', strokeWidth: 1 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="appointments"
                                        stroke="#0ea5e9"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAppointments)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Today's Schedule */}
                <Card className="col-span-3 shadow-lg">
                    <CardHeader>
                        <CardTitle>Aujourd&apos;hui</CardTitle>
                        <CardDescription>
                            Vos prochains rendez-vous
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {dashboardStats?.todayAppointments && dashboardStats.todayAppointments.length > 0 ? (
                                dashboardStats.todayAppointments.map((apt, i) => (
                                    <div key={i} className="flex items-center group">
                                        <div className="flex flex-col items-center mr-4 min-w-[60px]">
                                            <span className="text-sm font-bold text-gray-900">{apt.time}</span>
                                            <div className="h-full w-0.5 bg-gray-200 mt-2 group-last:hidden"></div>
                                        </div>
                                        <div className="flex-1 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100 hover:border-blue-100">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-semibold text-gray-900">{apt.patient}</h4>
                                                <Badge variant={apt.type === 'Urgence' ? 'destructive' : 'secondary'} className="text-xs">
                                                    {apt.type}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                30 min
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                                    <p className="text-muted-foreground">Aucun rendez-vous aujourd&apos;hui</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle>Activité Récente</CardTitle>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            Voir tout <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                            dashboardStats.recentActivity.map((activity) => (
                                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Activity className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{activity.patient}</p>
                                            <p className="text-sm text-gray-500">{activity.action}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-400">{activity.time}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                Aucune activité récente
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
