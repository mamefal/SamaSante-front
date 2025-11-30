"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { setToken } from "@/lib/auth"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post("/auth/login", { email, password })
      setToken(res.data.token, res.data.user)
      toast.success("Connexion réussie")

      // Redirect directly to the appropriate dashboard
      const role = res.data.user.role
      if (role === "DOCTOR") {
        router.push("/doctor")
      } else if (role === "HOSPITAL_ADMIN") {
        router.push("/hospital/dashboard")
      } else if (role === "SUPER_ADMIN") {
        router.push("/super-admin")
      } else {
        router.push("/patient")
      }
    } catch (e) {
      // toast d'erreur déjà géré par l'interceptor axios
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-12">
          <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-semibold">AMINA</span>
        </div>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Connexion</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Accédez à votre espace AMINA
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-xl border-gray-300 dark:border-gray-700"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-xl border-gray-300 dark:border-gray-700"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>

        {/* Signup Link */}
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Pas encore de compte ? </span>
          <Link href="/auth/signup" className="text-blue-500 hover:text-blue-600 font-medium">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  )
}
