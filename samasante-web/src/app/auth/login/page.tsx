"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { setUser } from "@/lib/auth"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Heart, Shield, Clock, Eye, EyeOff } from "lucide-react"

const isDev = process.env.NODE_ENV === 'development'
const devLog = (...args: any[]) => isDev && console.log(...args)
const devError = (...args: any[]) => isDev && console.error(...args)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      devLog('Attempting login with:', email)
      const res = await api.post("/auth/login", { email, password })
      devLog('Login response:', res.data)

      const role = res.data.user.role
      devLog('User role:', role)

      let redirectUrl = "/patient"
      if (role === "DOCTOR") redirectUrl = "/doctor"
      else if (role === "HOSPITAL_ADMIN") redirectUrl = "/hospital/dashboard"
      else if (role === "SUPER_ADMIN") redirectUrl = "/super-admin"

      setUser(res.data.user)
      toast.success("Connexion réussie")

      devLog('Redirecting to:', redirectUrl)
      devLog('User data:', res.data.user)

      // Force redirect using window.location for reliability
      window.location.href = redirectUrl
    } catch (error: any) {
      devError('Login error:', error)
      if (error.response) {
        toast.error(error.response.data.message || "Identifiants invalides")
      } else if (error.request) {
        toast.error("Impossible de contacter le serveur")
      } else {
        toast.error("Une erreur est survenue")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amina-gradient p-6 relative">
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>

      <div className="w-full max-w-md fade-in relative z-10 glass-card p-8 rounded-3xl">


        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-8 mt-8">
          <Logo size="xl" colored={false} />
          <span className="text-3xl font-bold text-white tracking-tight">AMINA</span>
        </div>

        <div className="mb-8 text-center">
          <p className="text-white/70">Connectez-vous pour accéder à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl glass-input border-white/20 focus:ring-0 focus:border-white/50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-white">Mot de passe</Label>
              <Link href="/auth/forgot-password" className="text-sm text-cyan-200 hover:text-cyan-100 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl glass-input border-white/20 focus:ring-0 focus:border-white/50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-white text-primary hover:bg-white/90 rounded-xl text-base font-bold btn-scale shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-sm text-white/70">
            Pas encore de compte ?{" "}
            <Link href="/auth/signup" className="text-cyan-200 font-semibold hover:text-cyan-100 hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
