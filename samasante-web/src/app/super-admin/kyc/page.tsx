"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, Check, X, Clock, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Doctor {
  id: number
  firstName: string
  lastName: string
  email: string
  specialty: string
  status: string
  createdAt: string
}

export default function KYCManagement() {
  const [requests, setRequests] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    try {
      const res = await api.get("/doctors")
      // Filter for pending doctors
      const pending = res.data.filter((d: Doctor) => d.status === 'pending')
      setRequests(pending)
    } catch (error) {
      console.error("Error fetching KYC requests:", error)
      toast.error("Erreur lors du chargement des demandes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/doctors/${id}/verify`, {
        ordreNumber: "VERIFIED-" + Date.now(),
        kycScore: 100
      })
      toast.success("Médecin approuvé")
      fetchRequests()
    } catch (error) {
      toast.error("Erreur lors de l'approbation")
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion KYC</h1>
          <p className="text-muted-foreground">Vérification et validation des comptes utilisateurs</p>
        </div>
        <Button onClick={fetchRequests}>Actualiser</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{requests.length}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demandes de vérification ({requests.length})</CardTitle>
          <CardDescription>Liste des comptes en attente de validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {request.firstName[0]}{request.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{request.firstName} {request.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                      <p className="text-xs text-muted-foreground">Spécialité: {request.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleApprove(request.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune demande en attente
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

