import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

const admissions = new Hono<HonoEnv>()

admissions.use('*', requireAuth(['HOSPITAL_ADMIN', 'DOCTOR']))

// Get active admissions
admissions.get('/active', async (c) => {
    const user = c.get('user') as any
    const organizationId = user.organizationId

    const list = await prisma.admission.findMany({
        where: { organizationId, status: 'admitted' },
        include: {
            patient: true,
            bed: {
                include: { room: true }
            }
        }
    })
    return c.json(list)
})

const AdmitPatientSchema = z.object({
    patientId: z.number(),
    bedId: z.number(),
    reason: z.string().optional(),
    notes: z.string().optional()
})

// Admit a patient
admissions.post('/', zValidator('json', AdmitPatientSchema), async (c) => {
    const user = c.get('user') as any
    const organizationId = user.organizationId
    const { patientId, bedId, reason, notes } = c.req.valid('json')

    // 1. Check if bed is available
    const bed = await prisma.bed.findUnique({
        where: { id: bedId }
    })

    if (!bed || bed.status !== 'available') {
        return c.json({ error: 'Le lit n\'est pas disponible' }, 400)
    }

    // 2. Transaction to create admission and update bed
    const result = await prisma.$transaction(async (tx) => {
        const admission = await tx.admission.create({
            data: {
                patientId,
                bedId,
                reason,
                notes,
                organizationId,
                status: 'admitted'
            }
        })

        await tx.bed.update({
            where: { id: bedId },
            data: {
                status: 'occupied',
                currentAdmissionId: admission.id
            }
        })

        // Also update room status if needed (optional)

        return admission
    })

    return c.json(result, 201)
})

// Discharge a patient
admissions.post('/:id/discharge', async (c) => {
    const id = parseInt(c.req.param('id'))

    const admission = await prisma.admission.findUnique({
        where: { id },
        include: { bed: true }
    })

    if (!admission || admission.status !== 'admitted') {
        return c.json({ error: 'Admission non trouvée ou déjà traitée' }, 404)
    }

    const result = await prisma.$transaction(async (tx) => {
        const updatedAdmission = await tx.admission.update({
            where: { id },
            data: {
                status: 'discharged',
                dischargedAt: new Date()
            }
        })

        await tx.bed.update({
            where: { id: admission.bedId },
            data: {
                status: 'available',
                currentAdmissionId: null
            }
        })

        return updatedAdmission
    })

    return c.json(result)
})

export default admissions
