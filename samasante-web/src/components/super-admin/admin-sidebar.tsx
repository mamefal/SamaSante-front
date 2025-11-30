"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, UserCheck, Calendar, BarChart3, Settings, LogOut, Menu, X, Building2, Database, UserCog } from "lucide-react"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Tableau de bord", href: "/super-admin", icon: LayoutDashboard },
  { name: "Organisations", href: "/super-admin/organizations", icon: Building2 },
  { name: "Admins Hôpitaux", href: "/super-admin/hospital-admins", icon: UserCog },
  { name: "Gestion KYC", href: "/super-admin/kyc", icon: UserCheck },
  { name: "Médecins", href: "/super-admin/doctors", icon: Users },
  { name: "Rendez-vous", href: "/super-admin/appointments", icon: Calendar },
  { name: "Statistiques", href: "/super-admin/analytics", icon: BarChart3 },
  { name: "Backup/Restore", href: "/super-admin/backup", icon: Database },
  { name: "Paramètres", href: "/super-admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-border">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SAMASANTE</h1>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}

            <div className="pt-4 mt-4 border-t border-border">
              <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="mr-3 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
