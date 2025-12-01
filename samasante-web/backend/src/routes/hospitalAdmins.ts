// src/routes/hospitalAdmins.ts
import { Hono } from 'hono'
import { z } from 'zod'
import type { HonoEnv } from '../types/env'
import { prisma } from '../lib/prisma.js'
import bcrypt from 'bcryptjs'

const app = new Hono<HonoEnv>()

// Get all hospital admins
app.get('/', async (c) => {
    try {
        const admins = await prisma.user.findMany({
            where: {
                role: 'HOSPITAL_ADMIN'
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return c.json(admins)
    } catch (error) {
        console.error('Error fetching hospital admins:', error)
        return c.json({ error: 'Failed to fetch hospital admins' }, 500)
    }
})

// Create hospital admin
const createAdminSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
    phone: z.string().optional(),
    organizationId: z.number()
})

app.post('/', async (c) => {
    try {
        const body = await c.req.json()
        const data = createAdminSchema.parse(body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            return c.json({ error: 'User already exists' }, 400)
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10)

        // Create user
        const admin = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                role: 'HOSPITAL_ADMIN',
                organizationId: data.organizationId
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return c.json(admin, 201)
    } catch (error) {
        console.error('Error creating hospital admin:', error)
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Invalid data', details: error.errors }, 400)
        }
        return c.json({ error: 'Failed to create hospital admin' }, 500)
    }
})

// Update hospital admin
app.put('/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'))
        const body = await c.req.json()

        const admin = await prisma.user.update({
            where: { id },
            data: {
                name: body.name,
                phone: body.phone,
                email: body.email,
                organizationId: body.organizationId
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return c.json(admin)
    } catch (error) {
        console.error('Error updating hospital admin:', error)
        return c.json({ error: 'Failed to update hospital admin' }, 500)
    }
})

// Toggle admin status
app.patch('/:id/status', async (c) => {
    try {
        const id = parseInt(c.req.param('id'))
        const body = await c.req.json()

        const admin = await prisma.user.update({
            where: { id },
            data: {
                isActive: body.isActive
            }
        })

        return c.json(admin)
    } catch (error) {
        console.error('Error toggling admin status:', error)
        return c.json({ error: 'Failed to toggle admin status' }, 500)
    }
})

// Reset password
app.post('/:id/reset-password', async (c) => {
    try {
        const id = parseInt(c.req.param('id'))

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(tempPassword, 10)

        await prisma.user.update({
            where: { id },
            data: {
                password: hashedPassword,
                // In production, set a flag to force password change on next login
            }
        })

        // In production, send email with temporary password
        return c.json({
            message: 'Password reset successfully',
            tempPassword // Remove this in production
        })
    } catch (error) {
        console.error('Error resetting password:', error)
        return c.json({ error: 'Failed to reset password' }, 500)
    }
})

// Delete hospital admin
app.delete('/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'))

        await prisma.user.delete({
            where: { id }
        })

        return c.json({ message: 'Hospital admin deleted successfully' })
    } catch (error) {
        console.error('Error deleting hospital admin:', error)
        return c.json({ error: 'Failed to delete hospital admin' }, 500)
    }
})

export default app
