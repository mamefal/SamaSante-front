"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Shield, Clock, Heart, Sparkles } from "lucide-react"
import { useState } from "react"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation - Apple Style */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl z-50 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-semibold">AMINA</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                Fonctionnalités
              </a>
              <a href="#benefits" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                Avantages
              </a>
              <Link href="/auth/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                Connexion
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4">
                  Commencer
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200 dark:border-gray-800">
              <a href="#features" className="block text-sm text-gray-600 dark:text-gray-300">Fonctionnalités</a>
              <a href="#benefits" className="block text-sm text-gray-600 dark:text-gray-300">Avantages</a>
              <Link href="/auth/login" className="block text-sm text-gray-600 dark:text-gray-300">Connexion</Link>
              <Link href="/auth/signup" className="block">
                <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full">
                  Commencer
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Apple Style */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tight mb-6 bg-gradient-to-b from-black to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            La santé n'est pas un luxe.
            <br />
            C'est un droit.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-light">
            Prenez rendez-vous avec les meilleurs médecins du Sénégal en quelques secondes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 text-base h-12">
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="#stats">
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-12 border-gray-300 dark:border-gray-700">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Large Image Section */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 h-[500px] flex items-center justify-center border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-semibold mb-3">Interface Intuitive</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Conçue pour être simple et élégante
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-6xl font-semibold mb-2 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                500+
              </div>
              <p className="text-gray-600 dark:text-gray-400">Médecins vérifiés</p>
            </div>
            <div>
              <div className="text-6xl font-semibold mb-2 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                50+
              </div>
              <p className="text-gray-600 dark:text-gray-400">Spécialités médicales</p>
            </div>
            <div>
              <div className="text-6xl font-semibold mb-2 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                14
              </div>
              <p className="text-gray-600 dark:text-gray-400">Régions du Sénégal</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Apple Style */}
      <section className="py-32 px-6 bg-black dark:bg-white text-white dark:text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight">
            Prêt à commencer ?
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-80 font-light">
            Rejoignez des milliers de Sénégalais qui prennent soin de leur santé avec AMINA
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full px-8 text-base h-12">
              Créer un compte gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer - Apple Style */}
      <footer className="py-12 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4">Patients</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-black dark:hover:text-white transition-colors">Créer un compte</Link></li>
                <li><Link href="/auth/login" className="hover:text-black dark:hover:text-white transition-colors">Se connecter</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Médecins</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-black dark:hover:text-white transition-colors">Rejoindre</Link></li>
                <li><Link href="/auth/login" className="hover:text-black dark:hover:text-white transition-colors">Espace médecin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hôpitaux</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-black dark:hover:text-white transition-colors">Partenariat</Link></li>
                <li><Link href="/auth/login" className="hover:text-black dark:hover:text-white transition-colors">Espace hôpital</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>+221 33 XXX XX XX</li>
                <li>contact@samasante.sn</li>
                <li>Dakar, Sénégal</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 AMINA. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
