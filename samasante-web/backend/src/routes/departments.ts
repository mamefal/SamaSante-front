import { Hono } from 'hono'
import { prisma as db } from '../lib/prisma.js'

import type { HonoEnv } from '../types/env.js'

export const departments = new Hono<HonoEnv>()

// Get all departments for an organization
departments.get('/', async (c) => {
    try {
        const { organizationId } = c.req.query()

        const where = organizationId ? { organizationId: Number(organizationId) } : {}

        const depts = await db.department.findMany({
            where,
            include: {
                _count: {
                    select: { doctors: true }
                }
            },
            orderBy: { name: 'asc' }
        })

        return c.json(depts)
    } catch (error) {
        console.error('Error fetching departments:', error)
        return c.json({ error: 'Error fetching departments' }, 500)
    }
})

// Create a new department
departments.post('/', async (c) => {
    try {
        const { name, description, organizationId } = await c.req.json()

        if (!name || !organizationId) {
            return c.json({ error: 'Name and Organization ID are required' }, 400)
        }

        const department = await db.department.create({
            data: {
                name,
                description,
                organizationId: Number(organizationId)
            }
        })

        return c.json(department)
    } catch (error) {
        console.error('Error creating department:', error)
        return c.json({ error: 'Error creating department' }, 500)
    }
})

// Update a department
departments.put('/:id', async (c) => {
    try {
        const id = c.req.param('id')
        const { name, description, headDoctorId } = await c.req.json()

        const department = await db.department.update({
            where: { id: Number(id) },
            data: {
                name,
                description,
                headDoctorId: headDoctorId ? Number(headDoctorId) : null
            }
        })

        return c.json(department)
    } catch (error) {
        console.error('Error updating department:', error)
        return c.json({ error: 'Error updating department' }, 500)
    }
})

// Delete a department
departments.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id')

        await db.department.delete({
            where: { id: Number(id) }
        })

        return c.json({ success: true })
    } catch (error) {
        console.error('Error deleting department:', error)
        return c.json({ error: 'Error deleting department' }, 500)
    }
})
