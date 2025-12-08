"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { StatsCard } from "@/components/monitoring/stats-card"
import { ActivityChart } from "@/components/monitoring/activity-chart"
import { HealthStatus } from "@/components/monitoring/health-status"
import { api } from "@/lib/api"
import { Users, Calendar, UserCheck, Activity, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface SystemStats {
    users: {
        total: number
        byRole: Record<string, number>
    }
    appointments: {
        total: number
        byStatus: Record<string, number>
    }
    doctors: {
        total: number
        verified: number
    }
    patients: {
        total: number
    }
}

interface SystemHealth {
    database: {
        status: 'healthy' | 'degraded' | 'down'
        responseTime: number
    }
    api: {
        status: 'healthy' | 'degraded' | 'down'
        uptime: number
    }
    memory: {
        used: number
        total: number
        percentage: number
    }
}

interface ActivityMetrics {
    appointmentsLast7Days: Array<{ date: string; count: number }>
    usersLast7Days: Array<{ date: string; count: number }>
    activeUsers: number
}

export default function MonitoringPage() {
    const [stats, setStats] = useState<SystemStats | null>(null)
    const [health, setHealth] = useState<SystemHealth | null>(null)
    const [metrics, setMetrics] = useState<ActivityMetrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

    const fetchData = async () => {
        try {
            const [statsRes, healthRes, metricsRes] = await Promise.all([
                api.get('/monitoring/stats'),
                api.get('/monitoring/health'),
                api.get('/monitoring/metrics'),
            ])

            setStats(statsRes.data)
            setHealth(healthRes.data)
            setMetrics(metricsRes.data)
            setLastUpdate(new Date())
        } catch (error: any) {
            console.error('Error fetching monitoring data:', error)
            if (error.response?.status === 403) {
                toast.error("Accès refusé - SUPER_ADMIN requis")
            } else {
                toast.error("Erreur lors du chargement des données")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <AuthGuard allowedRoles={['SUPER_ADMIN']}>
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
            </AuthGuard>
        )
    }

    return (
        <AuthGuard allowedRoles={['SUPER_ADMIN']}>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto p-6 space-y-6 fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Monitoring</h1>
                            <p className="text-muted-foreground">
                                Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
                            </p>
                        </div>
                        <Button onClick={fetchData} variant="outline" size="sm" className="btn-scale">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualiser
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatsCard
                                title="Total Utilisateurs"
                                value={stats.users.total}
                                icon={Users}
                                description={`${stats.users.byRole.DOCTOR || 0} docteurs, ${stats.users.byRole.PATIENT || 0} patients`}
                            />
                            <StatsCard
                                title="Rendez-vous"
                                value={stats.appointments.total}
                                icon={Calendar}
                                description={`${stats.appointments.byStatus.booked || 0} à venir`}
                            />
                            <StatsCard
                                title="Docteurs Vérifiés"
                                value={stats.doctors.verified}
                                icon={UserCheck}
                                description={`${stats.doctors.total} total`}
                            />
                            <StatsCard
                                title="Patients"
                                value={stats.patients.total}
                                icon={Activity}
                            />
                        </div>
                    )}

                    {/* Charts */}
                    {metrics && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <ActivityChart
                                title="Rendez-vous (7 derniers jours)"
                                data={metrics.appointmentsLast7Days}
                            />
                            <ActivityChart
                                title="Nouvelles inscriptions (7 derniers jours)"
                                data={metrics.usersLast7Days}
                            />
                        </div>
                    )}

                    {/* Health Status */}
                    {health && (
                        <HealthStatus
                            database={health.database}
                            api={health.api}
                            memory={health.memory}
                        />
                    )}
                </div>
            </div>
        </AuthGuard>
    )
}
