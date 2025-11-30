import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'

import type { HonoEnv } from '../types/env.js'

export const consultationNotes = new Hono<HonoEnv>()

// Require authentication
consultationNotes.use('*', requireAuth())

// Validation schemas
const CreateConsultationNoteSchema = z.object({
    appointmentId: z.number(),
    patientId: z.number(),
    chiefComplaint: z.string().min(3),
    symptoms: z.string().optional(),
    examination: z.string().optional(),
    diagnosis: z.string().min(3),
    treatment: z.string().optional(),
    notes: z.string().optional(),
    vitalSigns: z.string().optional() // JSON string
})

// Get all consultation notes for a doctor
consultationNotes.get('/', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const list = await prisma.consultationNote.findMany({
        where: { doctorId },
        include: {
            patient: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            },
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

// Get consultation notes for a specific patient
consultationNotes.get('/patient/:patientId', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const patientId = Number(c.req.param('patientId'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const list = await prisma.consultationNote.findMany({
        where: {
            patientId,
            doctorId
        },
        include: {
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

// Get a single consultation note
consultationNotes.get('/:id', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const id = Number(c.req.param('id'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const note = await prisma.consultationNote.findFirst({
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
            appointment: {
                select: {
                    id: true,
                    start: true
                }
            }
        }
    })

    if (!note) {
        return c.json({ error: 'Consultation note not found' }, 404)
    }

    return c.json(note)
})

// Create a new consultation note
consultationNotes.post('/',
    zValidator('json', CreateConsultationNoteSchema),
    async (c) => {
        const user = c.get('user')
        const doctorId = user.doctorId

        if (!doctorId) {
            return c.json({ error: 'Not a doctor' }, 403)
        }

        const data = c.req.valid('json')

        const note = await prisma.consultationNote.create({
            data: {
                doctorId,
                patientId: data.patientId,
                appointmentId: data.appointmentId,
                chiefComplaint: data.chiefComplaint,
                symptoms: data.symptoms ?? null,
                examination: data.examination ?? null,
                diagnosis: data.diagnosis,
                treatment: data.treatment ?? null,
                notes: data.notes ?? null,
                vitalSigns: data.vitalSigns ?? null
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

        return c.json(note, 201)
    }
)

// Update a consultation note
consultationNotes.patch('/:id',
    zValidator('json', CreateConsultationNoteSchema.partial()),
    async (c) => {
        const user = c.get('user')
        const doctorId = user.doctorId
        const id = Number(c.req.param('id'))

        if (!doctorId) {
            return c.json({ error: 'Not a doctor' }, 403)
        }

        const data = c.req.valid('json')

        // Verify ownership
        const existing = await prisma.consultationNote.findFirst({
            where: { id, doctorId }
        })

        if (!existing) {
            return c.json({ error: 'Consultation note not found' }, 404)
        }

        const updated = await prisma.consultationNote.update({
            where: { id },
            data: {
                ...(data.chiefComplaint ? { chiefComplaint: data.chiefComplaint } : {}),
                ...(data.symptoms ? { symptoms: data.symptoms } : {}),
                ...(data.examination ? { examination: data.examination } : {}),
                ...(data.diagnosis ? { diagnosis: data.diagnosis } : {}),
                ...(data.treatment ? { treatment: data.treatment } : {}),
                ...(data.notes ? { notes: data.notes } : {}),
                ...(data.vitalSigns ? { vitalSigns: data.vitalSigns } : {})
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

        return c.json(updated)
    }
)

// Delete a consultation note
consultationNotes.delete('/:id', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const id = Number(c.req.param('id'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    // Verify ownership
    const existing = await prisma.consultationNote.findFirst({
        where: { id, doctorId }
    })

    if (!existing) {
        return c.json({ error: 'Consultation note not found' }, 404)
    }

    await prisma.consultationNote.delete({
        where: { id }
    })

    return c.json({ message: 'Consultation note deleted' })
})
