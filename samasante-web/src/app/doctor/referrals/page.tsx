"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Send, Plus, Search, Eye, Trash2, Calendar, User, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

type Referral = {
    id: number
    specialistName: string
    specialty: string
    reason: string
    urgency: string
    clinicalSummary?: string
    investigations?: string
    createdAt: string
    patient: {
        id: number
        firstName: string
        lastName: string
    }
}

const SPECIALTIES = [
    "Cardiologie",
    "Dermatologie",
    "Endocrinologie",
    "Gastro-entérologie",
    "Gynécologie",
    "Neurologie",
    "Ophtalmologie",
    "ORL",
    "Orthopédie",
    "Pédiatrie",
    "Pneumologie",
    "Psychiatrie",
    "Rhumatologie",
    "Urologie",
]

export default function ReferralsPage() {
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
    const [showViewModal, setShowViewModal] = useState(false)

    // Create referral form state
    const [patientId, setPatientId] = useState("")
    const [specialistName, setSpecialistName] = useState("")
    const [specialty, setSpecialty] = useState("")
    const [reason, setReason] = useState("")
    const [urgency, setUrgency] = useState("normal")
    const [clinicalSummary, setClinicalSummary] = useState("")
    const [investigations, setInvestigations] = useState("")

    useEffect(() => {
        fetchReferrals()
    }, [])

    const fetchReferrals = async () => {
        try {
            const response = await api.get("/referrals")
            setReferrals(response.data)
        } catch (error) {
            console.error("Error fetching referrals:", error)
            toast.error("Erreur lors du chargement des lettres de référence")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateReferral = async () => {
        if (!patientId || !specialistName || !specialty || !reason) {
            toast.error("Veuillez remplir tous les champs obligatoires")
            return
        }

        try {
            await api.post("/referrals", {
                patientId: Number(patientId),
                specialistName,
                specialty,
                reason,
                urgency,
                clinicalSummary: clinicalSummary || undefined,
                investigations: investigations || undefined
            })

            toast.success("Lettre de référence créée avec succès")
            setShowCreateModal(false)
            resetForm()
            fetchReferrals()
        } catch (error) {
            console.error("Error creating referral:", error)
            toast.error("Erreur lors de la création")
        }
    }

    const handleDeleteReferral = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette lettre ?")) return

        try {
            await api.delete(`/referrals/${id}`)
            toast.success("Lettre supprimée")
            fetchReferrals()
        } catch (error) {
            console.error("Error deleting referral:", error)
            toast.error("Erreur lors de la suppression")
        }
    }

    const resetForm = () => {
        setPatientId("")
        setSpecialistName("")
        setSpecialty("")
        setReason("")
        setUrgency("normal")
        setClinicalSummary("")
        setInvestigations("")
    }

    const getUrgencyBadge = (urgency: string) => {
        return urgency === "urgent" ? (
            <Badge className="bg-red-100 text-red-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Urgent
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-blue-100 text-blue-800">Normal</Badge>
        )
    }

    const filteredReferrals = referrals.filter(ref =>
        ref.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.specialistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Lettres de référence</h1>
                    <p className="text-muted-foreground">Référez vos patients à des spécialistes</p>
                </div>
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle référence
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Créer une lettre de référence</DialogTitle>
                            <DialogDescription>
                                Référez un patient à un spécialiste
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="patientId">ID Patient *</Label>
                                    <Input
                                        id="patientId"
                                        type="number"
                                        value={patientId}
                                        onChange={(e) => setPatientId(e.target.value)}
                                        placeholder="Ex: 1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="urgency">Urgence</Label>
                                    <Select value={urgency} onValueChange={setUrgency}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="specialistName">Nom du spécialiste *</Label>
                                    <Input
                                        id="specialistName"
                                        value={specialistName}
                                        onChange={(e) => setSpecialistName(e.target.value)}
                                        placeholder="Dr. Nom Prénom"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="specialty">Spécialité *</Label>
                                    <Select value={specialty} onValueChange={setSpecialty}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SPECIALTIES.map(spec => (
                                                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Motif de la référence *</Label>
                                <Textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Décrivez le motif de la référence..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="clinicalSummary">Résumé clinique</Label>
                                <Textarea
                                    id="clinicalSummary"
                                    value={clinicalSummary}
                                    onChange={(e) => setClinicalSummary(e.target.value)}
                                    placeholder="Antécédents, symptômes, examen clinique..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="investigations">Examens réalisés</Label>
                                <Textarea
                                    id="investigations"
                                    value={investigations}
                                    onChange={(e) => setInvestigations(e.target.value)}
                                    placeholder="Analyses, imagerie, autres examens..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={handleCreateReferral}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Créer la référence
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par patient ou spécialiste..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Referrals List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">Chargement...</p>
                        </CardContent>
                    </Card>
                ) : filteredReferrals.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-muted-foreground">Aucune lettre de référence trouvée</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredReferrals.map((referral) => (
                        <Card key={referral.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {referral.patient.firstName} {referral.patient.lastName}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3 inline mr-1" />
                                                    {new Date(referral.createdAt).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                {getUrgencyBadge(referral.urgency)}
                                                <Badge variant="outline" className="bg-purple-50">
                                                    {referral.specialty}
                                                </Badge>
                                            </div>

                                            <div>
                                                <span className="text-sm font-medium text-muted-foreground">Spécialiste:</span>
                                                <p className="text-sm">{referral.specialistName}</p>
                                            </div>

                                            <div>
                                                <span className="text-sm font-medium text-muted-foreground">Motif:</span>
                                                <p className="text-sm">{referral.reason}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedReferral(referral)
                                                setShowViewModal(true)
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Voir
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteReferral(referral.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* View Referral Modal */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Lettre de référence</DialogTitle>
                    </DialogHeader>

                    {selectedReferral && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Patient</Label>
                                    <p className="text-sm font-medium">
                                        {selectedReferral.patient.firstName} {selectedReferral.patient.lastName}
                                    </p>
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <p className="text-sm">
                                        {new Date(selectedReferral.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Spécialiste</Label>
                                    <p className="text-sm">{selectedReferral.specialistName}</p>
                                </div>
                                <div>
                                    <Label>Spécialité</Label>
                                    <p className="text-sm">{selectedReferral.specialty}</p>
                                </div>
                            </div>

                            <div>
                                <Label>Urgence</Label>
                                <div className="mt-1">
                                    {getUrgencyBadge(selectedReferral.urgency)}
                                </div>
                            </div>

                            <div>
                                <Label>Motif de la référence</Label>
                                <Card className="p-4 bg-muted/30 mt-2">
                                    <p className="text-sm whitespace-pre-wrap">{selectedReferral.reason}</p>
                                </Card>
                            </div>

                            {selectedReferral.clinicalSummary && (
                                <div>
                                    <Label>Résumé clinique</Label>
                                    <Card className="p-4 bg-muted/30 mt-2">
                                        <p className="text-sm whitespace-pre-wrap">{selectedReferral.clinicalSummary}</p>
                                    </Card>
                                </div>
                            )}

                            {selectedReferral.investigations && (
                                <div>
                                    <Label>Examens réalisés</Label>
                                    <Card className="p-4 bg-muted/30 mt-2">
                                        <p className="text-sm whitespace-pre-wrap">{selectedReferral.investigations}</p>
                                    </Card>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <Button>
                                    <Send className="h-4 w-4 mr-2" />
                                    Imprimer / Exporter PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
