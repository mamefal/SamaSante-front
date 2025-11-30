import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'

import type { HonoEnv } from '../types/env.js'

export const prescriptions = new Hono<HonoEnv>()

// Require authentication
prescriptions.use('*', requireAuth())

// Validation schemas
const CreatePrescriptionSchema = z.object({
    patientId: z.number(),
    appointmentId: z.number().optional(),
    diagnosis: z.string().min(3),
    notes: z.string().optional(),
    validUntil: z.string().optional(),
    medications: z.array(z.object({
        medicationName: z.string().min(2),
        dosage: z.string(),
        frequency: z.string(),
        duration: z.string(),
        instructions: z.string().optional()
    })).min(1)
})

// Get all prescriptions for a doctor
prescriptions.get('/', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const list = await prisma.prescription.findMany({
        where: { doctorId },
        include: {
            patient: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            },
            medications: true,
            appointment: {
                select: {
                    id: true,
                    start: true
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

// Get prescriptions for a specific patient
prescriptions.get('/patient/:patientId', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const patientId = Number(c.req.param('patientId'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const list = await prisma.prescription.findMany({
        where: {
            patientId,
            doctorId
        },
        include: {
            medications: true,
            appointment: {
                select: {
                    id: true,
                    start: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return c.json(list)
})

// Get a single prescription by ID
prescriptions.get('/:id', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const id = Number(c.req.param('id'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const prescription = await prisma.prescription.findFirst({
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
            },
            medications: true,
            appointment: {
                select: {
                    id: true,
                    start: true
                }
            }
        }
    })

    if (!prescription) {
        return c.json({ error: 'Prescription not found' }, 404)
    }

    return c.json(prescription)
})

// Create a new prescription
prescriptions.post('/',
    zValidator('json', CreatePrescriptionSchema),
    async (c) => {
        const user = c.get('user')
        const doctorId = user.doctorId

        if (!doctorId) {
            return c.json({ error: 'Not a doctor' }, 403)
        }

        const data = c.req.valid('json')

        const prescription = await prisma.prescription.create({
            data: {
                doctorId,
                patientId: data.patientId,
                appointmentId: data.appointmentId ?? null,
                diagnosis: data.diagnosis,
                notes: data.notes ?? null,
                validUntil: data.validUntil ? new Date(data.validUntil) : null,
                medications: {
                    create: data.medications.map(m => ({
                        ...m,
                        instructions: m.instructions ?? null
                    }))
                }
            },
            include: {
                medications: true,
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        return c.json(prescription, 201)
    }
)

// Delete a prescription
prescriptions.delete('/:id', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const id = Number(c.req.param('id'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    // Verify ownership
    const existing = await prisma.prescription.findFirst({
        where: { id, doctorId }
    })

    if (!existing) {
        return c.json({ error: 'Prescription not found' }, 404)
    }

    await prisma.prescription.delete({
        where: { id }
    })

    return c.json({ message: 'Prescription deleted' })
})

// Get all prescriptions for the authenticated patient
prescriptions.get('/my-prescriptions', async (c) => {
    const user = c.get('user')
    const patientId = user.patientId

    if (!patientId) {
        return c.json({ error: 'Not a patient' }, 403)
    }

    const list = await prisma.prescription.findMany({
        where: { patientId },
        include: {
            doctor: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    specialty: true
                }
            },
            medications: true,
            appointment: {
                select: {
                    id: true,
                    start: true
                }
            },
            patient: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return c.json(list)
})
