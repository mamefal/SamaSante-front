"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, FileText, FlaskConical, Award, Send, Users, Calendar } from "lucide-react"

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState("30")

    // Mock analytics data
    const overviewStats = [
        { title: "Ordonnances", value: "156", change: "+12%", trend: "up", icon: FileText, color: "from-blue-500 to-cyan-500" },
        { title: "Analyses", value: "89", change: "+8%", trend: "up", icon: FlaskConical, color: "from-cyan-500 to-blue-500" },
        { title: "Certificats", value: "45", change: "+15%", trend: "up", icon: Award, color: "from-green-500 to-emerald-500" },
        { title: "Références", value: "23", change: "+5%", trend: "up", icon: Send, color: "from-purple-500 to-pink-500" },
    ]

    const prescriptionTrends = [
        { month: "Jan", count: 45 },
        { month: "Fév", count: 52 },
        { month: "Mar", count: 48 },
        { month: "Avr", count: 61 },
        { month: "Mai", count: 55 },
        { month: "Juin", count: 67 },
    ]

    const topMedications = [
        { name: "Paracétamol", count: 45, percentage: 28.8 },
        { name: "Amoxicilline", count: 38, percentage: 24.4 },
        { name: "Metformine", count: 32, percentage: 20.5 },
        { name: "Amlodipine", count: 25, percentage: 16.0 },
        { name: "Autres", count: 16, percentage: 10.3 },
    ]

    const labTestDistribution = [
        { name: "NFS", value: 25, color: "#3b82f6" },
        { name: "Glycémie", value: 20, color: "#06b6d4" },
        { name: "Créatinine", value: 15, color: "#8b5cf6" },
        { name: "Bilan lipidique", value: 18, color: "#ec4899" },
        { name: "Autres", value: 22, color: "#10b981" },
    ]

    const certificateTypes = [
        { type: "Arrêt maladie", count: 28 },
        { type: "Aptitude", count: 12 },
        { type: "Médical", count: 5 },
    ]

    const patientDemographics = [
        { ageGroup: "0-18", count: 15 },
        { ageGroup: "19-35", count: 45 },
        { ageGroup: "36-50", count: 38 },
        { ageGroup: "51-65", count: 32 },
        { ageGroup: "65+", count: 20 },
    ]

    const referralSpecialties = [
        { specialty: "Cardiologie", count: 8 },
        { specialty: "Dermatologie", count: 5 },
        { specialty: "Ophtalmologie", count: 4 },
        { specialty: "Orthopédie", count: 3 },
        { specialty: "Autres", count: 3 },
    ]

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Rapports & Analytiques</h1>
                    <p className="text-muted-foreground">Vue d'ensemble de votre activité médicale</p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">7 derniers jours</SelectItem>
                        <SelectItem value="30">30 derniers jours</SelectItem>
                        <SelectItem value="90">90 derniers jours</SelectItem>
                        <SelectItem value="365">12 derniers mois</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                        <div className="flex items-center mt-2">
                                            {stat.trend === "up" ? (
                                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                                            )}
                                            <span className={`text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                                                {stat.change}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Prescription Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tendance des ordonnances</CardTitle>
                        <CardDescription>Évolution mensuelle</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={prescriptionTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Ordonnances" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Lab Test Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Répartition des analyses</CardTitle>
                        <CardDescription>Types de tests prescrits</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={labTestDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: { name?: string, percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {labTestDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Medications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Médicaments les plus prescrits</CardTitle>
                        <CardDescription>Top 5 des médicaments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topMedications.map((med, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">{med.name}</span>
                                            <span className="text-sm text-muted-foreground">{med.count} fois</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                                                style={{ width: `${med.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Patient Demographics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Démographie des patients</CardTitle>
                        <CardDescription>Répartition par âge</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={patientDemographics}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ageGroup" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8b5cf6" name="Patients" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certificate Types */}
                <Card>
                    <CardHeader>
                        <CardTitle>Types de certificats</CardTitle>
                        <CardDescription>Répartition par type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={certificateTypes} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="type" type="category" width={120} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10b981" name="Nombre" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Referral Specialties */}
                <Card>
                    <CardHeader>
                        <CardTitle>Spécialités référées</CardTitle>
                        <CardDescription>Références par spécialité</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {referralSpecialties.map((ref, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <span className="text-sm font-medium">{ref.specialty}</span>
                                    <Badge variant="outline" className="bg-purple-50">
                                        {ref.count} références
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Taux de prescription</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">85%</div>
                        <p className="text-sm text-muted-foreground mt-2">
                            des consultations avec ordonnance
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Délai moyen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-cyan-600">2.5 jours</div>
                        <p className="text-sm text-muted-foreground mt-2">
                            pour les résultats d'analyses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Taux de suivi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">92%</div>
                        <p className="text-sm text-muted-foreground mt-2">
                            des patients suivent le traitement
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
