import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { hash, compare, signJwt } from '../lib/auth.js'

export const auth = new Hono()

// ... (RegisterSchema omitted for brevity if not changing)

// ... (Register route omitted)

// --- Login ---
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
}).strict()

auth.post('/login', zValidator('json', LoginSchema), async (c) => {
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

  return c.json({
    token,
    user: {
      id: u.id,
      email: u.email,
      role: u.role,
      doctor: u.doctor,
      patientId: u.patientId ?? null
    }
  })
})
