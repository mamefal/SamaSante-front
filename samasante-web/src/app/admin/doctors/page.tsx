import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, UserCheck, UserX, Star, MapPin } from "lucide-react"

export default async function DoctorsManagement() {
  const supabase = await createClient()

  // Mock data for doctors
  const doctors = [
    {
      id: "1",
      name: "Dr. Aminata Diallo",
      email: "aminata.diallo@email.com",
      specialty: "Pédiatrie",
      licenseNumber: "SN-MED-2024-001",
      yearsOfExperience: 8,
      city: "Dakar",
      region: "Dakar",
      isVerified: true,
      isActive: true,
      consultationFee: 25000,
      rating: 4.8,
      totalAppointments: 156,
      joinedAt: "2024-12-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Dr. Ibrahima Seck",
      email: "ibrahima.seck@email.com",
      specialty: "Cardiologie",
      licenseNumber: "SN-MED-2024-002",
      yearsOfExperience: 12,
      city: "Thiès",
      region: "Thiès",
      isVerified: false,
      isActive: true,
      consultationFee: 35000,
      rating: 0,
      totalAppointments: 0,
      joinedAt: "2025-01-08T14:15:00Z",
    },
    {
      id: "3",
      name: "Dr. Khadija Ba",
      email: "khadija.ba@email.com",
      specialty: "Gynécologie",
      licenseNumber: "SN-MED-2024-003",
      yearsOfExperience: 15,
      city: "Saint-Louis",
      region: "Saint-Louis",
      isVerified: true,
      isActive: false,
      consultationFee: 30000,
      rating: 4.9,
      totalAppointments: 203,
      joinedAt: "2024-11-20T09:45:00Z",
    },
  ]

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 mr-1" />
        Vérifié
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
        <UserX className="h-3 w-3 mr-1" />
        Non vérifié
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        Actif
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Inactif
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des médecins</h1>
          <p className="text-muted-foreground">Supervision et validation des profils médicaux</p>
        </div>
        <Button>
          <UserCheck className="h-4 w-4 mr-2" />
          Inviter un médecin
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Médecins vérifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-muted-foreground">Note moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Régions couvertes</p>
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
              <Input placeholder="Rechercher par nom, spécialité ou ville..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Spécialité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes spécialités</SelectItem>
                <SelectItem value="pediatrie">Pédiatrie</SelectItem>
                <SelectItem value="cardiologie">Cardiologie</SelectItem>
                <SelectItem value="gynecologie">Gynécologie</SelectItem>
                <SelectItem value="dermatologie">Dermatologie</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="verified">Vérifiés</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des médecins</CardTitle>
          <CardDescription>Gestion des profils médicaux de la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {doctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{doctor.specialty}</Badge>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{doctor.yearsOfExperience} ans d'exp.</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {doctor.city}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {getVerificationBadge(doctor.isVerified)}
                        {getStatusBadge(doctor.isActive)}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {doctor.rating > 0 && (
                          <>
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span>{doctor.rating}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{doctor.totalAppointments} RDV</span>
                        <span>•</span>
                        <span>{doctor.consultationFee.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      {!doctor.isVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Vérifier
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          doctor.isActive
                            ? "text-red-600 border-red-600 hover:bg-red-50"
                            : "text-green-600 border-green-600 hover:bg-green-50"
                        }
                      >
                        {doctor.isActive ? "Désactiver" : "Activer"}
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
