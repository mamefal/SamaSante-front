"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, UserCheck, UserX, Star, MapPin, Loader2, Stethoscope, Building2, CheckCircle, AlertCircle, ArrowUpDown } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Doctor {
  id: number
  firstName: string
  lastName: string
  email: string
  specialty: string
  city: string
  region: string
  status: string
  organization?: {
    name: string
  }
}

export default function DoctorsManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors")
      setDoctors(res.data)
    } catch (error) {
      console.error("Error fetching doctors:", error)
      toast.error("Erreur lors du chargement des médecins")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleVerify = async (id: number) => {
    try {
      await api.post(`/doctors/${id}/verify`, {
        ordreNumber: "VERIFIED-" + Date.now(),
        kycScore: 100
      })
      toast.success("Médecin vérifié avec succès")
      fetchDoctors()
    } catch (error) {
      toast.error("Erreur lors de la vérification")
    }
  }

  const filteredDoctors = doctors.filter(d =>
    d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200"><UserCheck className="w-3 h-3 mr-1" /> Vérifié</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"><UserX className="w-3 h-3 mr-1" /> En attente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Gestion des médecins
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Supervision et validation des profils médicaux
          </p>
        </div>
        <Button onClick={fetchDoctors} variant="outline" className="shadow-sm">
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Médecins</CardTitle>
            <Stethoscope className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{doctors.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Inscrits sur la plateforme</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vérifiés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {doctors.filter(d => d.status === 'verified').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Profils validés</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {doctors.filter(d => d.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Nécessitent une action</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg border-none">
        <CardHeader className="border-b bg-white/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, spécialité..."
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
              <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Trier
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-xl shadow-sm">
                        {doctor.firstName[0]}{doctor.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</h3>
                        <p className="text-sm text-gray-500">{doctor.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {doctor.specialty}
                          </Badge>
                          {doctor.organization && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {doctor.organization.name}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400 flex items-center px-2 py-0.5 bg-gray-100 rounded-full">
                            <MapPin className="h-3 w-3 mr-1" />
                            {doctor.city}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(doctor.status)}
                      </div>
                      <div className="flex gap-2">
                        {doctor.status !== 'verified' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            onClick={() => handleVerify(doctor.id)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Vérifier
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-semibold mb-2">Aucun médecin trouvé</h3>
                <p className="text-muted-foreground">
                  Aucun médecin ne correspond à vos critères de recherche.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

