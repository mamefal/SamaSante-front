"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Shield, Clock, Heart, Users, Calendar, Activity, CheckCircle2, Zap, Award } from "lucide-react"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
        ? 'bg-background/95 backdrop-blur-sm shadow-sm border-b border-border'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform transition-transform group-hover:scale-110">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">SamaSanté</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Fonctionnalités
              </a>
              <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Avantages
              </a>
              <a href="#stats" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Statistiques
              </a>
              <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Connexion
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 btn-scale">
                  Commencer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-border slide-up">
              <a href="#features" className="block text-sm font-medium">Fonctionnalités</a>
              <a href="#benefits" className="block text-sm font-medium">Avantages</a>
              <a href="#stats" className="block text-sm font-medium">Statistiques</a>
              <Link href="/auth/login" className="block text-sm font-medium">Connexion</Link>
              <Link href="/auth/signup" className="block">
                <Button className="w-full bg-primary text-white rounded-lg">
                  Commencer
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Plateforme de santé #1 au Sénégal</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
            La santé accessible
            <br />
            <span className="text-primary">à tous les Sénégalais</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Prenez rendez-vous avec les meilleurs médecins du Sénégal en quelques clics.
            Simple, rapide et sécurisé.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-lg px-8 h-14 text-lg btn-scale">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="rounded-lg px-8 h-14 text-lg btn-scale">
                Découvrir
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>100% Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Médecins Vérifiés</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Gratuit pour les patients</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, value: "500+", label: "Médecins vérifiés", color: "text-primary" },
              { icon: Calendar, value: "10,000+", label: "Rendez-vous pris", color: "text-secondary" },
              { icon: Activity, value: "50+", label: "Spécialités médicales", color: "text-accent" }
            ].map((stat, i) => (
              <div key={i} className="card-hover bg-card border border-border rounded-xl p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 ${stat.color} bg-current/10 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className={`text-5xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Fonctionnalités <span className="text-primary">puissantes</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer votre santé en toute simplicité
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: "Prise de RDV instantanée", desc: "Réservez en quelques clics", color: "text-primary" },
              { icon: Shield, title: "Données sécurisées", desc: "Chiffrement de bout en bout", color: "text-secondary" },
              { icon: Clock, title: "Disponible 24/7", desc: "Accédez à vos dossiers à tout moment", color: "text-accent" },
              { icon: Heart, title: "Suivi médical", desc: "Historique complet de santé", color: "text-primary" },
              { icon: Users, title: "Médecins qualifiés", desc: "Tous vérifiés et certifiés", color: "text-secondary" },
              { icon: Zap, title: "Interface moderne", desc: "Simple et intuitive", color: "text-accent" }
            ].map((feature, i) => (
              <div key={i} className="card-hover bg-card border border-border rounded-xl p-6">
                <div className={`w-12 h-12 ${feature.color} bg-current/10 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Prêt à prendre soin de votre santé ?
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90">
            Rejoignez des milliers de Sénégalais qui font confiance à SamaSanté
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-lg px-12 h-16 text-xl btn-scale">
              Créer un compte gratuit
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-foreground">SamaSanté</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La santé accessible à tous les Sénégalais
              </p>
            </div>

            {[
              { title: "Patients", links: [{ label: "Créer un compte", href: "/auth/signup" }, { label: "Se connecter", href: "/auth/login" }] },
              { title: "Médecins", links: [{ label: "Rejoindre", href: "/auth/signup" }, { label: "Espace médecin", href: "/auth/login" }] },
              { title: "Contact", links: [{ label: "+221 33 XXX XX XX", href: undefined }, { label: "contact@samasante.sn", href: undefined }, { label: "Dakar, Sénégal", href: undefined }] }
            ].map((section, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      {link.href ? (
                        <Link href={link.href} className="hover:text-foreground transition-colors">{link.label}</Link>
                      ) : (
                        <span>{link.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 SamaSanté. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
