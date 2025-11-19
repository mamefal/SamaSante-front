import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, Calendar, Phone, Mail, MapPin } from "lucide-react"

export default async function DoctorPatients() {
  const supabase = await createClient()

  // Mock patients data
  const patients = [
    {
      id: "1",
      name: "Fatou Ndiaye",
      email: "fatou.ndiaye@email.com",
      phone: "+221 77 123 45 67",
      age: 28,
      gender: "female",
      city: "Dakar",
      lastVisit: "2025-01-08T09:00:00Z",
      nextAppointment: "2025-01-10T09:00:00Z",
      totalVisits: 5,
      status: "active",
      conditions: ["Hypertension"],
    },
    {
      id: "2",
      name: "Moussa Ba",
      email: "moussa.ba@email.com",
      phone: "+221 76 234 56 78",
      age: 45,
      gender: "male",
      city: "Thiès",
      lastVisit: "2025-01-05T14:30:00Z",
      nextAppointment: "2025-01-10T10:30:00Z",
      totalVisits: 12,
      status: "active",
      conditions: ["Diabète", "Cholestérol"],
    },
    {
      id: "3",
      name: "Awa Sarr",
      email: "awa.sarr@email.com",
      phone: "+221 78 345 67 89",
      age: 32,
      gender: "female",
      city: "Saint-Louis",
      lastVisit: "2024-12-20T16:00:00Z",
      nextAppointment: "2025-01-10T14:00:00Z",
      totalVisits: 3,
      status: "active",
      conditions: [],
    },
    {
      id: "4",
      name: "Omar Diop",
      email: "omar.diop@email.com",
      phone: "+221 77 456 78 90",
      age: 52,
      gender: "male",
      city: "Kaolack",
      lastVisit: "2024-11-15T10:00:00Z",
      nextAppointment: null,
      totalVisits: 8,
      status: "inactive",
      conditions: ["Arthrite"],
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Actif
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inactif
          </Badge>
        )
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const getGenderIcon = (gender: string) => {
    return gender === "female" ? "♀" : "♂"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes patients</h1>
          <p className="text-muted-foreground">Gérez vos patients et leur suivi médical</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">47</span>
              </div>
              <div>
                <p className="text-sm font-medium">Total patients</p>
                <p className="text-xs text-muted-foreground">Tous les patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">Patients actifs</p>
                <p className="text-xs text-muted-foreground">Suivi régulier</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">RDV cette semaine</p>
                <p className="text-xs text-muted-foreground">Consultations prévues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Suivi requis</p>
                <p className="text-xs text-muted-foreground">Patients inactifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par nom, email ou téléphone..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                <SelectItem value="dakar">Dakar</SelectItem>
                <SelectItem value="thies">Thiès</SelectItem>
                <SelectItem value="saint-louis">Saint-Louis</SelectItem>
                <SelectItem value="kaolack">Kaolack</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des patients</CardTitle>
          <CardDescription>Tous vos patients et leur informations de suivi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.map((patient) => (
              <Card key={patient.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg">{getGenderIcon(patient.gender)}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{patient.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {patient.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {patient.phone}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {patient.city}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">{patient.age} ans</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{patient.totalVisits} consultations</span>
                        {patient.conditions.length > 0 && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <div className="flex space-x-1">
                              {patient.conditions.map((condition) => (
                                <Badge key={condition} variant="outline" className="text-xs">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">{getStatusBadge(patient.status)}</div>
                      <p className="text-xs text-muted-foreground">Dernière visite: {formatDate(patient.lastVisit)}</p>
                      {patient.nextAppointment && (
                        <p className="text-xs text-muted-foreground">
                          Prochain RDV: {formatDate(patient.nextAppointment)}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Eye className="h-4 w-4 mr-1" />
                        Dossier
                      </Button>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Calendar className="h-4 w-4 mr-1" />
                        RDV
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
