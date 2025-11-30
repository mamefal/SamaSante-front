import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'

import type { HonoEnv } from '../types/env.js'

export const referrals = new Hono<HonoEnv>()

// Require authentication
referrals.use('*', requireAuth())

// Validation schema
const CreateReferralSchema = z.object({
    patientId: z.number(),
    specialistName: z.string().min(3),
    specialty: z.string(),
    reason: z.string().min(10),
    urgency: z.enum(['normal', 'urgent']).default('normal'),
    clinicalSummary: z.string().optional(),
    investigations: z.string().optional()
})

// Get all referrals for a doctor
referrals.get('/', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const list = await prisma.referralLetter.findMany({
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

// Get a single referral
referrals.get('/:id', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const id = Number(c.req.param('id'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const referral = await prisma.referralLetter.findFirst({
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
            }
        }
    })

    if (!referral) {
        return c.json({ error: 'Referral not found' }, 404)
    }

    return c.json(referral)
})

// Create a new referral
referrals.post('/',
    zValidator('json', CreateReferralSchema),
    async (c) => {
        const user = c.get('user')
        const doctorId = user.doctorId

        if (!doctorId) {
            return c.json({ error: 'Not a doctor' }, 403)
        }

        const data = c.req.valid('json')

        const referral = await prisma.referralLetter.create({
            data: {
                doctorId,
                patientId: data.patientId,
                specialistName: data.specialistName,
                specialty: data.specialty,
                reason: data.reason,
                urgency: data.urgency,
                clinicalSummary: data.clinicalSummary,
                investigations: data.investigations
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

        return c.json(referral, 201)
    }
)

// Delete a referral
referrals.delete('/:id', async (c) => {
    const user = c.get('user')
    const doctorId = user.doctorId
    const id = Number(c.req.param('id'))

    if (!doctorId) {
        return c.json({ error: 'Not a doctor' }, 403)
    }

    const existing = await prisma.referralLetter.findFirst({
        where: { id, doctorId }
    })

    if (!existing) {
        return c.json({ error: 'Referral not found' }, 404)
    }

    await prisma.referralLetter.delete({
        where: { id }
    })

    return c.json({ message: 'Referral deleted' })
})
