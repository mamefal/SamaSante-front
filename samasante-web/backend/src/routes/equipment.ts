import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

export const equipment = new Hono<HonoEnv>()

// Schema de validation
const EquipmentSchema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    department: z.string().optional(),
    serialNumber: z.string().optional(),
    status: z.enum(['operational', 'maintenance', 'broken']).default('operational'),
    lastMaintenance: z.string().datetime().optional(),
    nextMaintenance: z.string().datetime().optional(),
})

// GET / - Lister les équipements (filtrable par status, type)
equipment.get('/',
    requireAuth(['HOSPITAL_ADMIN', 'ADMIN', 'DOCTOR']),
    async (c) => {
        const user = c.get('user') as any
        const organizationId = user.organizationId

        if (!organizationId) return c.json({ error: 'No organization linked' }, 400)

        const status = c.req.query('status')
        const type = c.req.query('type')
        const search = c.req.query('search')

        const where: any = { organizationId }
        if (status) where.status = status
        if (type) where.type = type
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { serialNumber: { contains: search } }
            ]
        }

        const items = await prisma.equipment.findMany({
            where,
            orderBy: { updatedAt: 'desc' }
        })

        return c.json(items)
    }
)

// POST / - Ajouter un équipement
equipment.post('/',
    requireAuth(['HOSPITAL_ADMIN', 'ADMIN']),
    zValidator('json', EquipmentSchema),
    async (c) => {
        const user = c.get('user') as any
        const data = c.req.valid('json')

        if (!user.organizationId) return c.json({ error: 'No organization linked' }, 400)

        const item = await prisma.equipment.create({
            data: {
                ...data,
                organizationId: user.organizationId,
                lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : null,
                nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : null,
            }
        })

        return c.json(item)
    }
)

// PUT /:id - Modifier un équipement
equipment.put('/:id',
    requireAuth(['HOSPITAL_ADMIN', 'ADMIN']),
    zValidator('json', EquipmentSchema.partial()),
    async (c) => {
        const id = Number(c.req.param('id'))
        const data = c.req.valid('json')
        const user = c.get('user') as any

        const existing = await prisma.equipment.findFirst({
            where: { id, organizationId: user.organizationId }
        })
        if (!existing) return c.json({ error: 'Not found' }, 404)

        const updated = await prisma.equipment.update({
            where: { id },
            data: {
                ...data,
                lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : undefined,
                nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : undefined,
            }
        })

        return c.json(updated)
    }
)

// DELETE /:id - Supprimer un équipement
equipment.delete('/:id',
    requireAuth(['HOSPITAL_ADMIN', 'ADMIN']),
    async (c) => {
        const id = Number(c.req.param('id'))
        const user = c.get('user') as any

        const existing = await prisma.equipment.findFirst({
            where: { id, organizationId: user.organizationId }
        })
        if (!existing) return c.json({ error: 'Not found' }, 404)

        await prisma.equipment.delete({ where: { id } })
        return c.json({ success: true })
    }
)
