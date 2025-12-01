import type { Context, Next } from 'hono'
import { verifyJwt } from '../lib/auth.js'
import type { HonoEnv, JwtUser } from '../types/env.js'

export const requireAuth = (roles?: JwtUser['role'][]) =>
  async (c: Context<HonoEnv>, next: Next) => {
    const auth = c.req.header('authorization')
    if (!auth?.startsWith('Bearer ')) return c.text('Unauthorized', 401)
    try {
      const payload = await verifyJwt(auth.slice(7)) as JwtUser
      c.set('user', payload)                      // ✅ maintenant typé
      if (roles && !roles.includes(payload.role)) {
        return c.text('Forbidden', 403)
      }
      await next()
    } catch {
      return c.text('Unauthorized', 401)
    }
  }
