import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

const suppliers = new Hono<HonoEnv>()

suppliers.use('*', requireAuth(['HOSPITAL_ADMIN']))

// Get all suppliers
suppliers.get('/', async (c) => {
    const user = c.get('user') as any
    const organizationId = user.organizationId

    const list = await prisma.supplier.findMany({
        where: { organizationId }
    })
    return c.json(list)
})

const CreateSupplierSchema = z.object({
    name: z.string(),
    contactName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional()
})

// Create a supplier
suppliers.post('/', zValidator('json', CreateSupplierSchema), async (c) => {
    const user = c.get('user') as any
    const organizationId = user.organizationId
    const data = c.req.valid('json')

    const supplier = await prisma.supplier.create({
        data: {
            ...data,
            organizationId
        }
    })

    return c.json(supplier, 201)
})

export default suppliers
