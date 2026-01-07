import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

const purchaseOrders = new Hono<HonoEnv>()

purchaseOrders.use('*', requireAuth(['HOSPITAL_ADMIN']))

// Get all purchase orders
purchaseOrders.get('/', async (c) => {
    const user = c.get('user') as any
    const organizationId = user.organizationId

    const list = await prisma.purchaseOrder.findMany({
        where: { organizationId },
        include: {
            supplier: true,
            items: true
        }
    })
    return c.json(list)
})

const CreatePOSchema = z.object({
    supplierId: z.number(),
    items: z.array(z.object({
        medicationName: z.string(),
        quantity: z.number(),
        unitPrice: z.number()
    }))
})

// Create a purchase order
purchaseOrders.post('/', zValidator('json', CreatePOSchema), async (c) => {
    const user = c.get('user') as any
    const organizationId = user.organizationId
    const { supplierId, items } = c.req.valid('json')

    const orderNumber = `PO-${Date.now()}`
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

    const order = await prisma.purchaseOrder.create({
        data: {
            orderNumber,
            supplierId,
            organizationId,
            totalAmount,
            status: 'pending',
            items: {
                create: items
            }
        },
        include: { items: true, supplier: true }
    })

    return c.json(order, 201)
})

export default purchaseOrders
