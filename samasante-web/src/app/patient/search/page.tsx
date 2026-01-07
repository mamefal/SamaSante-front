"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { getUser } from "@/lib/auth"
import AppointmentBookingModal from '@/components/appointment-booking-modal'
import {
  Search,
  MapPin,
  Star,
  Phone,
  Clock,
  X,
  Stethoscope,
  Calendar,
  DollarSign
} from "lucide-react"

interface Doctor {
  id: number
  firstName: string
  lastName: string
  specialty: string
  phonePublic: string | null
  city: string | null
  organization?: {
    name: string
    city: string
  }
}

export default function SearchDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [loading, setLoading] = useState(true)
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean
    doctorId: string
    doctorName: string
    speciality: string
  }>({
    isOpen: false,
    doctorId: "",
    doctorName: "",
    speciality: "",
  })
  const [currentUser, setCurrentUser] = useState<any>(null)

  const specialties = [
    "Médecine Générale",
    "Cardiologie",
    "Pédiatrie",
    "Gynécologie",
    "Dermatologie",
    "Ophtalmologie",
    "Neurologie",
    "Orthopédie",
  ]

  const locations = ["Dakar", "Pikine", "Guédiawaye", "Rufisque", "Thiès", "Kaolack", "Saint-Louis", "Ziguinchor"]

  useEffect(() => {
    const user = getUser()
    setCurrentUser(user)
    fetchDoctors()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchTerm, selectedSpecialty, selectedCity])

  const fetchDoctors = async () => {
    try {
      const response = await api.get("/doctors")
      const data = Array.isArray(response.data) ? response.data : []
      setDoctors(data)
      setFilteredDoctors(data)
    } catch (error) {
      console.error("Error fetching doctors:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = doctors

    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          `${doctor.firstName} ${doctor.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) || doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedSpecialty) {
      filtered = filtered.filter((doctor) => doctor.specialty === selectedSpecialty)
    }

    if (selectedCity) {
      // Use organization city or fallback
      filtered = filtered.filter((doctor) => (doctor.organization?.city || doctor.city) === selectedCity)
    }

    setFilteredDoctors(filtered)
  }

  const handleBookAppointment = (doctor: Doctor) => {
    setBookingModal({
      isOpen: true,
      doctorId: doctor.id.toString(),
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      speciality: doctor.specialty,
    })
  }

  const clearFilters = () => {
    setSelectedSpecialty("")
    setSelectedCity("")
    setSearchTerm("")
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6 bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
      <section className="p-8 space-y-8" role="main" aria-label="Recherche de médecins">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Rechercher un Médecin
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Trouvez le praticien adapté à vos besoins
          </p>
        </header>

        {/* Search & Filters */}
        <Card className="shadow-md border-none">
          <CardContent className="p-6 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Nom du médecin, spécialité..."
                className="pl-11 pr-4 h-12 bg-gray-50 border-gray-200 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-3">
                  <Stethoscope className="h-4 w-4 mr-2 text-emerald-600" />
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Spécialités</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant={selectedSpecialty === specialty ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${selectedSpecialty === specialty
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      onClick={() => setSelectedSpecialty(selectedSpecialty === specialty ? "" : specialty)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <MapPin className="h-4 w-4 mr-2 text-teal-600" />
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Localisation</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {locations.map((location) => (
                    <Badge
                      key={location}
                      variant={selectedCity === location ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${selectedCity === location
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "border-teal-200 text-teal-700 hover:bg-teal-50"
                        }`}
                      onClick={() => setSelectedCity(selectedCity === location ? "" : location)}
                    >
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-700">
            <span className="text-emerald-600 font-bold">{filteredDoctors.length}</span> médecin{filteredDoctors.length > 1 ? 's' : ''} trouvé{filteredDoctors.length > 1 ? 's' : ''}
          </p>
          {(selectedSpecialty || selectedCity || searchTerm) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Effacer les filtres
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                    <span className="text-2xl font-bold text-white">
                      {doctor.firstName?.[0]}
                      {doctor.lastName?.[0]}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-emerald-600 font-semibold">{doctor.specialty}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1 text-teal-500" />
                          {doctor.organization?.city || doctor.city || "Dakar"}, Sénégal
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <div className="flex items-center space-x-1 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold">4.8</span>
                          <span className="text-xs text-gray-500">(124 avis)</span>
                        </div>
                        <div className="flex items-center text-gray-900">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          <span className="text-lg font-bold">
                            15,000 FCFA
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-green-500" />
                          <span>Disponible aujourd'hui</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1.5 text-blue-500" />
                          <span>{doctor.phonePublic || "Non renseigné"}</span>
                        </div>
                      </div>

                      <Button
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
                        onClick={() => handleBookAppointment(doctor)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Prendre Rendez-vous
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDoctors.length === 0 && (
            <Card className="border-dashed border-2 border-gray-200 bg-transparent shadow-none">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Aucun médecin trouvé</h3>
                <p className="text-gray-500 mt-1">Essayez de modifier vos critères de recherche</p>
                <Button
                  variant="outline"
                  className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={clearFilters}
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <AppointmentBookingModal
          isOpen={bookingModal.isOpen}
          onClose={() => setBookingModal({ ...bookingModal, isOpen: false })}
          doctorId={bookingModal.doctorId}
          doctorName={bookingModal.doctorName}
          speciality={bookingModal.speciality}
          patientId={currentUser?.id || ""}
        />
      </section>
    </div >
  )
}
