import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'

import type { HonoEnv } from '../types/env.js'

export const certificates = new Hono<HonoEnv>()

// Require authentication
certificates.use('*', requireAuth())

// Validation schemas
const CreateCertificateSchema = z.object({
    patientId: z.number(),
    type: z.enum(['sick_leave', 'fitness', 'medical_report']),
    diagnosis: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    days: z.number().optional(),
    content: z.string().min(10)
})

// Get all certificates for a doctor
certificates.get('/', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const list = await prisma.medicalCertificate.findMany({
        where: { doctorId },
        include: {
            patient: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 50
    })

    return c.json(list)
})

// Get certificates for a specific patient
certificates.get('/patient/:patientId', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const patientId = Number(c.req.param('patientId'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const list = await prisma.medicalCertificate.findMany({
        where: {
            patientId,
            doctorId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return c.json(list)
})

// Get a single certificate
certificates.get('/:id', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const id = Number(c.req.param('id'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const certificate = await prisma.medicalCertificate.findFirst({
        where: {
            id,
            doctorId
        },
        include: {
            patient: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    dob: true
                }
            },
            doctor: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    specialty: true,
                    ordreNumber: true
                }
            }
        }
    })

    if (!certificate) {
        return c.json({ error: 'Certificate not found' }, 404)
    }

    return c.json(certificate)
})

// Create a new certificate
certificates.post('/',
    zValidator('json', CreateCertificateSchema),
    async (c) => {
        const user = c.get('user')
        const doctorId = user.doctorId

        if (!doctorId) {
            return c.json({ error: 'Not a doctor' }, 403)
        }

        const data = c.req.valid('json')

        const certificate = await prisma.medicalCertificate.create({
            data: {
                doctorId,
                patientId: data.patientId,
                type: data.type,
                diagnosis: data.diagnosis ?? null,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                days: data.days ?? null,
                content: data.content
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        return c.json(certificate, 201)
    }
)

// Delete a certificate
certificates.delete('/:id', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const id = Number(c.req.param('id'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    // Verify ownership
    const existing = await prisma.medicalCertificate.findFirst({
        where: { id, doctorId }
    })

    if (!existing) {
        return c.json({ error: 'Certificate not found' }, 404)
    }

    await prisma.medicalCertificate.delete({
        where: { id }
    })

    return c.json({ message: 'Certificate deleted' })
})
