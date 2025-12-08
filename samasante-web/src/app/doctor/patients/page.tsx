"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, Calendar, Phone, Mail, MapPin, User, Activity, Clock, Users, UserCheck, CalendarClock, UserX } from "lucide-react"

type Patient = {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: "male" | "female"
  city: string
  lastVisit: string
  nextAppointment: string | null
  totalVisits: number
  status: "active" | "inactive"
  conditions: string[]
  bloodType?: string
  allergies?: string[]
  appointments?: Array<{
    id: string
    date: string
    time: string
    type: string
    status: "completed" | "upcoming" | "cancelled"
    notes?: string
  }>
}

export default function DoctorPatients() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false)

  // Mock patients data with extended information
  const patients: Patient[] = [
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
      bloodType: "A+",
      allergies: ["Pénicilline"],
      appointments: [
        { id: "1", date: "2025-01-10", time: "09:00", type: "Consultation", status: "upcoming", notes: "Suivi hypertension" },
        { id: "2", date: "2025-01-08", time: "09:00", type: "Consultation", status: "completed", notes: "Contrôle tension" },
        { id: "3", date: "2024-12-15", time: "14:00", type: "Consultation", status: "completed" },
      ],
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
      bloodType: "O+",
      allergies: [],
      appointments: [
        { id: "4", date: "2025-01-10", time: "10:30", type: "Suivi", status: "upcoming", notes: "Contrôle glycémie" },
        { id: "5", date: "2025-01-05", time: "14:30", type: "Consultation", status: "completed" },
        { id: "6", date: "2024-12-20", time: "10:00", type: "Consultation", status: "completed" },
      ],
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
      bloodType: "B+",
      allergies: ["Aspirine"],
      appointments: [
        { id: "7", date: "2025-01-10", time: "14:00", type: "Consultation", status: "upcoming" },
        { id: "8", date: "2024-12-20", time: "16:00", type: "Consultation", status: "completed" },
      ],
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
      bloodType: "AB+",
      allergies: [],
      appointments: [
        { id: "9", date: "2024-11-15", time: "10:00", type: "Consultation", status: "completed" },
        { id: "10", date: "2024-10-10", time: "09:00", type: "Suivi", status: "completed" },
      ],
    },
  ]

  // Filter patients based on search and filters
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      searchQuery === "" ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)

    const matchesStatus = statusFilter === "all" || patient.status === statusFilter

    const matchesCity = cityFilter === "all" || patient.city.toLowerCase() === cityFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesCity
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
            Actif
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
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

  const getAppointmentStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">À venir</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Terminé</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Annulé</Badge>
      default:
        return <Badge>Inconnu</Badge>
    }
  }

  const handleViewRecord = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowRecordModal(true)
  }

  const handleViewAppointments = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowAppointmentsModal(true)
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mes patients
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Gérez vos patients et leur suivi médical
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                  <p className="text-sm text-muted-foreground">Total patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{patients.filter((p) => p.status === "active").length}</p>
                  <p className="text-sm text-muted-foreground">Patients actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <CalendarClock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{patients.filter((p) => p.nextAppointment).length}</p>
                  <p className="text-sm text-muted-foreground">RDV cette semaine</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <UserX className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{patients.filter((p) => p.status === "inactive").length}</p>
                  <p className="text-sm text-muted-foreground">Suivi requis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-md border-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone..."
                  className="pl-10 bg-gray-50 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full md:w-48 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  <SelectItem value="dakar">Dakar</SelectItem>
                  <SelectItem value="thiès">Thiès</SelectItem>
                  <SelectItem value="saint-louis">Saint-Louis</SelectItem>
                  <SelectItem value="kaolack">Kaolack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-2xl text-blue-600 font-bold shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {getGenderIcon(patient.gender)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
                        {getStatusBadge(patient.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                          {patient.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                          {patient.phone}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                          {patient.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-200">
                          {patient.age} ans
                        </Badge>
                        <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-200">
                          {patient.totalVisits} consultations
                        </Badge>
                        {patient.conditions.map((condition) => (
                          <Badge key={condition} variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <div className="text-right text-sm">
                      <p className="text-gray-500">Dernière visite: <span className="font-medium text-gray-900">{formatDate(patient.lastVisit)}</span></p>
                      {patient.nextAppointment && (
                        <p className="text-blue-600 font-medium mt-1">Prochain RDV: {formatDate(patient.nextAppointment)}</p>
                      )}
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 md:flex-none border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => handleViewRecord(patient)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Dossier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 md:flex-none border-purple-200 text-purple-700 hover:bg-purple-50"
                        onClick={() => handleViewAppointments(patient)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        RDV
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredPatients.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Aucun patient trouvé</h3>
              <p className="text-gray-500 mt-1">Essayez de modifier vos filtres de recherche</p>
            </div>
          )}
        </div>

        {/* Patient Record Modal */}
        <Dialog open={showRecordModal} onOpenChange={setShowRecordModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
            <DialogHeader className="p-6 pb-4 border-b bg-gray-50 sticky top-0 z-10">
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <User className="h-6 w-6" />
                </div>
                <span>Dossier médical - {selectedPatient?.name}</span>
              </DialogTitle>
              <DialogDescription className="ml-14">Informations complètes du patient</DialogDescription>
            </DialogHeader>

            {selectedPatient && (
              <div className="p-6 space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-500" />
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Nom complet</p>
                      <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Âge</p>
                      <p className="font-medium text-gray-900">{selectedPatient.age} ans</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Genre</p>
                      <p className="font-medium text-gray-900">{selectedPatient.gender === "female" ? "Féminin" : "Masculin"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Groupe sanguin</p>
                      <p className="font-medium text-gray-900">{selectedPatient.bloodType || "Non renseigné"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Email</p>
                      <p className="font-medium text-gray-900 truncate" title={selectedPatient.email}>{selectedPatient.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Téléphone</p>
                      <p className="font-medium text-gray-900">{selectedPatient.phone}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Ville</p>
                      <p className="font-medium text-gray-900">{selectedPatient.city}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Statut</p>
                        {getStatusBadge(selectedPatient.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-red-500" />
                    Informations médicales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                      <p className="text-sm font-bold text-orange-800 uppercase mb-3">Conditions médicales</p>
                      {selectedPatient.conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.conditions.map((condition) => (
                            <Badge key={condition} className="bg-white text-orange-700 border-orange-200 hover:bg-orange-100">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-orange-600 italic">Aucune condition signalée</p>
                      )}
                    </div>
                    <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                      <p className="text-sm font-bold text-red-800 uppercase mb-3">Allergies</p>
                      {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.allergies.map((allergy) => (
                            <Badge key={allergy} variant="destructive" className="bg-white text-red-700 border-red-200 hover:bg-red-100">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-red-600 italic">Aucune allergie connue</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visit History */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-500" />
                    Historique des visites
                  </h3>
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500 mb-1">Total de consultations</p>
                      <p className="text-3xl font-bold text-purple-600">{selectedPatient.totalVisits}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500 mb-1">Dernière visite</p>
                      <p className="text-xl font-bold text-gray-900">{formatDate(selectedPatient.lastVisit)}</p>
                    </div>
                    {selectedPatient.nextAppointment && (
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-l-blue-500">
                        <p className="text-sm text-gray-500 mb-1">Prochain rendez-vous</p>
                        <p className="text-xl font-bold text-blue-600">{formatDate(selectedPatient.nextAppointment)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Appointments Modal */}
        <Dialog open={showAppointmentsModal} onOpenChange={setShowAppointmentsModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto p-0">
            <DialogHeader className="p-6 pb-4 border-b bg-gray-50 sticky top-0 z-10">
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <span>Rendez-vous - {selectedPatient?.name}</span>
              </DialogTitle>
              <DialogDescription className="ml-14">Historique et rendez-vous à venir</DialogDescription>
            </DialogHeader>

            {selectedPatient && (
              <div className="p-6 space-y-4">
                {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                  selectedPatient.appointments.map((appointment) => (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                {formatDate(appointment.date)}
                              </Badge>
                              <div className="flex items-center text-gray-500 text-sm">
                                <Clock className="h-4 w-4 mr-1" />
                                {appointment.time}
                              </div>
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">{appointment.type}</h4>
                            {appointment.notes && (
                              <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 border border-gray-100">
                                <span className="font-semibold text-gray-900">Notes: </span>
                                {appointment.notes}
                              </div>
                            )}
                          </div>
                          <div className="flex items-start">
                            {getAppointmentStatusBadge(appointment.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">Aucun rendez-vous enregistré</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
