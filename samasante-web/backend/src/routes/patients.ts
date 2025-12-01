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
  requireAuth(['DOCTOR', 'ADMIN', 'SUPER_ADMIN']),
  async (c) => {
    const q = c.req.query('q') || ''
    const list = await prisma.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { email: { contains: q } }
        ]
      },
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
