"use client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { logout } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  const router = useRouter()
  return (
    <Button
      variant="secondary"
      onClick={() => {
        logout()
        toast.success("Déconnecté")
        router.replace("/auth/login")
      }}
    >
      Se déconnecter
    </Button>
  )
}
