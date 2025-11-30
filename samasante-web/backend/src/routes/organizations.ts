import { Hono } from 'hono'
import { prisma } from '../lib/prisma'
import { tenantMiddleware, getOrganizationFilter } from '../middleware/tenant'
import { requireAuth } from '../middlewares/auth'

import type { HonoEnv } from '../types/env.js'

export const organizations = new Hono<HonoEnv>()

// Require authentication first
organizations.use('*', requireAuth())

// Seul Super Admin peut gérer les organisations
organizations.use('*', tenantMiddleware)

// Liste toutes les organisations (Super Admin only)
organizations.get('/', async (c) => {
    const isSuperAdmin = c.get('isSuperAdmin')

    if (!isSuperAdmin) {
        return c.json({ error: 'Forbidden' }, 403)
    }

    const orgs = await prisma.organization.findMany({
        include: {
            _count: {
                select: {
                    doctors: true,
                    patients: true,
                    users: true
                }
            }
        },
        orderBy: { name: 'asc' }
    })

    return c.json(orgs)
})

// Détails d'une organisation
organizations.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const isSuperAdmin = c.get('isSuperAdmin')
    const userOrgId = c.get('organizationId')

    // Super Admin voit tout, autres voient uniquement leur org
    if (!isSuperAdmin && userOrgId !== id) {
        return c.json({ error: 'Forbidden' }, 403)
    }

    const org = await prisma.organization.findUnique({
        where: { id },
        include: {
            doctors: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    specialty: true,
                    status: true
                }
            },
            _count: {
                select: {
                    patients: true,
                    users: true
                }
            }
        }
    })

    if (!org) {
        return c.json({ error: 'Organization not found' }, 404)
    }

    return c.json(org)
})

// Créer une organisation (Super Admin only)
organizations.post('/', async (c) => {
    const isSuperAdmin = c.get('isSuperAdmin')

    if (!isSuperAdmin) {
        return c.json({ error: 'Forbidden' }, 403)
    }

    const body = await c.req.json()

    const org = await prisma.organization.create({
        data: {
            name: body.name,
            slug: body.slug,
            type: body.type,
            region: body.region,
            city: body.city,
            address: body.address,
            phone: body.phone,
            email: body.email
        }
    })

    return c.json(org, 201)
})

// Mettre à jour une organisation
organizations.patch('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const isSuperAdmin = c.get('isSuperAdmin')
    const userOrgId = c.get('organizationId')

    // Super Admin ou Hospital Admin de cette org seulement
    if (!isSuperAdmin && userOrgId !== id) {
        return c.json({ error: 'Forbidden' }, 403)
    }

    const body = await c.req.json()

    const org = await prisma.organization.update({
        where: { id },
        data: {
            name: body.name,
            type: body.type,
            region: body.region,
            city: body.city,
            address: body.address,
            phone: body.phone,
            email: body.email
        }
    })

    return c.json(org)
})
