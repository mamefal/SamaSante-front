import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Calendar, Users, Shield, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">SAMASANTE</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Médecins
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Spécialités
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                À propos
              </a>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Connexion</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">S'inscrire</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Votre santé, notre priorité
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Prenez rendez-vous avec les meilleurs médecins du Sénégal en quelques clics. Plateforme moderne, sécurisée
            et adaptée à vos besoins.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Spécialité ou médecin" className="pl-10" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Ville ou région" className="pl-10" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Date souhaitée" className="pl-10" />
                </div>
                <Button className="w-full">Rechercher</Button>
              </div>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Médecins vérifiés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Spécialités médicales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">14</div>
              <div className="text-muted-foreground">Régions couvertes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Pourquoi choisir SAMASANTE ?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une plateforme conçue pour simplifier l'accès aux soins de santé au Sénégal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Médecins Vérifiés</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tous nos médecins sont vérifiés par l'Ordre des Médecins du Sénégal. Votre sécurité est notre
                  priorité.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Rendez-vous Rapide</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Prenez rendez-vous en moins de 2 minutes. Disponibilités en temps réel et confirmation instantanée.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Suivi Personnalisé</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Dossier médical numérique sécurisé, rappels automatiques et suivi de vos consultations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Spécialités Populaires</h2>
            <p className="text-xl text-muted-foreground">Trouvez rapidement le spécialiste qu'il vous faut</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              "Médecine Générale",
              "Pédiatrie",
              "Gynécologie",
              "Cardiologie",
              "Dermatologie",
              "Ophtalmologie",
              "Dentaire",
              "Psychiatrie",
            ].map((specialty) => (
              <Card key={specialty} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="text-center p-2">
                  <Badge variant="secondary" className="mb-2">
                    {specialty}
                  </Badge>
                  <p className="text-sm text-muted-foreground">Disponible</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-foreground">SAMASANTE</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Plateforme de santé numérique du Sénégal. Votre santé, notre priorité.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Patients</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Prendre RDV
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Mon dossier
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Mes rendez-vous
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Médecins</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Rejoindre SAMASANTE
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Espace médecin
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>+221 33 XXX XX XX</li>
                <li>contact@samasante.sn</li>
                <li>Dakar, Sénégal</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 SAMASANTE. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
