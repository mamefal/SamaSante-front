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
import { FlaskConical, Plus, Search, Eye, Trash2, Calendar, User, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

type LabTest = {
    testName: string
    testCode?: string
    category: string
}

type LabOrder = {
    id: number
    urgency: string
    status: string
    results?: string
    resultDate?: string
    createdAt: string
    patient: {
        id: number
        firstName: string
        lastName: string
    }
    tests: LabTest[]
}

// Common lab tests library
const COMMON_TESTS = [
    { name: "Numération Formule Sanguine (NFS)", code: "NFS", category: "hematology" },
    { name: "Glycémie à jeun", code: "GLY", category: "biochemistry" },
    { name: "Créatinine", code: "CREAT", category: "biochemistry" },
    { name: "Transaminases (ASAT/ALAT)", code: "TRANS", category: "biochemistry" },
    { name: "Bilan lipidique", code: "LIPID", category: "biochemistry" },
    { name: "TSH", code: "TSH", category: "endocrinology" },
    { name: "CRP (Protéine C-Réactive)", code: "CRP", category: "inflammation" },
    { name: "Vitesse de Sédimentation", code: "VS", category: "inflammation" },
    { name: "Ionogramme sanguin", code: "IONO", category: "biochemistry" },
    { name: "Urée sanguine", code: "UREA", category: "biochemistry" },
]

export default function LabOrdersPage() {
    const [labOrders, setLabOrders] = useState<LabOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedLabOrder, setSelectedLabOrder] = useState<LabOrder | null>(null)
    const [showViewModal, setShowViewModal] = useState(false)

    // Create lab order form state
    const [patientId, setPatientId] = useState("")
    const [urgency, setUrgency] = useState("normal")
    const [selectedTests, setSelectedTests] = useState<LabTest[]>([])

    useEffect(() => {
        fetchLabOrders()
    }, [])

    const fetchLabOrders = async () => {
        try {
            const response = await api.get("/lab-orders")
            setLabOrders(response.data)
        } catch (error) {
            console.error("Error fetching lab orders:", error)
            toast.error("Erreur lors du chargement des analyses")
        } finally {
            setLoading(false)
        }
    }

    const handleToggleTest = (test: typeof COMMON_TESTS[0]) => {
        const exists = selectedTests.find(t => t.testCode === test.code)
        if (exists) {
            setSelectedTests(selectedTests.filter(t => t.testCode !== test.code))
        } else {
            setSelectedTests([...selectedTests, {
                testName: test.name,
                testCode: test.code,
                category: test.category
            }])
        }
    }

    const handleCreateLabOrder = async () => {
        if (!patientId || selectedTests.length === 0) {
            toast.error("Veuillez sélectionner un patient et au moins un test")
            return
        }

        try {
            await api.post("/lab-orders", {
                patientId: Number(patientId),
                urgency,
                tests: selectedTests
            })

            toast.success("Demande d'analyse créée avec succès")
            setShowCreateModal(false)
            resetForm()
            fetchLabOrders()
        } catch (error) {
            console.error("Error creating lab order:", error)
            toast.error("Erreur lors de la création de la demande")
        }
    }

    const handleDeleteLabOrder = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette demande d'analyse ?")) return

        try {
            await api.delete(`/lab-orders/${id}`)
            toast.success("Demande d'analyse supprimée")
            fetchLabOrders()
        } catch (error) {
            console.error("Error deleting lab order:", error)
            toast.error("Erreur lors de la suppression")
        }
    }

    const resetForm = () => {
        setPatientId("")
        setUrgency("normal")
        setSelectedTests([])
    }

    const getStatusBadge = (status: string) => {
        const config = {
            pending: { label: "En attente", icon: Clock, className: "bg-yellow-100 text-yellow-800" },
            completed: { label: "Terminé", icon: CheckCircle, className: "bg-green-100 text-green-800" },
            cancelled: { label: "Annulé", icon: AlertCircle, className: "bg-red-100 text-red-800" },
        }
        const item = config[status as keyof typeof config] || config.pending

        const Icon = item.icon
        return (
            <Badge className={item.className}>
                <Icon className="h-3 w-3 mr-1" />
                {item.label}
            </Badge>
        )
    }

    const getUrgencyBadge = (urgency: string) => {
        const config = {
            normal: { label: "Normal", className: "bg-blue-100 text-blue-800" },
            urgent: { label: "Urgent", className: "bg-orange-100 text-orange-800" },
            stat: { label: "STAT", className: "bg-red-100 text-red-800" },
        }
        const item = config[urgency as keyof typeof config] || config.normal

        return <Badge variant="outline" className={item.className}>{item.label}</Badge>
    }

    const filteredLabOrders = labOrders.filter(order => {
        const matchesSearch =
            order.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.tests.some(t => t.testName.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = statusFilter === "all" || order.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Analyses médicales</h1>
                    <p className="text-muted-foreground">Gérez les demandes d'analyses de laboratoire</p>
                </div>
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle demande
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Créer une demande d'analyse</DialogTitle>
                            <DialogDescription>
                                Sélectionnez les tests à effectuer pour le patient
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
                                            <SelectItem value="stat">STAT (Immédiat)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Tests à effectuer * ({selectedTests.length} sélectionnés)</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto p-4 border rounded-lg">
                                    {COMMON_TESTS.map((test) => {
                                        const isSelected = selectedTests.some(t => t.testCode === test.code)
                                        return (
                                            <div
                                                key={test.code}
                                                onClick={() => handleToggleTest(test)}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${isSelected
                                                    ? "bg-blue-50 border-blue-500"
                                                    : "hover:bg-muted/50"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{test.name}</p>
                                                        <p className="text-xs text-muted-foreground">{test.code}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <CheckCircle className="h-5 w-5 text-blue-600" />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={handleCreateLabOrder}>
                                    Créer la demande
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par patient ou test..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Lab Orders List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">Chargement...</p>
                        </CardContent>
                    </Card>
                ) : filteredLabOrders.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-muted-foreground">Aucune demande d'analyse trouvée</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredLabOrders.map((order) => (
                        <Card key={order.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {order.patient.firstName} {order.patient.lastName}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3 inline mr-1" />
                                                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                {getStatusBadge(order.status)}
                                                {getUrgencyBadge(order.urgency)}
                                            </div>

                                            <div>
                                                <span className="text-sm font-medium text-muted-foreground">Tests demandés:</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {order.tests.map((test, idx) => (
                                                        <Badge key={idx} variant="outline" className="bg-cyan-50">
                                                            <FlaskConical className="h-3 w-3 mr-1" />
                                                            {test.testName}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {order.results && (
                                                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <p className="text-sm font-medium text-green-800">Résultats disponibles</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedLabOrder(order)
                                                setShowViewModal(true)
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Voir
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteLabOrder(order.id)}
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

            {/* View Lab Order Modal */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Détails de la demande d'analyse</DialogTitle>
                    </DialogHeader>

                    {selectedLabOrder && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Patient</Label>
                                    <p className="text-sm font-medium">
                                        {selectedLabOrder.patient.firstName} {selectedLabOrder.patient.lastName}
                                    </p>
                                </div>
                                <div>
                                    <Label>Date de demande</Label>
                                    <p className="text-sm">
                                        {new Date(selectedLabOrder.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Label>Statut:</Label>
                                {getStatusBadge(selectedLabOrder.status)}
                                <Label>Urgence:</Label>
                                {getUrgencyBadge(selectedLabOrder.urgency)}
                            </div>

                            <div>
                                <Label>Tests demandés</Label>
                                <div className="space-y-2 mt-2">
                                    {selectedLabOrder.tests.map((test, idx) => (
                                        <Card key={idx} className="p-3 bg-muted/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{test.testName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Code: {test.testCode} | Catégorie: {test.category}
                                                    </p>
                                                </div>
                                                <FlaskConical className="h-5 w-5 text-cyan-600" />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {selectedLabOrder.results && (
                                <div>
                                    <Label>Résultats</Label>
                                    <Card className="p-4 bg-green-50 mt-2">
                                        <p className="text-sm whitespace-pre-wrap">{selectedLabOrder.results}</p>
                                        {selectedLabOrder.resultDate && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Date des résultats: {new Date(selectedLabOrder.resultDate).toLocaleDateString('fr-FR')}
                                            </p>
                                        )}
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
