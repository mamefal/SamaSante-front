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
import {
    FileText,
    Search,
    Eye,
    Download,
    Calendar,
    Upload,
    File,
    FileImage,
    FileBarChart,
    Trash2,
    Plus
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

type DocumentType = "LAB_RESULT" | "IMAGING" | "CERTIFICATE" | "PRESCRIPTION" | "OTHER"

type MedicalDocument = {
    id: number
    title: string
    type: DocumentType
    category: string
    date: string
    size: string
    doctorName?: string
    url: string
}

// Mock data
const MOCK_DOCUMENTS: MedicalDocument[] = [
    {
        id: 1,
        title: "Analyse Sanguine Complète",
        type: "LAB_RESULT",
        category: "Biologie",
        date: "2024-05-10T08:00:00Z",
        size: "1.2 MB",
        doctorName: "Dr. Dupont",
        url: "/docs/blood-test.pdf"
    },
    {
        id: 2,
        title: "Radiographie Thorax",
        type: "IMAGING",
        category: "Radiologie",
        date: "2024-04-15T14:30:00Z",
        size: "4.5 MB",
        doctorName: "Dr. Martin",
        url: "/docs/xray.jpg"
    },
    {
        id: 3,
        title: "Certificat d'aptitude sportive",
        type: "CERTIFICATE",
        category: "Administratif",
        date: "2024-01-20T10:00:00Z",
        size: "0.5 MB",
        doctorName: "Dr. Dupont",
        url: "/docs/certif.pdf"
    }
]

export default function PatientDocumentsPage() {
    const [documents, setDocuments] = useState<MedicalDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploadFile, setUploadFile] = useState<File | null>(null)
    const [uploadTitle, setUploadTitle] = useState("")
    const [uploadCategory, setUploadCategory] = useState("OTHER")

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setDocuments(MOCK_DOCUMENTS)
            setLoading(false)
        }, 800)
    }, [])

    const getDocumentIcon = (type: DocumentType) => {
        switch (type) {
            case "LAB_RESULT":
                return <FileBarChart className="h-6 w-6 text-blue-500" />
            case "IMAGING":
                return <FileImage className="h-6 w-6 text-purple-500" />
            case "CERTIFICATE":
                return <FileText className="h-6 w-6 text-emerald-500" />
            default:
                return <File className="h-6 w-6 text-gray-500" />
        }
    }

    const getCategoryBadge = (type: DocumentType) => {
        switch (type) {
            case "LAB_RESULT":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Biologie</Badge>
            case "IMAGING":
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">Imagerie</Badge>
            case "CERTIFICATE":
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">Certificat</Badge>
            default:
                return <Badge variant="secondary">Autre</Badge>
        }
    }

    const handleUpload = () => {
        if (!uploadFile || !uploadTitle) {
            toast.error("Veuillez sélectionner un fichier et donner un titre")
            return
        }

        toast.success("Document téléchargé avec succès")
        setShowUploadModal(false)
        setUploadFile(null)
        setUploadTitle("")

        // Add to mock list
        const newDoc: MedicalDocument = {
            id: Date.now(),
            title: uploadTitle,
            type: "OTHER",
            category: "Personnel",
            date: new Date().toISOString(),
            size: `${(uploadFile.size / 1024 / 1024).toFixed(1)} MB`,
            url: "#"
        }
        setDocuments([newDoc, ...documents])
    }

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.doctorName && doc.doctorName.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Mes Documents
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Gérez vos résultats d'examens et documents médicaux
                        </p>
                    </div>
                    <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all">
                                <Upload className="h-5 w-5 mr-2" />
                                Ajouter un document
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter un document</DialogTitle>
                                <DialogDescription>
                                    Téléchargez un nouveau document dans votre dossier médical
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Titre du document</Label>
                                    <Input
                                        id="title"
                                        placeholder="Ex: Résultats prise de sang..."
                                        value={uploadTitle}
                                        onChange={(e) => setUploadTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="file">Fichier</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleUpload} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Télécharger
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
                                placeholder="Rechercher un document..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-50 border-gray-200"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="col-span-full">
                            <Card className="border-dashed border-2 border-gray-200 bg-transparent shadow-none">
                                <CardContent className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <File className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Aucun document trouvé</h3>
                                    <p className="text-gray-500 mt-1">Vos documents médicaux apparaîtront ici.</p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        filteredDocuments.map((doc) => (
                            <Card key={doc.id} className="group hover:shadow-lg transition-all duration-300 border-t-4 border-t-emerald-500">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-emerald-50 transition-colors">
                                            {getDocumentIcon(doc.type)}
                                        </div>
                                        {getCategoryBadge(doc.type)}
                                    </div>

                                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1" title={doc.title}>
                                        {doc.title}
                                    </h3>

                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
                                            {new Date(doc.date).toLocaleDateString('fr-FR')}
                                        </div>
                                        {doc.doctorName && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span className="font-medium text-gray-700 mr-1">Par:</span>
                                                {doc.doctorName}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 pt-2">
                                            Taille: {doc.size}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                                        <Button variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Voir
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-emerald-600">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
