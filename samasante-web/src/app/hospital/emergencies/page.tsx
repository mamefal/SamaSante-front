"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    Ambulance,
    Activity,
    Clock,
    AlertTriangle,
    HeartPulse,
    Stethoscope,
    User,
    Timer,
    Plus,
    Loader2
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Emergency {
    id: number
    patientName: string
    age: number
    gender: string
    condition: string
    severity: 'Critique' | 'Urgent' | 'Stable'
    triage: 'Rouge' | 'Orange' | 'Jaune' | 'Vert'
    status: 'En attente' | 'En traitement' | 'Terminé'
    arrivalTime: string
    doctor?: {
        firstName: string
        lastName: string
    }
}

export default function HospitalEmergencies() {
    const [emergencies, setEmergencies] = useState<Emergency[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        patientName: "",
        age: "",
        gender: "M",
        condition: "",
        severity: "Urgent",
        triage: "Orange",
        status: "En attente"
    })

    useEffect(() => {
        fetchEmergencies()
    }, [])

    const fetchEmergencies = async () => {
        try {
            const res = await api.get("/emergencies")
            setEmergencies(res.data)
        } catch (error) {
            console.error("Error fetching emergencies:", error)
            toast.error("Erreur lors du chargement des urgences")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post("/emergencies", {
                ...formData,
                age: parseInt(formData.age)
            })
            toast.success("Urgence créée")
            setIsDialogOpen(false)
            setFormData({
                patientName: "",
                age: "",
                gender: "M",
                condition: "",
                severity: "Urgent",
                triage: "Orange",
                status: "En attente"
            })
            fetchEmergencies()
        } catch (error) {
            console.error("Error creating emergency:", error)
            toast.error("Erreur lors de la création")
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "Critique":
                return "bg-red-100 text-red-700 border-none animate-pulse"
            case "Urgent":
                return "bg-orange-100 text-orange-700 border-none"
            default:
                return "bg-yellow-100 text-yellow-700 border-none"
        }
    }

    const getTriageColor = (triage: string) => {
        switch (triage) {
            case "Rouge": return "bg-red-500 text-white border-none"
            case "Orange": return "bg-orange-500 text-white border-none"
            case "Jaune": return "bg-yellow-500 text-white border-none"
            case "Vert": return "bg-green-500 text-white border-none"
            default: return "bg-gray-500 text-white"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Calculate stats
    const criticalCases = emergencies.filter(e => e.severity === 'Critique').length
    const urgentCases = emergencies.filter(e => e.severity === 'Urgent').length
    const treatingCases = emergencies.filter(e => e.status === 'En traitement').length

    return (
        <div className="bg-gray-50/50 min-h-screen p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        Urgences
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </div>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestion des cas critiques en temps réel
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700 text-white shadow-sm animate-pulse">
                            <Ambulance className="h-4 w-4 mr-2" />
                            Nouvelle Urgence
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nouvelle Admission d'Urgence</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nom du patient</Label>
                                    <Input
                                        required
                                        value={formData.patientName}
                                        onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Âge</Label>
                                    <Input
                                        type="number"
                                        required
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Condition / Motif</Label>
                                <Input
                                    required
                                    value={formData.condition}
                                    onChange={e => setFormData({ ...formData, condition: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Sévérité</Label>
                                    <Select
                                        value={formData.severity}
                                        onValueChange={v => setFormData({ ...formData, severity: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Critique">Critique</SelectItem>
                                            <SelectItem value="Urgent">Urgent</SelectItem>
                                            <SelectItem value="Stable">Stable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Triage</Label>
                                    <Select
                                        value={formData.triage}
                                        onValueChange={v => setFormData({ ...formData, triage: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Rouge">Rouge</SelectItem>
                                            <SelectItem value="Orange">Orange</SelectItem>
                                            <SelectItem value="Jaune">Jaune</SelectItem>
                                            <SelectItem value="Vert">Vert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                                Créer l'admission
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-red-50 border-red-100 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-red-600">Cas Critiques</p>
                                <h3 className="text-3xl font-bold mt-2 text-red-700">{criticalCases}</h3>
                            </div>
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        <p className="text-xs text-red-600 mt-4 font-medium">Action immédiate requise</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Cas Urgents</p>
                                <h3 className="text-3xl font-bold mt-2 text-orange-600">{urgentCases}</h3>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Activity className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">En attente de prise en charge</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">En Traitement</p>
                                <h3 className="text-3xl font-bold mt-2 text-blue-600">{treatingCases}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Stethoscope className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Médecins mobilisés</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-none hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Temps Moyen</p>
                                <h3 className="text-3xl font-bold mt-2">-- min</h3>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Timer className="h-6 w-6 text-gray-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Délai de prise en charge</p>
                    </CardContent>
                </Card>
            </div>

            {/* Emergency Cases List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-500" />
                    File Active
                </h2>

                {emergencies.length > 0 ? (
                    emergencies.map((case_) => (
                        <Card
                            key={case_.id}
                            className={`
                                border-none shadow-sm hover:shadow-md transition-all duration-200
                                ${case_.severity === 'Critique' ? 'bg-red-50/50 ring-1 ring-red-100' : 'bg-white'}
                            `}
                        >
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            h-12 w-12 rounded-full flex items-center justify-center shadow-sm
                                            ${case_.severity === 'Critique' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}
                                        `}>
                                            <HeartPulse className="h-6 w-6" />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-xl text-gray-900">{case_.patientName}</h3>
                                                <Badge variant="outline" className="bg-white/50">
                                                    {case_.age} ans
                                                </Badge>
                                                <Badge className={getSeverityColor(case_.severity)}>
                                                    {case_.severity}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                                    <span className="text-gray-500">Condition:</span>
                                                    {case_.condition}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" /> Arrivée: {formatDistanceToNow(new Date(case_.arrivalTime), { addSuffix: true, locale: fr })}
                                                    </span>
                                                    {case_.doctor && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3.5 w-3.5" /> Dr. {case_.doctor.lastName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 min-w-[150px]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Triage</span>
                                            <Badge className={`${getTriageColor(case_.triage)} px-3`}>
                                                {case_.triage}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</span>
                                            <Badge variant={case_.status === "En traitement" ? "default" : "secondary"} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
                                                {case_.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Activity className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Aucune urgence en cours</h3>
                        <p className="text-gray-500">Le service des urgences est calme pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
