"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Droplet,
  AlertCircle,
  Activity,
  Phone,
  Edit,
  Weight,
  Ruler,
  Thermometer,
  User,
  Stethoscope,
  FileText,
  Calendar,
  TrendingUp,
  Shield
} from "lucide-react"
import { PageTransition } from "@/components/page-transition"

export default function MedicalRecord() {
  // Mock user data
  const user = { id: "mock-user-id" }

  // Mock profile data
  const profile = {
    blood_type: "A+",
    allergies: "Pénicilline",
    chronic_conditions: "Asthme léger",
    emergency_contact: "+221 77 000 00 00",
  }

  // Mock consultations data
  const consultations = [
    {
      id: 1,
      appointment_date: "2024-01-15T10:00:00Z",
      diagnosis: "Grippe saisonnière",
      prescription: "Paracétamol, Repos",
      notes: "Patient à revoir si la fièvre persiste",
      doctors: {
        first_name: "Awa",
        last_name: "Diop",
        speciality: "Généraliste",
      },
    },
    {
      id: 2,
      appointment_date: "2023-12-20T14:30:00Z",
      diagnosis: "Contrôle de routine",
      prescription: "",
      notes: "RAS",
      doctors: {
        first_name: "Moussa",
        last_name: "Ndiaye",
        speciality: "Cardiologue",
      },
    },
  ]

  const medicalInfo = {
    bloodType: profile?.blood_type || "Non renseigné",
    allergies: profile?.allergies || "Aucune allergie connue",
    chronicConditions: profile?.chronic_conditions || "Aucune condition chronique",
    emergencyContact: profile?.emergency_contact || "Non renseigné",
  }

  const vitalSigns = [
    { label: "Poids", value: "70 kg", date: "15 Jan 2024", status: "normal", icon: Weight, color: "blue" },
    { label: "Taille", value: "175 cm", date: "15 Jan 2024", status: "normal", icon: Ruler, color: "purple" },
    { label: "Tension", value: "120/80", date: "10 Jan 2024", status: "normal", icon: Activity, color: "emerald" },
    { label: "Température", value: "36.5°C", date: "10 Jan 2024", status: "normal", icon: Thermometer, color: "orange" },
  ]

  return (
    <PageTransition>
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Mon Dossier Médical
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Historique médical et informations de santé
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Medical Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Personal Medical Info */}
              <Card className="border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-emerald-600" />
                    Informations Médicales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="flex items-center mb-2">
                      <Droplet className="h-5 w-5 mr-2 text-red-600" />
                      <p className="text-xs text-red-500 uppercase tracking-wide font-semibold">Groupe Sanguin</p>
                    </div>
                    <p className="text-2xl font-bold text-red-700">{medicalInfo.bloodType}</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                      <p className="text-xs text-orange-500 uppercase tracking-wide font-semibold">Allergies</p>
                    </div>
                    <p className="text-sm font-medium text-orange-900">{medicalInfo.allergies}</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-2">
                      <Heart className="h-5 w-5 mr-2 text-blue-600" />
                      <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Conditions Chroniques</p>
                    </div>
                    <p className="text-sm font-medium text-blue-900">{medicalInfo.chronicConditions}</p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <div className="flex items-center mb-2">
                      <Phone className="h-5 w-5 mr-2 text-emerald-600" />
                      <p className="text-xs text-emerald-500 uppercase tracking-wide font-semibold">Contact d'Urgence</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-900">{medicalInfo.emergencyContact}</p>
                  </div>

                  <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier les informations
                  </Button>
                </CardContent>
              </Card>

              {/* Vital Signs Summary */}
              <Card className="border-l-4 border-l-teal-500 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
                    Signes Vitaux Récents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vitalSigns.map((vital, index) => {
                      const Icon = vital.icon
                      return (
                        <div key={index} className={`p-3 bg-${vital.color}-50 rounded-lg border border-${vital.color}-100`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <Icon className={`h-4 w-4 mr-2 text-${vital.color}-600`} />
                              <p className="text-sm font-medium text-gray-700">{vital.label}</p>
                            </div>
                            <Badge className={`bg-green-100 text-green-700 border-green-200 text-xs`}>
                              Normal
                            </Badge>
                          </div>
                          <p className="text-xl font-bold text-gray-900 ml-6">{vital.value}</p>
                          <p className="text-xs text-gray-500 ml-6">{vital.date}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Consultations */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Consultations */}
              <Card className="shadow-md border-none">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Stethoscope className="h-6 w-6 mr-2 text-emerald-600" />
                    Consultations Récentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {consultations && consultations.length > 0 ? (
                    consultations.map((consultation: any) => (
                      <Card key={consultation.id} className="group hover:shadow-md transition-all border-l-4 border-l-emerald-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                <span className="text-lg font-bold text-white">
                                  {consultation.doctors?.first_name?.[0]}
                                  {consultation.doctors?.last_name?.[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-lg text-gray-900">
                                  Dr. {consultation.doctors?.first_name} {consultation.doctors?.last_name}
                                </p>
                                <p className="text-sm text-gray-500">{consultation.doctors?.speciality}</p>
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1.5 text-emerald-500" />
                              {new Date(consultation.appointment_date).toLocaleDateString("fr-FR", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>

                          <div className="space-y-3">
                            {consultation.diagnosis && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Diagnostic</p>
                                <p className="text-sm font-medium text-gray-900">{consultation.diagnosis}</p>
                              </div>
                            )}

                            {consultation.prescription && (
                              <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                                <p className="text-xs text-green-600 uppercase tracking-wide font-semibold mb-1">Prescription</p>
                                <p className="text-sm font-medium text-green-900">{consultation.prescription}</p>
                              </div>
                            )}

                            {consultation.notes && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-xs text-blue-600 uppercase tracking-wide font-semibold mb-1">Notes</p>
                                <p className="text-sm text-blue-900">{consultation.notes}</p>
                              </div>
                            )}
                          </div>

                          <Button variant="ghost" size="sm" className="mt-4 text-emerald-600 hover:bg-emerald-50">
                            <FileText className="h-4 w-4 mr-2" />
                            Voir les détails complets
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Stethoscope className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">Aucune consultation enregistrée</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
