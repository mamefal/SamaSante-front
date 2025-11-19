"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppointmentBookingModal } from "@/components/appointment-booking-modal"
import { createClient } from "@/lib/supabase/client"

interface Doctor {
  id: string
  speciality: string
  consultation_fee: number
  profiles: {
    first_name: string
    last_name: string
    city: string
    phone: string
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

  const supabase = createClient()

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
    fetchDoctors()
    getCurrentUser()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchTerm, selectedSpecialty, selectedCity])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors")
      const data = await response.json()
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
          `${doctor.profiles.first_name} ${doctor.profiles.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) || doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedSpecialty) {
      filtered = filtered.filter((doctor) => doctor.speciality === selectedSpecialty)
    }

    if (selectedCity) {
      filtered = filtered.filter((doctor) => doctor.profiles.city === selectedCity)
    }

    setFilteredDoctors(filtered)
  }

  const handleBookAppointment = (doctor: Doctor) => {
    if (!currentUser) {
      // Redirect to login
      window.location.href = "/auth/login"
      return
    }

    setBookingModal({
      isOpen: true,
      doctorId: doctor.id,
      doctorName: `${doctor.profiles.first_name} ${doctor.profiles.last_name}`,
      speciality: doctor.speciality,
    })
  }

  if (loading) {
    return (
      <div className="pb-20">
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Rechercher un médecin</h1>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Rechercher un médecin</h1>

        <div className="relative mb-4">
          <Input
            placeholder="Nom du médecin, spécialité..."
            className="pr-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button size="sm" className="absolute right-1 top-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Spécialités</p>
            <div className="flex flex-wrap gap-2">
              {specialties.slice(0, 4).map((specialty) => (
                <Badge
                  key={specialty}
                  variant={selectedSpecialty === specialty ? "default" : "outline"}
                  className="text-xs cursor-pointer"
                  onClick={() => setSelectedSpecialty(selectedSpecialty === specialty ? "" : specialty)}
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Localisation</p>
            <div className="flex flex-wrap gap-2">
              {locations.slice(0, 3).map((location) => (
                <Badge
                  key={location}
                  variant={selectedCity === location ? "default" : "outline"}
                  className="text-xs cursor-pointer"
                  onClick={() => setSelectedCity(selectedCity === location ? "" : location)}
                >
                  {location}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">{filteredDoctors.length} médecins trouvés</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSpecialty("")
              setSelectedCity("")
              setSearchTerm("")
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Effacer filtres
          </Button>
        </div>

        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-cyan-600">
                    {doctor.profiles.first_name?.[0]}
                    {doctor.profiles.last_name?.[0]}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Dr. {doctor.profiles.first_name} {doctor.profiles.last_name}
                      </h3>
                      <p className="text-sm text-cyan-600 font-medium">{doctor.speciality}</p>
                      <p className="text-xs text-gray-500 mt-1">📍 {doctor.profiles.city || "Dakar"}, Sénégal</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-xs text-gray-500">(124)</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {doctor.consultation_fee?.toLocaleString() || "15,000"} FCFA
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>🕐 Disponible aujourd'hui</span>
                      <span>📞 {doctor.profiles.phone}</span>
                    </div>

                    <Button
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => handleBookAppointment(doctor)}
                    >
                      Prendre RDV
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500">Aucun médecin trouvé</p>
            <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos critères de recherche</p>
          </div>
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
    </div>
  )
}
