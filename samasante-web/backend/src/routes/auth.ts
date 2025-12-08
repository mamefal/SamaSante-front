import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { hash, compare, signJwt } from '../lib/auth.js'
import { rateLimiter } from 'hono-rate-limiter'

export const auth = new Hono()

// ... (RegisterSchema omitted for brevity if not changing)

// ... (Register route omitted)

// --- Login ---
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
}).strict()

auth.post('/login',
  // @ts-ignore
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 requests per windowMs
    standardHeaders: 'draft-6',
    keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'unknown',
    message: 'Too many login attempts, please try again after 15 minutes'
  }),
  zValidator('json', LoginSchema),
  async (c) => {
    const { email, password } = c.req.valid('json')

    const u = await prisma.user.findUnique({
      where: { email },
      include: { doctor: true }
    })

    if (!u || !compare(password, u.password)) {
      return c.text('Invalid credentials', 401)
    }

    const token = await signJwt({
      sub: u.id,
      role: u.role,
      doctorId: u.doctorId ?? null,
      patientId: u.patientId ?? null
    })

    // Set secure HttpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production'
    c.header('Set-Cookie', `token=${token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict${isProduction ? '; Secure' : ''}`)

    // Return user info only (token is in cookie)
    return c.json({
      user: {
        id: u.id,
        email: u.email,
        role: u.role,
        doctor: u.doctor,
        patientId: u.patientId ?? null
      }
    })
  })
