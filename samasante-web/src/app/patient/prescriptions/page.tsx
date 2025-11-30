"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { generatePrescriptionPDF } from "@/lib/pdf-generator"

type Prescription = {
    id: number
    diagnosis: string
    notes?: string
    createdAt: string
    validUntil?: string
    doctor: {
        firstName: string
        lastName: string
        specialty?: string
    }
    patient: {
        firstName: string
        lastName: string
    }
    medications: Medication[]
}

// ... existing code ...

const handleDownload = (prescription: Prescription) => {
    toast.success("Téléchargement de l'ordonnance lancé")
    generatePrescriptionPDF({
        id: prescription.id,
        doctorName: `${prescription.doctor.firstName} ${prescription.doctor.lastName}`,
        patientName: `${prescription.patient.firstName} ${prescription.patient.lastName}`,
        date: prescription.createdAt,
        medications: prescription.medications.map(m => ({
            name: m.medicationName,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration
        })),
        notes: prescription.notes
    })
}

return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Mes Ordonnances
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Consultez et téléchargez vos ordonnances médicales
                    </p>
                </div>
            </div>

            {/* Search */}
            <Card className="shadow-md border-none">
                <CardContent className="p-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher par médecin, diagnostic ou médicament..."
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
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Chargement de vos ordonnances...</p>
                        </CardContent>
                    </Card>
                ) : filteredPrescriptions.length === 0 ? (
                    <Card className="border-dashed border-2 border-gray-200 bg-transparent shadow-none">
                        <CardContent className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Aucune ordonnance trouvée</h3>
                            <p className="text-gray-500 mt-1">Vous n'avez pas encore d'ordonnances enregistrées.</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredPrescriptions.map((prescription) => (
                        <Card key={prescription.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                                <FileText className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-900">
                                                    Ordonnance du {new Date(prescription.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <User className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                                                    Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                                                    {prescription.doctor.specialty && <span className="ml-1 text-gray-400">• {prescription.doctor.specialty}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <div>
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Diagnostic</span>
                                                <p className="text-gray-900 font-medium mt-1 flex items-center">
                                                    <Stethoscope className="h-4 w-4 mr-2 text-teal-500" />
                                                    {prescription.diagnosis}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Médicaments</span>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {prescription.medications.slice(0, 3).map((med, idx) => (
                                                        <Badge key={idx} variant="outline" className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50">
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
                                            className="flex-1 md:flex-none border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Détails
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownload(prescription.id)}
                                            className="flex-1 md:flex-none border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Télécharger
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
                            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <span>Détails de l'ordonnance</span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedPrescription && (
                        <div className="p-6 space-y-8">
                            <div className="flex flex-col md:flex-row justify-between gap-6 bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Médecin Prescripteur</Label>
                                    <p className="text-xl font-bold text-gray-900">
                                        Dr. {selectedPrescription.doctor.firstName} {selectedPrescription.doctor.lastName}
                                    </p>
                                    {selectedPrescription.doctor.specialty && (
                                        <p className="text-sm text-gray-500">{selectedPrescription.doctor.specialty}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Date</Label>
                                    <p className="text-lg font-medium text-gray-900 flex items-center">
                                        <Calendar className="h-5 w-5 mr-2 text-emerald-400" />
                                        {new Date(selectedPrescription.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                                        <Stethoscope className="h-5 w-5 mr-2 text-teal-500" />
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
                                            Notes du médecin
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

                            <div className="flex justify-end pt-4 border-t">
                                <Button
                                    onClick={() => handleDownload(selectedPrescription.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger le PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    </div>
)
}
