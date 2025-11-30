
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Star, MapPin, Phone, GraduationCap, Award, Save } from "lucide-react"

export default async function DoctorProfile() {


  // Mock user data
  const user = {
    email: "docteur@samasante.sn",
    user_metadata: {
      first_name: "Awa",
      last_name: "Diop",
    },
  }
  const firstName = user.user_metadata.first_name
  const lastName = user.user_metadata.last_name

  // Mock doctor profile data
  const doctorProfile = {
    specialty: "Pédiatrie",
    licenseNumber: "SN-MED-2024-001",
    yearsOfExperience: 8,
    education: "Doctorat en Médecine - Université Cheikh Anta Diop",
    hospitalAffiliation: "Hôpital Principal de Dakar",
    consultationFee: 25000,
    bio: "Médecin pédiatre spécialisé dans le suivi des enfants de 0 à 18 ans. Passionnée par la médecine préventive et l'accompagnement des familles.",
    languages: ["Français", "Wolof", "Anglais"],
    phone: "+221 77 123 45 67",
    address: "Avenue Bourguiba, Dakar",
    city: "Dakar",
    region: "Dakar",
    rating: 4.8,
    reviewsCount: 23,
    isVerified: true,
    totalPatients: 47,
    totalConsultations: 156,
  }

  const specialties = [
    "Médecine Générale",
    "Pédiatrie",
    "Gynécologie",
    "Cardiologie",
    "Dermatologie",
    "Ophtalmologie",
    "Dentaire",
    "Psychiatrie",
    "Orthopédie",
    "Neurologie",
  ]

  const regions = [
    "Dakar",
    "Thiès",
    "Saint-Louis",
    "Diourbel",
    "Kaolack",
    "Tambacounda",
    "Kolda",
    "Ziguinchor",
    "Louga",
    "Fatick",
    "Kaffrine",
    "Kédougou",
    "Matam",
    "Sédhiou",
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mon profil</h1>
          <p className="text-muted-foreground">Gérez vos informations professionnelles</p>
        </div>
        <div className="flex items-center space-x-2">
          {doctorProfile.isVerified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Award className="h-3 w-3 mr-1" />
              Profil vérifié
            </Badge>
          )}
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>
              Dr. {firstName} {lastName}
            </CardTitle>
            <CardDescription>{doctorProfile.specialty}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">{doctorProfile.rating}/5</span>
              <span className="text-sm text-muted-foreground">({doctorProfile.reviewsCount} avis)</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{doctorProfile.totalPatients}</p>
                <p className="text-xs text-muted-foreground">Patients</p>
                <p className="text-sm text-muted-foreground">
                  Plateforme AMINA
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{doctorProfile.totalConsultations}</p>
                <p className="text-xs text-muted-foreground">Consultations</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {doctorProfile.city}, {doctorProfile.region}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{doctorProfile.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{doctorProfile.yearsOfExperience} ans d'expérience</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Vos données personnelles et de contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" defaultValue={firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" defaultValue={lastName} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" defaultValue={doctorProfile.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" defaultValue={doctorProfile.address} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" defaultValue={doctorProfile.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Région</Label>
                  <Select defaultValue={doctorProfile.region}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region.toLowerCase()}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations professionnelles</CardTitle>
              <CardDescription>Vos qualifications et spécialités médicales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Spécialité</Label>
                  <Select defaultValue={doctorProfile.specialty.toLowerCase()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty.toLowerCase()}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">Numéro de licence</Label>
                  <Input id="license" defaultValue={doctorProfile.licenseNumber} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Années d'expérience</Label>
                  <Input id="experience" type="number" defaultValue={doctorProfile.yearsOfExperience} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Tarif consultation (FCFA)</Label>
                  <Input id="fee" type="number" defaultValue={doctorProfile.consultationFee} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Formation</Label>
                <Input id="education" defaultValue={doctorProfile.education} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital">Affiliation hospitalière</Label>
                <Input id="hospital" defaultValue={doctorProfile.hospitalAffiliation} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biographie professionnelle</Label>
                <Textarea id="bio" rows={4} defaultValue={doctorProfile.bio} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Langues parlées</Label>
                <Input
                  id="languages"
                  defaultValue={doctorProfile.languages.join(", ")}
                  placeholder="Français, Wolof, Anglais"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
