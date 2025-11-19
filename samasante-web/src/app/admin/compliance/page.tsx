"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { FileText, Shield, AlertTriangle, CheckCircle, Clock, X } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface DocumentVerification {
  id: string
  document_type: string
  status: string
  created_at: string
  expiry_date: string
  verification_notes: string
  user: {
    first_name: string
    last_name: string
    user_type: string
  }
}

interface AuditLog {
  id: string
  action: string
  resource_type: string
  created_at: string
  user: {
    first_name: string
    last_name: string
    user_type: string
  }
}

export default function CompliancePage() {
  const [documents, setDocuments] = useState<DocumentVerification[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<DocumentVerification | null>(null)
  const [verificationStatus, setVerificationStatus] = useState("")
  const [verificationNotes, setVerificationNotes] = useState("")

  useEffect(() => {
    fetchDocuments()
    fetchAuditLogs()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/verification/documents")
      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      console.error("Error fetching documents:", error)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch("/api/compliance/audit-logs?limit=100")
      const data = await response.json()
      setAuditLogs(data)
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDocument = async () => {
    if (!selectedDocument || !verificationStatus) return

    try {
      const response = await fetch(`/api/verification/documents/${selectedDocument.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: verificationStatus,
          verification_notes: verificationNotes,
          verified_by: "current-admin-id", // Should be actual admin ID
        }),
      })

      if (response.ok) {
        fetchDocuments()
        setSelectedDocument(null)
        setVerificationStatus("")
        setVerificationNotes("")
      }
    } catch (error) {
      console.error("Error verifying document:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <X className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "medical_license":
        return "Licence médicale"
      case "diploma":
        return "Diplôme"
      case "identity_card":
        return "Carte d'identité"
      case "specialization_certificate":
        return "Certificat de spécialisation"
      default:
        return type
    }
  }

  const pendingDocuments = documents.filter((doc) => doc.status === "pending")
  const verifiedDocuments = documents.filter((doc) => doc.status !== "pending")

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conformité et Vérification</h1>
          <p className="text-gray-600">Gestion des documents et audit de conformité</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-yellow-50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {pendingDocuments.length} en attente
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-sm text-gray-600">Documents totaux</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingDocuments.length}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{documents.filter((d) => d.status === "approved").length}</p>
                <p className="text-sm text-gray-600">Approuvés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-cyan-600" />
              <div>
                <p className="text-2xl font-bold">{auditLogs.length}</p>
                <p className="text-sm text-gray-600">Actions auditées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents à vérifier</TabsTrigger>
          <TabsTrigger value="audit">Journal d'audit</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Pending Documents */}
          {pendingDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-yellow-700">Documents en attente de vérification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDocuments.map((doc) => (
                    <div key={doc.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-yellow-600 mt-1" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{getDocumentTypeLabel(doc.document_type)}</h3>
                            <p className="text-sm text-gray-600">
                              {doc.user.first_name} {doc.user.last_name} ({doc.user.user_type})
                            </p>
                            <p className="text-xs text-gray-500">
                              Soumis le {format(new Date(doc.created_at), "dd MMMM yyyy", { locale: fr })}
                            </p>
                            {doc.expiry_date && (
                              <p className="text-xs text-gray-500">
                                Expire le {format(new Date(doc.expiry_date), "dd MMMM yyyy", { locale: fr })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(doc.status)}>
                            {getStatusIcon(doc.status)}
                            <span className="ml-1">En attente</span>
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedDocument(doc)
                                  setVerificationNotes(doc.verification_notes || "")
                                }}
                              >
                                Vérifier
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Vérifier le document</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Type de document</Label>
                                  <p className="text-sm text-gray-600">
                                    {getDocumentTypeLabel(selectedDocument?.document_type || "")}
                                  </p>
                                </div>
                                <div>
                                  <Label>Utilisateur</Label>
                                  <p className="text-sm text-gray-600">
                                    {selectedDocument?.user.first_name} {selectedDocument?.user.last_name}
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor="status">Statut de vérification</Label>
                                  <Select value={verificationStatus} onValueChange={setVerificationStatus}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choisir un statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="approved">Approuvé</SelectItem>
                                      <SelectItem value="rejected">Rejeté</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="notes">Notes de vérification</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Ajouter des notes sur la vérification..."
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={handleVerifyDocument}
                                    disabled={!verificationStatus}
                                    className="flex-1"
                                  >
                                    Confirmer la vérification
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verified Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents vérifiés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verifiedDocuments.slice(0, 10).map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="font-medium text-sm">{getDocumentTypeLabel(doc.document_type)}</p>
                          <p className="text-xs text-gray-500">
                            {doc.user.first_name} {doc.user.last_name}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {getStatusIcon(doc.status)}
                        <span className="ml-1">{doc.status === "approved" ? "Approuvé" : "Rejeté"}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'audit</CardTitle>
              <p className="text-sm text-gray-600">Historique des actions importantes sur la plateforme</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.slice(0, 20).map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-4 w-4 text-cyan-600" />
                        <div>
                          <p className="font-medium text-sm">{log.action.replace("_", " ")}</p>
                          <p className="text-xs text-gray-500">
                            {log.user?.first_name} {log.user?.last_name} - {log.resource_type}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports de conformité</CardTitle>
              <p className="text-sm text-gray-600">Générer des rapports pour les autorités de santé</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <FileText className="h-6 w-6 mb-2" />
                  Rapport KYC mensuel
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <Shield className="h-6 w-6 mb-2" />
                  Audit de sécurité
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <CheckCircle className="h-6 w-6 mb-2" />
                  Conformité médicale
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  Incidents de sécurité
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
