import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

export const emergencies = new Hono<HonoEnv>()

const CreateEmergency = z.object({
    patientName: z.string(),
    age: z.number().int(),
    gender: z.string(),
    condition: z.string(),
    severity: z.enum(['Critique', 'Urgent', 'Stable']),
    triage: z.enum(['Rouge', 'Orange', 'Jaune', 'Vert']),
    status: z.enum(['En attente', 'En traitement', 'Terminé']),
    doctorId: z.number().optional()
})

// Get all emergencies for organization
emergencies.get('/',
    requireAuth(['HOSPITAL_ADMIN', 'DOCTOR']),
    async (c) => {
        const user = c.get('user') as any
        const organizationId = user.organizationId

        if (!organizationId) {
            return c.json({ error: 'Organization required' }, 400)
        }

        const list = await prisma.emergency.findMany({
            where: { organizationId },
            include: {
                doctor: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { arrivalTime: 'desc' }
        })

        return c.json(list)
    }
)

// Create emergency
emergencies.post('/',
    requireAuth(['HOSPITAL_ADMIN', 'DOCTOR']),
    zValidator('json', CreateEmergency),
    async (c) => {
        const user = c.get('user') as any
        const organizationId = user.organizationId
        const body = c.req.valid('json')

        if (!organizationId) {
            return c.json({ error: 'Organization required' }, 400)
        }

        const emergency = await prisma.emergency.create({
            data: {
                ...body,
                organizationId
            }
        })

        return c.json(emergency)
    }
)

// Update emergency status/doctor
emergencies.patch('/:id',
    requireAuth(['HOSPITAL_ADMIN', 'DOCTOR']),
    async (c) => {
        const id = Number(c.req.param('id'))
        const body = await c.req.json()

        const emergency = await prisma.emergency.update({
            where: { id },
            data: body
        })

        return c.json(emergency)
    }
)
