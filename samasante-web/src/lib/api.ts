// src/lib/api.ts
import axios from "axios"
import { toast } from "sonner"
import { getToken, logout } from "./auth"

const baseURL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000"

export const api = axios.create({
  baseURL,
  withCredentials: false,
})

// Ajoute automatiquement le Bearer token
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? getToken() : null
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  if (!config.headers?.["Content-Type"]) {
    config.headers = config.headers ?? {}
    config.headers["Content-Type"] = "application/json"
  }
  return config
})

// Gestion centralisée des erreurs + 401 -> logout
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const data = error?.response?.data
    const msg =
      (typeof data === "string" && data) ||
      data?.message ||
      data?.error ||
      error.message ||
      "Une erreur est survenue"

    if (status === 401) {
      toast.error("Session expirée — veuillez vous reconnecter.")
      if (typeof window !== "undefined") {
        logout()
        window.location.href = "/auth/login"
      }
    } else {
      toast.error(msg)
    }
    return Promise.reject(error)
  }
)

// Optionnel : default export si tu préfères `import api from "@/lib/api"`
export default api
