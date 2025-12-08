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
import { FileText, Plus, Search, Eye, Trash2, Calendar, User, Pill, FileStack, Stethoscope, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { COMMON_MEDICATIONS, PRESCRIPTION_TEMPLATES, searchMedications } from "@/lib/medications"

type Medication = {
    medicationName: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
}

type Prescription = {
    id: number
    diagnosis: string
    notes?: string
    createdAt: string
    validUntil?: string
    patient: {
        id: number
        firstName: string
        lastName: string
    }
    medications: Medication[]
}

export default function PrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showTemplatesModal, setShowTemplatesModal] = useState(false)

    // Create prescription form state
    const [patientId, setPatientId] = useState("")
    const [diagnosis, setDiagnosis] = useState("")
    const [notes, setNotes] = useState("")
    const [medications, setMedications] = useState<Medication[]>([
        { medicationName: "", dosage: "", frequency: "", duration: "", instructions: "" }
    ])

    // Medication search
    const [medicationSearchQuery, setMedicationSearchQuery] = useState<string[]>([])
    const [medicationSuggestions, setMedicationSuggestions] = useState<typeof COMMON_MEDICATIONS>([])
    const [activeMedicationIndex, setActiveMedicationIndex] = useState<number | null>(null)

    useEffect(() => {
        fetchPrescriptions()
    }, [])

    const fetchPrescriptions = async () => {
        try {
            const response = await api.get("/prescriptions")
            setPrescriptions(response.data)
        } catch (error) {
            console.error("Error fetching prescriptions:", error)
            toast.error("Erreur lors du chargement des ordonnances")
        } finally {
            setLoading(false)
        }
    }

    const handleMedicationSearch = (index: number, query: string) => {
        const newSearchQueries = [...medicationSearchQuery]
        newSearchQueries[index] = query
        setMedicationSearchQuery(newSearchQueries)
        setActiveMedicationIndex(index)

        if (query.length >= 2) {
            const results = searchMedications(query)
            setMedicationSuggestions(results)
        } else {
            setMedicationSuggestions([])
        }
    }

    const handleSelectMedication = (index: number, medication: typeof COMMON_MEDICATIONS[0]) => {
        const updated = [...medications]
        updated[index] = {
            ...updated[index],
            medicationName: medication.name,
            dosage: medication.commonDosages[0] || "",
            frequency: medication.frequencies[0] || ""
        }
        setMedications(updated)
        setMedicationSuggestions([])
        setActiveMedicationIndex(null)
    }

    const handleApplyTemplate = (templateId: string) => {
        const template = PRESCRIPTION_TEMPLATES.find(t => t.id === templateId)
        if (template) {
            setDiagnosis(template.diagnosis)
            setMedications(template.medications)
            setShowTemplatesModal(false)
            toast.success("Template appliqué")
        }
    }

    const handleAddMedication = () => {
        setMedications([...medications, { medicationName: "", dosage: "", frequency: "", duration: "", instructions: "" }])
    }

    const handleRemoveMedication = (index: number) => {
        setMedications(medications.filter((_, i) => i !== index))
    }

    const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
        const updated = [...medications]
        updated[index] = { ...updated[index], [field]: value }
        setMedications(updated)
    }

    const handleCreatePrescription = async () => {
        if (!patientId || !diagnosis || medications.some(m => !m.medicationName || !m.dosage || !m.frequency || !m.duration)) {
            toast.error("Veuillez remplir tous les champs obligatoires")
            return
        }

        try {
            await api.post("/prescriptions", {
                patientId: Number(patientId),
                diagnosis,
                notes,
                medications: medications.filter(m => m.medicationName)
            })

            toast.success("Ordonnance créée avec succès")
            setShowCreateModal(false)
            resetForm()
            fetchPrescriptions()
        } catch (error) {
            console.error("Error creating prescription:", error)
            toast.error("Erreur lors de la création de l'ordonnance")
        }
    }

    const handleDeletePrescription = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette ordonnance ?")) return

        try {
            await api.delete(`/prescriptions/${id}`)
            toast.success("Ordonnance supprimée")
            fetchPrescriptions()
        } catch (error) {
            console.error("Error deleting prescription:", error)
            toast.error("Erreur lors de la suppression")
        }
    }

    const resetForm = () => {
        setPatientId("")
        setDiagnosis("")
        setNotes("")
        setMedications([{ medicationName: "", dosage: "", frequency: "", duration: "", instructions: "" }])
    }

    const filteredPrescriptions = prescriptions.filter(p =>
        p.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Ordonnances
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Gérez les ordonnances de vos patients
                        </p>
                    </div>
                    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                                <Plus className="h-5 w-5 mr-2" />
                                Nouvelle ordonnance
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                            <DialogHeader className="p-6 pb-4 border-b bg-gray-50 sticky top-0 z-10">
                                <DialogTitle className="flex items-center gap-3 text-2xl">
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        <FileStack className="h-6 w-6" />
                                    </div>
                                    <span>Créer une ordonnance</span>
                                </DialogTitle>
                                <DialogDescription className="ml-14">
                                    Remplissez les informations de l&apos;ordonnance et ajoutez les médicaments
                                </DialogDescription>
                            </DialogHeader>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="patientId" className="text-sm font-semibold text-gray-700">ID Patient *</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="patientId"
                                                type="number"
                                                value={patientId}
                                                onChange={(e) => setPatientId(e.target.value)}
                                                placeholder="Ex: 1"
                                                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="diagnosis" className="text-sm font-semibold text-gray-700">Diagnostic *</Label>
                                        <div className="relative">
                                            <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="diagnosis"
                                                value={diagnosis}
                                                onChange={(e) => setDiagnosis(e.target.value)}
                                                placeholder="Ex: Infection respiratoire"
                                                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Notes additionnelles..."
                                        rows={3}
                                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <Label className="text-lg font-bold text-gray-800 flex items-center">
                                            <Pill className="h-5 w-5 mr-2 text-blue-500" />
                                            Médicaments *
                                        </Label>
                                        <Button type="button" variant="outline" size="sm" onClick={handleAddMedication} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Ajouter un médicament
                                        </Button>
                                    </div>

                                    {medications.map((med, index) => (
                                        <Card key={index} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
                                            <CardContent className="p-4 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-gray-700 flex items-center">
                                                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">{index + 1}</span>
                                                        Médicament
                                                    </h4>
                                                    {medications.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveMedication(index)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500 uppercase font-semibold">Nom *</Label>
                                                        <Input
                                                            value={med.medicationName}
                                                            onChange={(e) => handleMedicationChange(index, "medicationName", e.target.value)}
                                                            placeholder="Ex: Amoxicilline"
                                                            className="bg-gray-50 border-gray-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500 uppercase font-semibold">Dosage *</Label>
                                                        <Input
                                                            value={med.dosage}
                                                            onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                                                            placeholder="Ex: 500mg"
                                                            className="bg-gray-50 border-gray-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500 uppercase font-semibold">Fréquence *</Label>
                                                        <Input
                                                            value={med.frequency}
                                                            onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                                                            placeholder="Ex: 3x/jour"
                                                            className="bg-gray-50 border-gray-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500 uppercase font-semibold">Durée *</Label>
                                                        <Input
                                                            value={med.duration}
                                                            onChange={(e) => handleMedicationChange(index, "duration", e.target.value)}
                                                            placeholder="Ex: 7 jours"
                                                            className="bg-gray-50 border-gray-200"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-500 uppercase font-semibold">Instructions</Label>
                                                    <Input
                                                        value={med.instructions || ""}
                                                        onChange={(e) => handleMedicationChange(index, "instructions", e.target.value)}
                                                        placeholder="Instructions spécifiques (ex: à prendre pendant le repas)..."
                                                        className="bg-gray-50 border-gray-200"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <Button variant="outline" onClick={() => setShowCreateModal(false)} className="border-gray-300">
                                        Annuler
                                    </Button>
                                    <Button onClick={handleCreatePrescription} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                                        Créer l&apos;ordonnance
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <Card className="shadow-md border-none">
                    <CardContent className="p-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher par patient ou diagnostic..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-50 border-gray-200"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Prescriptions List */}
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Chargement des ordonnances...</p>
                            </CardContent>
                        </Card>
                    ) : filteredPrescriptions.length === 0 ? (
                        <Card className="border-dashed border-2 border-gray-200 bg-transparent shadow-none">
                            <CardContent className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Aucune ordonnance trouvée</h3>
                                <p className="text-gray-500 mt-1">Commencez par créer une nouvelle ordonnance.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredPrescriptions.map((prescription) => (
                            <Card key={prescription.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                                    <User className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-xl text-gray-900">
                                                        {prescription.patient.firstName} {prescription.patient.lastName}
                                                    </h3>
                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                                        {new Date(prescription.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Diagnostic</span>
                                                    <p className="text-gray-900 font-medium mt-1 flex items-center">
                                                        <Stethoscope className="h-4 w-4 mr-2 text-indigo-500" />
                                                        {prescription.diagnosis}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Médicaments</span>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {prescription.medications.slice(0, 3).map((med, idx) => (
                                                            <Badge key={idx} variant="outline" className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50">
                                                                {med.medicationName}
                                                            </Badge>
                                                        ))}
                                                        {prescription.medications.length > 3 && (
                                                            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                                                                +{prescription.medications.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedPrescription(prescription)
                                                    setShowViewModal(true)
                                                }}
                                                className="flex-1 md:flex-none border-blue-200 text-blue-700 hover:bg-blue-50"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Détails
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeletePrescription(prescription.id)}
                                                className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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

                {/* View Prescription Modal */}
                <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                        <DialogHeader className="p-6 pb-4 border-b bg-gray-50 sticky top-0 z-10">
                            <DialogTitle className="flex items-center gap-3 text-2xl">
                                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <span>Détails de l&apos;ordonnance</span>
                            </DialogTitle>
                        </DialogHeader>

                        {selectedPrescription && (
                            <div className="p-6 space-y-8">
                                <div className="flex flex-col md:flex-row justify-between gap-6 bg-blue-50 p-6 rounded-xl border border-blue-100">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-blue-500 uppercase tracking-wider">Patient</Label>
                                        <p className="text-xl font-bold text-gray-900">
                                            {selectedPrescription.patient.firstName} {selectedPrescription.patient.lastName}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-blue-500 uppercase tracking-wider">Date de création</Label>
                                        <p className="text-lg font-medium text-gray-900 flex items-center">
                                            <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                                            {new Date(selectedPrescription.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                                            <Stethoscope className="h-5 w-5 mr-2 text-indigo-500" />
                                            Diagnostic
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800">
                                            {selectedPrescription.diagnosis}
                                        </div>
                                    </div>

                                    {selectedPrescription.notes && (
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                                                <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                                                Notes
                                            </h3>
                                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-gray-800 italic">
                                                {selectedPrescription.notes}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <Pill className="h-5 w-5 mr-2 text-green-500" />
                                        Médicaments prescrits
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedPrescription.medications.map((med, idx) => (
                                            <Card key={idx} className="border-l-4 border-l-green-500 shadow-sm">
                                                <CardContent className="p-4">
                                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                                        <div>
                                                            <h4 className="font-bold text-lg text-gray-900 mb-2">{med.medicationName}</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                                    {med.dosage}
                                                                </Badge>
                                                                <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                                                                    {med.frequency}
                                                                </Badge>
                                                                <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100">
                                                                    {med.duration}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        {med.instructions && (
                                                            <div className="bg-gray-50 p-3 rounded-md border border-gray-100 text-sm text-gray-600 md:max-w-xs">
                                                                <span className="font-semibold text-gray-900 block mb-1">Instructions:</span>
                                                                {med.instructions}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
