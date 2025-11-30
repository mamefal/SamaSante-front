import { Hono } from 'hono'
import { prisma as db } from '../lib/prisma.js'

import type { HonoEnv } from '../types/env.js'

export const superAdmin = new Hono<HonoEnv>()

// Get all organizations
superAdmin.get('/organizations', async (c) => {
    try {
        const orgs = await db.organization.findMany({
            include: {
                _count: {
                    select: {
                        doctors: true,
                        patients: true,
                        users: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return c.json(orgs)
    } catch (error) {
        console.error('Error fetching organizations:', error)
        return c.json({ error: 'Error fetching organizations' }, 500)
    }
})

// Create a new organization
superAdmin.post('/organizations', async (c) => {
    try {
        const { name, slug, type, region, city, address, phone, email } = await c.req.json()

        if (!name || !slug || !type) {
            return c.json({ error: 'Name, slug, and type are required' }, 400)
        }

        const org = await db.organization.create({
            data: {
                name,
                slug,
                type,
                region: region || '',
                city: city || '',
                address,
                phone,
                email
            }
        })

        return c.json(org)
    } catch (error) {
        console.error('Error creating organization:', error)
        return c.json({ error: 'Error creating organization' }, 500)
    }
})

// Update organization
superAdmin.put('/organizations/:id', async (c) => {
    try {
        const id = c.req.param('id')
        const data = await c.req.json()

        const org = await db.organization.update({
            where: { id: Number(id) },
            data
        })

        return c.json(org)
    } catch (error) {
        console.error('Error updating organization:', error)
        return c.json({ error: 'Error updating organization' }, 500)
    }
})

// Get platform statistics
superAdmin.get('/stats', async (c) => {
    try {
        const [
            totalOrganizations,
            activeOrganizations,
            totalDoctors,
            totalPatients,
            totalAppointments
        ] = await Promise.all([
            db.organization.count(),
            db.organization.count({ where: { isActive: true } }),
            db.doctor.count(),
            db.patient.count(),
            db.appointment.count()
        ])

        return c.json({
            totalOrganizations,
            activeOrganizations,
            totalDoctors,
            totalPatients,
            totalAppointments
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        return c.json({ error: 'Error fetching stats' }, 500)
    }
})
