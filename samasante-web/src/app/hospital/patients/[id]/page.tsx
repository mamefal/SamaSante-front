"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Phone, Mail, MapPin, Clock, FileText, Activity, AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

interface Patient {
    id: number
    firstName: string
    lastName: string
    dob: string
    phone: string
    email: string
    gender: string
    address: string
    createdAt: string
    medicalHistory?: any[]
    appointments?: any[]
}

export default function PatientDetails() {
    const params = useParams()
    const router = useRouter()
    const [patient, setPatient] = useState<Patient | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchPatientDetails(params.id as string)
        }
    }, [params.id])

    const fetchPatientDetails = async (id: string) => {
        try {
            const res = await api.get(`/patients/${id}`)
            setPatient(res.data)
        } catch (error) {
            console.error("Error fetching patient details:", error)
            toast.error("Erreur lors du chargement du dossier patient")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50">
                <h2 className="text-xl font-semibold text-gray-900">Patient non trouvé</h2>
                <Button variant="link" onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la liste
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dossier Médical</h1>
                    <p className="text-muted-foreground">
                        Détails et historique du patient
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar - Patient Info */}
                <Card className="lg:col-span-1 h-fit bg-white shadow-sm border-none">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center mb-6">
                            <Avatar className="h-24 w-24 border-4 border-blue-50 mb-4">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
                                    {patient.firstName[0]}{patient.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {patient.firstName} {patient.lastName}
                            </h2>
                            <p className="text-muted-foreground">
                                Né(e) le {format(new Date(patient.dob), "d MMMM yyyy", { locale: fr })}
                            </p>
                            <div className="flex gap-2 mt-4">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                                    Patient
                                </Badge>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                                    Actif
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900">{patient.phone || "Non renseigné"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900">{patient.email || "Non renseigné"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900">{patient.address || "Non renseigné"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900">
                                    Inscrit le {format(new Date(patient.createdAt), "d MMM yyyy", { locale: fr })}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <Calendar className="mr-2 h-4 w-4" />
                                Prendre Rendez-vous
                            </Button>
                            <Button variant="outline" className="w-full">
                                <FileText className="mr-2 h-4 w-4" />
                                Éditer le profil
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content - Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-xl border border-gray-100">
                            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                            <TabsTrigger value="history">Historique</TabsTrigger>
                            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6 space-y-6">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <Card className="bg-white shadow-sm border-none">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Activity className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Consultations</p>
                                            <p className="text-lg font-bold">12</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white shadow-sm border-none">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <FileText className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Ordonnances</p>
                                            <p className="text-lg font-bold">8</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white shadow-sm border-none">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Allergies</p>
                                            <p className="text-lg font-bold">2</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Activity */}
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg">Activité Récente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        Aucune activité récente à afficher.
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="mt-6">
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg">Historique Médical</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12 text-muted-foreground">
                                        Historique médical vide ou non accessible.
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="appointments" className="mt-6">
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg">Rendez-vous</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12 text-muted-foreground">
                                        Aucun rendez-vous programmé.
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="documents" className="mt-6">
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg">Documents</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12 text-muted-foreground">
                                        Aucun document disponible.
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
