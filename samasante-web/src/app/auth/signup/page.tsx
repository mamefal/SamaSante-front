"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { setToken, setUser } from "@/lib/auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SignupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
  role: z.enum(["PATIENT", "DOCTOR"]),
  // Champs communs
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  // Patient
  dob: z.string().optional(), // au format YYYY-MM-DD (si PATIENT)
  // Médecin
  specialty: z.string().optional(),
  ordreNumber: z.string().optional(),
}).refine((v) => (v.role === "DOCTOR" ? !!v.specialty : true), {
  message: "Spécialité requise pour un médecin",
  path: ["specialty"],
})

type SignupForm = z.infer<typeof SignupSchema>

export default function SignupPage() {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<SignupForm>({
      resolver: zodResolver(SignupSchema),
      defaultValues: {
        role: "PATIENT",
      },
    })

  const role = watch("role")

  const onSubmit = async (data: SignupForm) => {
    try {
      // Construire le payload attendu par Hono /api/auth/register
      let payload: any = {
        email: data.email,
        password: data.password,
        role: data.role,
      }

      if (data.role === "PATIENT") {
        // On attend: patient:{ firstName,lastName,dob }
        if (!data.dob) {
          toast.error("Date de naissance requise pour un patient (YYYY-MM-DD)")
          return
        }
        payload.patient = {
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.dob, // ex: "1998-04-12"
        }
      } else {
        // DOCTOR -> doctor:{ firstName,lastName,specialty,ordreNumber? }
        payload.doctor = {
          firstName: data.firstName,
          lastName: data.lastName,
          specialty: data.specialty,
          ordreNumber: data.ordreNumber || undefined,
        }
      }

      // ✅ Appel de la bonne route backend
      const res = await api.post("/api/auth/register", payload)

      setToken(res.data.token, res.data.user)
      toast.success("Compte créé avec succès")

      // redirection selon rôle
      if (data.role === "DOCTOR") router.replace("/doctor/dashboard")
      else router.replace("/")
    } catch (e) {
      // toast d’erreur déjà géré par l’interceptor axios
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Rejoignez SamaSanté</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* rôle */}
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select
                defaultValue="PATIENT"
                onValueChange={(v) => setValue("role", v as "PATIENT" | "DOCTOR")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PATIENT">Patient</SelectItem>
                  <SelectItem value="DOCTOR">Médecin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* email / mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {/* commun: prénom/nom */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* champs spécifiques */}
            {role === "PATIENT" ? (
              <div className="space-y-2">
                <Label htmlFor="dob">Date de naissance (YYYY-MM-DD)</Label>
                <Input id="dob" placeholder="1998-04-12" {...register("dob")} />
                {errors.dob && <p className="text-sm text-red-500">{errors.dob.message as string}</p>}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Spécialité</Label>
                  <Input id="specialty" placeholder="Pédiatrie" {...register("specialty")} />
                  {errors.specialty && <p className="text-sm text-red-500">{errors.specialty.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ordreNumber">Numéro d’ordre (optionnel)</Label>
                  <Input id="ordreNumber" placeholder="SN-12345" {...register("ordreNumber")} />
                </div>
              </>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Création..." : "Créer mon compte"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
