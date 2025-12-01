"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    Users,
    UserCog,
    Calendar,
    TrendingUp,
    Plus,
    Search,
    Edit,
    Power,
    Loader2
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Organization {
    id: number
    name: string
    slug: string
    type: string
    city: string
    region: string
    isActive: boolean
    _count: {
        doctors: number
        patients: number
        users: number
    }
}

interface Stats {
    totalOrganizations: number
    activeOrganizations: number
    totalDoctors: number
    totalPatients: number
    totalAppointments: number
}

function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </CardContent>
        </Card>
    )
}

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [statsRes, orgsRes] = await Promise.all([
                api.get("/super-admin/stats").catch(() => ({ data: { totalOrganizations: 0, activeOrganizations: 0, totalDoctors: 0, totalPatients: 0, totalAppointments: 0 } })),
                api.get("/super-admin/organizations").catch(() => ({ data: [] }))
            ])
            setStats(statsRes.data)
            setOrganizations(orgsRes.data)
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Erreur lors du chargement des données")
        } finally {
            setLoading(false)
        }
    }

    const toggleOrganization = async (id: number, isActive: boolean) => {
        try {
            await api.put(`/super-admin/organizations/${id}`, { isActive: !isActive })
            toast.success(isActive ? "Organisation désactivée" : "Organisation activée")
            fetchData()
        } catch (error) {
            console.error("Error toggling organization:", error)
            toast.error("Erreur lors de la modification")
        }
    }

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.city.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Super Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Gestion centralisée de la plateforme AMINA
                    </p>
                </div>
                <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Nouvelle Organisation
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                {loading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : stats && (
                    <>
                        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Organisations</CardTitle>
                                <Building2 className="h-5 w-5 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.totalOrganizations}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.activeOrganizations} actives
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Médecins</CardTitle>
                                <UserCog className="h-5 w-5 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.totalDoctors}</div>
                                <p className="text-xs text-muted-foreground mt-1">Sur toute la plateforme</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Patients</CardTitle>
                                <Users className="h-5 w-5 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.totalPatients}</div>
                                <p className="text-xs text-muted-foreground mt-1">Base centralisée</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rendez-vous</CardTitle>
                                <Calendar className="h-5 w-5 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.totalAppointments}</div>
                                <p className="text-xs text-muted-foreground mt-1">Total</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-cyan-500 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Croissance</CardTitle>
                                <TrendingUp className="h-5 w-5 text-cyan-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">+12%</div>
                                <p className="text-xs text-muted-foreground mt-1">Ce mois</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Organizations List */}
            <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Organisations</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {filteredOrgs.length} organisation(s) trouvée(s)
                            </p>
                        </div>
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par nom ou ville..."
                                className="pl-10 h-12 text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        ) : filteredOrgs.length > 0 ? (
                            filteredOrgs.map((org) => (
                                <div
                                    key={org.id}
                                    className="p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-md ${org.isActive
                                                    ? 'bg-gradient-to-br from-green-400 to-green-600'
                                                    : 'bg-gradient-to-br from-gray-400 to-gray-600'
                                                }`}>
                                                <Building2 className="h-7 w-7 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-lg flex items-center gap-3 mb-1">
                                                    {org.name}
                                                    {org.isActive ? (
                                                        <Badge className="bg-green-100 text-green-700">
                                                            Actif
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-red-100 text-red-700">
                                                            Désactivé
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground mb-2">
                                                    {org.city}, {org.region} • {org.type}
                                                </div>
                                                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <UserCog className="h-3 w-3" />
                                                        {org._count.doctors} médecins
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {org._count.patients} patients
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {org._count.users} utilisateurs
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Modifier
                                            </Button>
                                            <Button
                                                variant={org.isActive ? "outline" : "default"}
                                                size="sm"
                                                onClick={() => toggleOrganization(org.id, org.isActive)}
                                                className={org.isActive
                                                    ? "hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                                    : "bg-green-600 hover:bg-green-700"
                                                }
                                            >
                                                <Power className="h-4 w-4 mr-2" />
                                                {org.isActive ? "Désactiver" : "Activer"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Aucune organisation trouvée</h3>
                                <p className="text-muted-foreground">
                                    Essayez de modifier vos critères de recherche
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
