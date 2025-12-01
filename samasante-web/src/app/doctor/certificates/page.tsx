"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { FileText, Plus, Search, Eye, Trash2, Calendar, User, Award, Clipboard } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

type Certificate = {
    id: number
    type: string
    diagnosis?: string
    startDate: string
    endDate?: string
    days?: number
    content: string
    createdAt: string
    patient: {
        id: number
        firstName: string
        lastName: string
    }
}

// Certificate templates
const CERTIFICATE_TEMPLATES = {
    sick_leave: {
        title: "Arrêt de travail",
        icon: Clipboard,
        template: (patientName: string, diagnosis: string, days: number) =>
            `Je soussigné(e), Docteur [NOM], certifie avoir examiné ${patientName} ce jour.\n\nDiagnostic: ${diagnosis}\n\nEn conséquence, je prescris un arrêt de travail de ${days} jours à compter de ce jour.\n\nCertificat établi à la demande de l'intéressé(e) pour faire valoir ce que de droit.`
    },
    fitness: {
        title: "Certificat d'aptitude",
        icon: Award,
        template: (patientName: string) =>
            `Je soussigné(e), Docteur [NOM], certifie avoir examiné ${patientName} ce jour.\n\nÀ l'issue de cet examen, je certifie que l'état de santé de ${patientName} est compatible avec la pratique d'activités physiques et sportives.\n\nCertificat établi à la demande de l'intéressé(e) pour faire valoir ce que de droit.`
    },
    medical_report: {
        title: "Certificat médical",
        icon: FileText,
        template: (patientName: string) =>
            `Je soussigné(e), Docteur [NOM], certifie avoir examiné ${patientName} ce jour.\n\n[Indiquez ici les constatations médicales]\n\nCertificat établi à la demande de l'intéressé(e) pour faire valoir ce que de droit.`
    }
}

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
    const [showViewModal, setShowViewModal] = useState(false)

    // Create certificate form state
    const [patientId, setPatientId] = useState("")
    const [patientName, setPatientName] = useState("")
    const [certificateType, setCertificateType] = useState<keyof typeof CERTIFICATE_TEMPLATES>("sick_leave")
    const [diagnosis, setDiagnosis] = useState("")
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState("")
    const [days, setDays] = useState("")
    const [content, setContent] = useState("")

    useEffect(() => {
        fetchCertificates()
    }, [])

    useEffect(() => {
        // Update template when type or patient changes
        if (patientName) {
            const template = CERTIFICATE_TEMPLATES[certificateType].template(
                patientName,
                diagnosis || "[Diagnostic]",
                Number(days) || 0
            )
            setContent(template)
        }
    }, [certificateType, patientName, diagnosis, days])

    const fetchCertificates = async () => {
        try {
            const response = await api.get("/certificates")
            setCertificates(response.data)
        } catch (error) {
            console.error("Error fetching certificates:", error)
            toast.error("Erreur lors du chargement des certificats")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCertificate = async () => {
        if (!patientId || !content || !startDate) {
            toast.error("Veuillez remplir tous les champs obligatoires")
            return
        }

        try {
            await api.post("/certificates", {
                patientId: Number(patientId),
                type: certificateType,
                diagnosis: diagnosis || undefined,
                startDate,
                endDate: endDate || undefined,
                days: days ? Number(days) : undefined,
                content
            })

            toast.success("Certificat créé avec succès")
            setShowCreateModal(false)
            resetForm()
            fetchCertificates()
        } catch (error) {
            console.error("Error creating certificate:", error)
            toast.error("Erreur lors de la création du certificat")
        }
    }

    const handleDeleteCertificate = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce certificat ?")) return

        try {
            await api.delete(`/certificates/${id}`)
            toast.success("Certificat supprimé")
            fetchCertificates()
        } catch (error) {
            console.error("Error deleting certificate:", error)
            toast.error("Erreur lors de la suppression")
        }
    }

    const resetForm = () => {
        setPatientId("")
        setPatientName("")
        setCertificateType("sick_leave")
        setDiagnosis("")
        setStartDate(new Date().toISOString().split('T')[0])
        setEndDate("")
        setDays("")
        setContent("")
    }

    const getCertificateTypeBadge = (type: string) => {
        const config = {
            sick_leave: { label: "Arrêt de travail", className: "bg-orange-100 text-orange-800" },
            fitness: { label: "Aptitude", className: "bg-green-100 text-green-800" },
            medical_report: { label: "Certificat médical", className: "bg-blue-100 text-blue-800" },
        }[type] || { label: type, className: "bg-gray-100 text-gray-800" }

        return <Badge className={config.className}>{config.label}</Badge>
    }

    const filteredCertificates = certificates.filter(cert =>
        cert.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.type.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Certificats médicaux</h1>
                    <p className="text-muted-foreground">Générez et gérez les certificats médicaux</p>
                </div>
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Nouveau certificat
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Créer un certificat médical</DialogTitle>
                            <DialogDescription>
                                Sélectionnez le type de certificat et remplissez les informations
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
                                    <Label htmlFor="patientName">Nom du patient *</Label>
                                    <Input
                                        id="patientName"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="Ex: Jean Dupont"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Type de certificat *</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(CERTIFICATE_TEMPLATES).map(([key, template]) => {
                                        const Icon = template.icon
                                        return (
                                            <div
                                                key={key}
                                                onClick={() => setCertificateType(key as keyof typeof CERTIFICATE_TEMPLATES)}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${certificateType === key
                                                        ? "border-green-500 bg-green-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <Icon className={`h-6 w-6 mb-2 ${certificateType === key ? "text-green-600" : "text-gray-400"}`} />
                                                <p className="font-medium text-sm">{template.title}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {certificateType === "sick_leave" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="diagnosis">Diagnostic</Label>
                                        <Input
                                            id="diagnosis"
                                            value={diagnosis}
                                            onChange={(e) => setDiagnosis(e.target.value)}
                                            placeholder="Ex: Grippe saisonnière"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="startDate">Date de début *</Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="days">Nombre de jours</Label>
                                            <Input
                                                id="days"
                                                type="number"
                                                value={days}
                                                onChange={(e) => {
                                                    setDays(e.target.value)
                                                    if (e.target.value && startDate) {
                                                        const start = new Date(startDate)
                                                        start.setDate(start.getDate() + Number(e.target.value))
                                                        setEndDate(start.toISOString().split('T')[0])
                                                    }
                                                }}
                                                placeholder="Ex: 7"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="endDate">Date de fin</Label>
                                            <Input
                                                id="endDate"
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {certificateType !== "sick_leave" && (
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Date *</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="content">Contenu du certificat *</Label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Contenu du certificat..."
                                    rows={10}
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={handleCreateCertificate}>
                                    Créer le certificat
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
                        placeholder="Rechercher par patient ou type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Certificates List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">Chargement...</p>
                        </CardContent>
                    </Card>
                ) : filteredCertificates.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-muted-foreground">Aucun certificat trouvé</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredCertificates.map((certificate) => (
                        <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {certificate.patient.firstName} {certificate.patient.lastName}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3 inline mr-1" />
                                                    {new Date(certificate.createdAt).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                {getCertificateTypeBadge(certificate.type)}
                                            </div>

                                            {certificate.diagnosis && (
                                                <div>
                                                    <span className="text-sm font-medium text-muted-foreground">Diagnostic:</span>
                                                    <p className="text-sm">{certificate.diagnosis}</p>
                                                </div>
                                            )}

                                            {certificate.days && (
                                                <div>
                                                    <span className="text-sm font-medium text-muted-foreground">Durée:</span>
                                                    <p className="text-sm">{certificate.days} jours</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedCertificate(certificate)
                                                setShowViewModal(true)
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Voir
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteCertificate(certificate.id)}
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

            {/* View Certificate Modal */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Certificat médical</DialogTitle>
                    </DialogHeader>

                    {selectedCertificate && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Patient</Label>
                                    <p className="text-sm font-medium">
                                        {selectedCertificate.patient.firstName} {selectedCertificate.patient.lastName}
                                    </p>
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <p className="text-sm">
                                        {new Date(selectedCertificate.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label>Type</Label>
                                <div className="mt-1">
                                    {getCertificateTypeBadge(selectedCertificate.type)}
                                </div>
                            </div>

                            {selectedCertificate.diagnosis && (
                                <div>
                                    <Label>Diagnostic</Label>
                                    <p className="text-sm">{selectedCertificate.diagnosis}</p>
                                </div>
                            )}

                            {selectedCertificate.days && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label>Date de début</Label>
                                        <p className="text-sm">
                                            {new Date(selectedCertificate.startDate).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div>
                                        <Label>Durée</Label>
                                        <p className="text-sm">{selectedCertificate.days} jours</p>
                                    </div>
                                    {selectedCertificate.endDate && (
                                        <div>
                                            <Label>Date de fin</Label>
                                            <p className="text-sm">
                                                {new Date(selectedCertificate.endDate).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <Label>Contenu</Label>
                                <Card className="p-4 bg-muted/30 mt-2">
                                    <pre className="text-sm whitespace-pre-wrap font-sans">
                                        {selectedCertificate.content}
                                    </pre>
                                </Card>
                            </div>

                            <div className="flex justify-end">
                                <Button>
                                    <FileText className="h-4 w-4 mr-2" />
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
