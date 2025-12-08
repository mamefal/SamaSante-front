import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import { tenantMiddleware, getOrganizationFilter } from '../middleware/tenant.js'

import type { HonoEnv } from '../types/env.js'

export const doctors = new Hono<HonoEnv>()

// Require authentication first
doctors.use('*', requireAuth())

// Apply tenant middleware to all routes
doctors.use('*', tenantMiddleware)

doctors.get('/', async (c) => {
  const q = c.req.query('q') || ''
  const orgFilter = getOrganizationFilter(c)

  const list = await prisma.doctor.findMany({
    where: {
      ...orgFilter, // Filtre par organisation
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { specialty: { contains: q } }
      ]
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    take: 50
  })
  return c.json(list)
})

// Get doctor statistics for dashboard
doctors.get('/stats', async (c) => {
  // Return empty stats instead of real data
  return c.json({
    totalPatients: 0,
    todayAppointments: [],
    weeklyAppointments: [],
    recentActivity: []
  })
})

const VerifySchema = z.object({
  ordreNumber: z.string().min(3),
  kycScore: z.number().min(0).max(100)
})

doctors.post('/:id/verify',
  requireAuth(['SUPER_ADMIN']), // Seul Super Admin peut vérifier
  zValidator('json', VerifySchema),
  async (c) => {
    const id = Number(c.req.param('id'))
    const { ordreNumber, kycScore } = c.req.valid('json')
    const d = await prisma.doctor.update({
      where: { id },
      data: { ordreNumber, kycScore, status: 'verified', verifiedAt: new Date() }
    })
    return c.json(d)
  }
)
