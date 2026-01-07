import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'

import type { HonoEnv } from '../types/env.js'

export const patients = new Hono<HonoEnv>()

const CreatePatient = z.object({
  firstName: z.string(),
  lastName: z.string(),
  dob: z.string().datetime(),
  phone: z.string().optional(),
  email: z.string().email().optional()
})

patients.get('/',
  requireAuth(['DOCTOR', 'ADMIN', 'SUPER_ADMIN', 'HOSPITAL_ADMIN']),
  async (c) => {
    const user = c.get('user') as any
    const q = c.req.query('q') || ''

    const where: any = {
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } }
      ]
    }

    // Si Hospital Admin, filtrer les patients qui ont des RDV avec les médecins de l'organisation
    if (user.role === 'HOSPITAL_ADMIN' && user.organizationId) {
      where.appointments = {
        some: {
          doctor: {
            organizationId: user.organizationId
          }
        }
      }
    }

    const list = await prisma.patient.findMany({
      where,
      take: 50,
      orderBy: { id: 'desc' }
    })
    return c.json(list)
  }
)

patients.post('/',
  requireAuth(['DOCTOR', 'ADMIN']),
  zValidator('json', CreatePatient),
  async (c) => {
    const b = c.req.valid('json')
    const p = await prisma.patient.create({
      data: {
        firstName: b.firstName,
        lastName: b.lastName,
        dob: new Date(b.dob),
        phone: b.phone ?? null,
        email: b.email ?? null,
        medicalFile: { create: {} }
      }
    })
    return c.json(p)
  }
)

patients.get('/:id',
  requireAuth(['DOCTOR', 'ADMIN', 'HOSPITAL_ADMIN']),
  async (c) => {
    const id = Number(c.req.param('id'))
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        medicalFile: true,
        appointments: {
          take: 5,
          orderBy: { start: 'desc' },
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
                specialty: true
              }
            }
          }
        }
      }
    })

    if (!patient) return c.json({ error: 'Patient not found' }, 404)
    return c.json(patient)
  }
)
