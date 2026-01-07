"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  FlaskConical,
  Activity,
  LogOut,
  Stethoscope
} from "lucide-react"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { type LucideIcon } from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

const navigation: NavItem[] = [
  { name: "Tableau de bord", href: "/doctor", icon: LayoutDashboard },
  { name: "Agenda", href: "/doctor/calendar", icon: Calendar },
  { name: "Patients", href: "/doctor/patients", icon: Users },
  { name: "Consultations", href: "/doctor/stats", icon: Activity },
  { name: "Ordonnances", href: "/doctor/prescriptions", icon: FileText },
  { name: "Analyses", href: "/doctor/lab-orders", icon: FlaskConical },
  { name: "Certificats", href: "/doctor/certificates", icon: Stethoscope },
]

export function DoctorSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/auth/login")
  }

  return (
    <div className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">AMINA</h2>
            <p className="text-xs text-gray-500">Médecin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-0.5 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 dark:bg-gray-900 text-black dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-black dark:hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )
}
