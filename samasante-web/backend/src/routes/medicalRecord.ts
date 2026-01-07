import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

const medicalRecord = new Hono<HonoEnv>()

// GET /me - Dossier médical du patient connecté
medicalRecord.get('/me',
    requireAuth(['PATIENT']),
    async (c) => {
        const user = c.get('user') as any
        const patientId = user.patientId

        if (!patientId) return c.json({ error: "Patient profile not found" }, 404)

        try {
            const medicalFile = await prisma.medicalFile.findUnique({
                where: { patientId }
            })

            // Fetch recent consultations for vital signs history
            const consultations = await prisma.consultationNote.findMany({
                where: { patientId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    doctor: {
                        select: { firstName: true, lastName: true, specialty: true }
                    },
                    appointment: {
                        select: { start: true }
                    }
                }
            })

            // Extract vital signs from consultation notes
            const vitalSigns = consultations
                .filter(c => c.vitalSigns)
                .map(c => {
                    try {
                        const parsed = JSON.parse(c.vitalSigns || '{}')
                        return {
                            date: c.appointment.start,
                            ...parsed,
                            doctorName: `Dr. ${c.doctor.lastName}`
                        }
                    } catch {
                        return null
                    }
                })
                .filter(Boolean)

            // Parse lists
            let allergiesList: string[] = []
            if (medicalFile?.allergies) {
                allergiesList = medicalFile.allergies.split(',').map(s => s.trim())
            }

            let conditionsList: string[] = []
            if (medicalFile?.chronicConditions) {
                conditionsList = medicalFile.chronicConditions.split(',').map(s => s.trim())
            }

            return c.json({
                profile: {
                    bloodType: medicalFile?.bloodType || "Non renseigné",
                    allergies: allergiesList,
                    chronicConditions: conditionsList,
                    emergencyContact: medicalFile?.emergencyContact || "Non renseigné",
                    treatments: medicalFile?.treatments || ""
                },
                vitalSigns,
                consultations: consultations.map(c => ({
                    id: c.id,
                    date: c.appointment.start,
                    doctor: c.doctor,
                    diagnosis: c.diagnosis,
                    treatment: c.treatment,
                    notes: c.notes
                }))
            })
        } catch (error) {
            console.error(error)
            return c.json({ error: "Erreur lors de la récupération du dossier médical" }, 500)
        }
    })

// GET /patient/:id - Dossier médical pour les médecins
medicalRecord.get('/patient/:id',
    requireAuth(['DOCTOR', 'ADMIN', 'HOSPITAL_ADMIN']),
    async (c) => {
        const id = Number(c.req.param('id'))

        try {
            const medicalFile = await prisma.medicalFile.findUnique({
                where: { patientId: id },
                include: {
                    patient: true
                }
            })

            if (!medicalFile) return c.json({ error: "Medical file not found" }, 404)

            const consultations = await prisma.consultationNote.findMany({
                where: { patientId: id },
                orderBy: { createdAt: 'desc' },
                include: {
                    doctor: {
                        select: { firstName: true, lastName: true, specialty: true }
                    },
                    appointment: {
                        select: { start: true }
                    }
                }
            })

            return c.json({
                profile: medicalFile,
                consultations
            })
        } catch (error) {
            console.error(error)
            return c.json({ error: "Erreur lors de la récupération du dossier" }, 500)
        }
    })

// PATCH /patient/:id - Mettre à jour le dossier médical
const UpdateMedicalFileSchema = z.object({
    bloodType: z.string().optional(),
    allergies: z.string().optional(),
    chronicConditions: z.string().optional(),
    emergencyContact: z.string().optional(),
    treatments: z.string().optional(),
    height: z.number().optional(),
    weight: z.number().optional()
})

medicalRecord.patch('/patient/:id',
    requireAuth(['DOCTOR', 'ADMIN']),
    zValidator('json', UpdateMedicalFileSchema),
    async (c) => {
        const id = Number(c.req.param('id'))
        const data = c.req.valid('json')

        try {
            const updated = await prisma.medicalFile.update({
                where: { patientId: id },
                data
            })

            return c.json(updated)
        } catch (error) {
            console.error('Failed to update medical file:', error)
            return c.json({ error: "Erreur lors de la mise à jour" }, 500)
        }
    })

export default medicalRecord
