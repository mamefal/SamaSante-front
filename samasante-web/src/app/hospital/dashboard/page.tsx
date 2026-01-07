"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Users,
    Calendar,
    UserCog,
    Activity,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Bed,
    LogOut,
    LogIn,
    MoreHorizontal
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardStats {
    totalPatients: number
    totalDoctors: number
    totalAppointments: number
    todayAppointments: number
    totalDepartments: number
    urgentCases: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const mockMonthlyData = [
    { name: 'Jan', appointments: 40, revenue: 2400 },
    { name: 'Feb', appointments: 30, revenue: 1398 },
    { name: 'Mar', appointments: 20, revenue: 9800 },
    { name: 'Apr', appointments: 27, revenue: 3908 },
    { name: 'May', appointments: 18, revenue: 4800 },
    { name: 'Jun', appointments: 23, revenue: 3800 },
    { name: 'Jul', appointments: 34, revenue: 4300 },
    { name: 'Aug', appointments: 45, revenue: 5300 },
    { name: 'Sep', appointments: 32, revenue: 4100 },
    { name: 'Oct', appointments: 38, revenue: 4800 },
    { name: 'Nov', appointments: 42, revenue: 5100 },
    { name: 'Dec', appointments: 55, revenue: 6200 },
];

const mockRoomStatus = [
    { name: 'Available', value: 20 },
    { name: 'Occupied', value: 15 },
    { name: 'Cleaning', value: 10 },
    { name: 'Not ready', value: 25 },
    { name: 'Out of service', value: 30 },
];

export default function HospitalDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [appointments, setAppointments] = useState<any[]>([])
    const [fullStats, setFullStats] = useState<any>(null)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [statsRes, doctorsRes, departmentsRes] = await Promise.all([
                api.get("/hospital-admins/stats").catch(() => ({ data: null })),
                api.get("/doctors").catch(() => ({ data: [] })),
                api.get("/departments").catch(() => ({ data: [] }))
            ])

            if (statsRes.data) {
                const s = statsRes.data
                setStats({
                    totalPatients: s.totalPatients || 0,
                    totalDoctors: doctorsRes.data.length,
                    totalAppointments: s.todayAppointments + (s.monthlyStats || []).reduce((acc: number, curr: any) => acc + curr.appointments, 0),
                    todayAppointments: s.todayAppointments,
                    totalDepartments: departmentsRes.data.length,
                    urgentCases: s.urgentCases || 0
                })
                setFullStats(s)
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            toast.error("Erreur lors du chargement")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="p-8 flex items-center justify-center h-screen">Chargement...</div>
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-muted-foreground">Bienvenue sur votre tableau de bord</p>
                </div>
                <div className="flex gap-4">
                    {/* Add header actions here if needed */}
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Patients Total (Unique)</p>
                                <h3 className="text-3xl font-bold mt-2">{stats?.totalPatients || 0}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-blue-600 flex items-center font-medium">
                                <Activity className="h-4 w-4 mr-1" />
                                Satisfaction: {fullStats?.satisfaction?.toFixed(1) || '4.8'}/5
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nouveaux RDV</p>
                                <h3 className="text-3xl font-bold mt-2">{stats?.todayAppointments || 0}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-600 flex items-center font-medium">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                8.70%
                            </span>
                            <span className="text-muted-foreground ml-2">vs semaine dernière</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Admissions</p>
                                <h3 className="text-3xl font-bold mt-2">{fullStats?.admissions || 0}</h3>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <LogIn className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-600 flex items-center font-medium">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                2.3%
                            </span>
                            <span className="text-muted-foreground ml-2">vs semaine dernière</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Sorties</p>
                                <h3 className="text-3xl font-bold mt-2">{fullStats?.discharges || 0}</h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <LogOut className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-red-600 flex items-center font-medium">
                                <TrendingDown className="h-4 w-4 mr-1" />
                                5.2%
                            </span>
                            <span className="text-muted-foreground ml-2">vs semaine dernière</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Revenus Total</p>
                                <h3 className="text-3xl font-bold mt-2">{(fullStats?.totalRevenue || 0).toLocaleString()} FCFA</h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-600 flex items-center font-medium">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                4.85%
                            </span>
                            <span className="text-muted-foreground ml-2">vs semaine dernière</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section 1 */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Reservations Bar Chart */}
                <Card className="md:col-span-2 bg-white shadow-sm border-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Statistiques des Rendez-vous</CardTitle>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={fullStats?.monthlyStats || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Booking Sources Pie Chart */}
                <Card className="bg-white shadow-sm border-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Sources de Réservation</CardTitle>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={fullStats?.bookingSources || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(fullStats?.bookingSources || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {(fullStats?.bookingSources || []).map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section 2 - Room Status */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 bg-white shadow-sm border-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Statut des Lits (Détail)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={fullStats?.roomStatus || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(fullStats?.roomStatus || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {(fullStats?.roomStatus || []).map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                                        <span className="text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Line Chart */}
                <Card className="md:col-span-2 bg-white shadow-sm border-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Revenus</CardTitle>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={fullStats?.monthlyStats || []}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Check-in List */}
                <Card className="bg-white shadow-sm border-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Prochains RDV</CardTitle>
                        <Button variant="link" className="text-blue-600 text-sm">Voir tout</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {appointments.length > 0 ? appointments.map((apt: any, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 bg-gray-100">
                                            <AvatarFallback>{apt.patient?.firstName?.[0]}{apt.patient?.lastName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                                            <p className="text-xs text-muted-foreground">Dr. {apt.doctor?.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 mb-1">
                                            {new Date(apt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground">{new Date(apt.start).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-muted-foreground py-8">Aucun rendez-vous</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
