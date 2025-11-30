import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'

import type { HonoEnv } from '../types/env.js'

export const labOrders = new Hono<HonoEnv>()

// Require authentication
labOrders.use('*', requireAuth())

// Validation schemas
const CreateLabOrderSchema = z.object({
    patientId: z.number(),
    appointmentId: z.number().optional(),
    urgency: z.enum(['normal', 'urgent', 'stat']).default('normal'),
    tests: z.array(z.object({
        testName: z.string().min(2),
        testCode: z.string().optional(),
        category: z.string()
    })).min(1)
})

const UpdateLabOrderSchema = z.object({
    status: z.enum(['pending', 'completed', 'cancelled']).optional(),
    results: z.string().optional(),
    resultDate: z.string().optional()
})

// Get all lab orders for a doctor
labOrders.get('/', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const list = await prisma.labOrder.findMany({
        where: { doctorId },
        include: {
            patient: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            },
            tests: true,
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

// Get lab orders for a specific patient
labOrders.get('/patient/:patientId', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const patientId = Number(c.req.param('patientId'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const list = await prisma.labOrder.findMany({
        where: {
            patientId,
            doctorId
        },
        include: {
            tests: true,
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

// Get a single lab order by ID
labOrders.get('/:id', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const id = Number(c.req.param('id'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const labOrder = await prisma.labOrder.findFirst({
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
                    specialty: true
                }
            },
            tests: true,
            appointment: {
                select: {
                    id: true,
                    start: true
                }
            }
        }
    })

    if (!labOrder) {
        return c.json({ error: 'Lab order not found' }, 404)
    }

    return c.json(labOrder)
})

// Create a new lab order
labOrders.post('/',
    zValidator('json', CreateLabOrderSchema),
    async (c) => {
        const user = c.get('user')
        const doctorId = user.doctorId

        if (!doctorId) {
            return c.json({ error: 'Not a doctor' }, 403)
        }

        const data = c.req.valid('json')

        const labOrder = await prisma.labOrder.create({
            data: {
                doctorId,
                patientId: data.patientId,
                appointmentId: data.appointmentId ?? null,
                urgency: data.urgency,
                tests: {
                    create: data.tests.map(t => ({
                        testName: t.testName,
                        category: t.category,
                        testCode: t.testCode ?? null
                    }))
                }
            },
            include: {
                tests: true,
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        return c.json(labOrder, 201)
    }
)

// Update a lab order (for adding results)
labOrders.patch('/:id',
    zValidator('json', UpdateLabOrderSchema),
    async (c) => {
        const user = c.get('user')
        const doctorId = user.doctorId
        const id = Number(c.req.param('id'))

        if (!doctorId) {
            return c.json({ error: 'Not a doctor' }, 403)
        }

        const data = c.req.valid('json')

        // Verify ownership
        const existing = await prisma.labOrder.findFirst({
            where: { id, doctorId }
        })

        if (!existing) {
            return c.json({ error: 'Lab order not found' }, 404)
        }

        const updated = await prisma.labOrder.update({
            where: { id },
            data: {
                ...(data.status ? { status: data.status } : {}),
                ...(data.results ? { results: data.results } : {}),
                ...(data.resultDate ? { resultDate: new Date(data.resultDate) } : {})
            },
            include: {
                tests: true,
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

// Delete a lab order
labOrders.delete('/:id', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const id = Number(c.req.param('id'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    // Verify ownership
    const existing = await prisma.labOrder.findFirst({
        where: { id, doctorId }
    })

    if (!existing) {
        return c.json({ error: 'Lab order not found' }, 404)
    }

    await prisma.labOrder.delete({
        where: { id }
    })

    return c.json({ message: 'Lab order deleted' })
})
