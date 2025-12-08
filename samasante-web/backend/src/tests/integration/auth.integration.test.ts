// backend/src/tests/integration/auth.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { auth as authRoutes } from '../../routes/auth.js'
import { prisma } from '../../lib/prisma.js'
import { hashPassword } from '../../lib/auth.js'

describe('Auth Integration Tests', () => {
    let app: Hono
    let testUser: any

    beforeEach(async () => {
        app = new Hono()
        app.route('/auth', authRoutes)

        // Créer un utilisateur de test
        testUser = await prisma.user.create({
            data: {
                email: 'doctor@test.com',
                password: await hashPassword('Password123!'),
                name: 'Dr. Test',
                role: 'DOCTOR',
            },
        })
    })

    describe('POST /auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await app.request('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'doctor@test.com',
                    password: 'Password123!',
                }),
            })

            expect(res.status).toBe(200)

            const data = await res.json()
            expect(data.user).toBeDefined()
            expect(data.user.email).toBe('doctor@test.com')
            expect(data.user.role).toBe('DOCTOR')
            expect(data.token).toBeDefined()

            // Vérifier les cookies
            const cookies = res.headers.get('set-cookie')
            expect(cookies).toContain('token=')
            expect(cookies).toContain('HttpOnly')
            expect(cookies).toContain('SameSite=Strict')
        })

        it('should reject invalid email', async () => {
            const res = await app.request('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'wrong@test.com',
                    password: 'Password123!',
                }),
            })

            expect(res.status).toBe(401)

            const data = await res.json()
            expect(data.error).toBeDefined()
        })

        it('should reject invalid password', async () => {
            const res = await app.request('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'doctor@test.com',
                    password: 'WrongPassword',
                }),
            })

            expect(res.status).toBe(401)

            const data = await res.json()
            expect(data.error).toBeDefined()
        })

        it('should validate input format', async () => {
            const res = await app.request('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'not-an-email',
                    password: '123',
                }),
            })

            expect(res.status).toBe(400)
        })
    })

    describe('POST /auth/register', () => {
        it('should register a new patient', async () => {
            const res = await app.request('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'newpatient@test.com',
                    password: 'SecurePass123!',
                    firstName: 'New',
                    lastName: 'Patient',
                    dob: '1995-05-15',
                }),
            })

            expect(res.status).toBe(201)

            const data = await res.json()
            expect(data.user).toBeDefined()
            expect(data.user.email).toBe('newpatient@test.com')
            expect(data.user.role).toBe('PATIENT')
        })

        it('should reject duplicate email', async () => {
            const res = await app.request('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'doctor@test.com', // Already exists
                    password: 'SecurePass123!',
                    firstName: 'Test',
                    lastName: 'User',
                    dob: '1990-01-01',
                }),
            })

            expect(res.status).toBe(400)

            const data = await res.json()
            expect(data.error).toContain('exists')
        })
    })
})
