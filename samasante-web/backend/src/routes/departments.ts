import { Hono } from 'hono'
import { prisma as db } from '../lib/prisma.js'
import { requireAuth } from '../middlewares/auth.js'

import type { HonoEnv } from '../types/env.js'

export const departments = new Hono<HonoEnv>()

// Get all departments for an organization
departments.get('/', requireAuth(['HOSPITAL_ADMIN', 'DOCTOR', 'ADMIN']), async (c) => {
    try {
        const user = c.get('user') as any
        const organizationId = user.organizationId

        const where = organizationId ? { organizationId: Number(organizationId) } : {}

        const depts = await db.department.findMany({
            where,
            include: {
                _count: {
                    select: { doctors: true }
                },
                // We need to fetch the head doctor if headDoctorId exists
                // But since headDoctor is not a direct relation in the schema (it's an Int?), let's check schema.
                // Schema says: headDoctorId Int?
                // There is no relation defined in schema for headDoctor.
                // We should probably add a relation or fetch it manually.
                // For now, let's just return the ID and handle it in frontend or add relation.
                // Actually, let's look at the schema again.
                // model Department { headDoctorId Int? ... }
                // No relation to Doctor.
                // I should probably add a relation to make it easier, but I don't want to change schema again right now if I can avoid it.
                // But wait, I just changed schema for Emergency.
                // If I want to show the head doctor name, I need a relation.
                // Or I can fetch it separately.
                // Let's check if I can add relation quickly or just use ID.
                // The plan said "Improve Departments UI & Head Doctor".
                // I'll stick to what I have. I can fetch doctors list in frontend and map ID to name.
            },
            orderBy: { name: 'asc' }
        })

        // If we want to return head doctor details, we might need to fetch them.
        // Let's keep it simple for now.
        return c.json(depts)


    } catch (error) {
        console.error('Error fetching departments:', error)
        return c.json({ error: 'Error fetching departments' }, 500)
    }
})

// Create a new department
departments.post('/', requireAuth(['HOSPITAL_ADMIN']), async (c) => {
    try {
        const user = c.get('user') as any
        const organizationId = user.organizationId
        const body = await c.req.json()
        const { name, description } = body

        if (!name || !organizationId) {
            return c.json({ error: 'Name and Organization ID are required' }, 400)
        }

        const department = await db.department.create({
            data: {
                name,
                description,
                organizationId: Number(organizationId),
                headDoctorId: body.headDoctorId ? Number(body.headDoctorId) : null
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
