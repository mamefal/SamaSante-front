import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { compress } from 'hono/compress'
import { logger } from 'hono/logger'
import { api } from './routes/index.js'
import { serve } from '@hono/node-server'
import type { HonoEnv } from './types/env.js'
import swaggerRoutes from './routes/swagger.js'
import { health } from './routes/health.js'

const app = new Hono<HonoEnv>()

// Configure CORS with specific origin
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true, // IMPORTANT : Permet l'envoi de cookies
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', compress())
app.use('*', logger())
app.get('/', (c) => c.text('SamaSanté API OK'))
app.route('/health', health)
app.route('/api', api)
app.route('/api/docs', swaggerRoutes)
app.notFound((c) => c.text('Not Found', 404))
app.onError((err, c) => {
  console.error(err)
  return c.text('Internal Server Error', 500)
})

const port = Number(process.env.PORT || 3000)
serve({ fetch: app.fetch, port })
console.log(`API running on http://localhost:${port}`)

