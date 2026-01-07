import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'
import type { HonoEnv } from '../types/env.js'

const rooms = new Hono<HonoEnv>()

rooms.use('*', requireAuth(['HOSPITAL_ADMIN', 'DOCTOR']))

// Get all rooms for an organization
rooms.get('/', async (c) => {
    const user = c.get('user') as any
    const organizationId = user.organizationId

    const list = await prisma.room.findMany({
        where: { organizationId },
        include: {
            beds: true,
            department: {
                select: { name: true }
            }
        }
    })
    return c.json(list)
})

const CreateRoomSchema = z.object({
    number: z.string(),
    type: z.string(),
    departmentId: z.number(),
    bedCount: z.number().default(1)
})

// Create a room with beds
rooms.post('/', zValidator('json', CreateRoomSchema), async (c) => {
    const user = c.get('user') as any
    const organizationId = user.organizationId
    const { number, type, departmentId, bedCount } = c.req.valid('json')

    const room = await prisma.room.create({
        data: {
            number,
            type,
            departmentId,
            organizationId,
            beds: {
                create: Array.from({ length: bedCount }).map((_, i) => ({
                    number: `Bed ${i + 1}`,
                    status: 'available'
                }))
            }
        },
        include: { beds: true }
    })

    return c.json(room, 201)
})

// Update bed status
rooms.patch('/beds/:id/status', zValidator('json', z.object({ status: z.string() })), async (c) => {
    const id = parseInt(c.req.param('id'))
    const { status } = c.req.valid('json')

    const bed = await prisma.bed.update({
        where: { id },
        data: { status }
    })

    return c.json(bed)
})

export default rooms
