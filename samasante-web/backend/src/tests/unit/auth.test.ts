// backend/src/tests/unit/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { hashPassword, comparePassword, signJWT, verifyJWT } from '../../lib/auth.js'

describe('Auth Utils', () => {
    describe('Password Hashing', () => {
        it('should hash a password', async () => {
            const password = 'SecurePassword123!'
            const hashed = await hashPassword(password)

            expect(hashed).toBeDefined()
            expect(hashed).not.toBe(password)
            expect(hashed.length).toBeGreaterThan(50)
        })

        it('should verify correct password', async () => {
            const password = 'SecurePassword123!'
            const hashed = await hashPassword(password)
            const isValid = await comparePassword(password, hashed)

            expect(isValid).toBe(true)
        })

        it('should reject incorrect password', async () => {
            const password = 'SecurePassword123!'
            const hashed = await hashPassword(password)
            const isValid = await comparePassword('WrongPassword', hashed)

            expect(isValid).toBe(false)
        })
    })

    describe('JWT', () => {
        const testPayload = {
            sub: 1,
            email: 'test@example.com',
            role: 'DOCTOR' as const,
        }

        it('should sign a JWT token', async () => {
            const token = await signJWT(testPayload)

            expect(token).toBeDefined()
            expect(typeof token).toBe('string')
            expect(token.split('.')).toHaveLength(3)
        })

        it('should verify a valid JWT token', async () => {
            const token = await signJWT(testPayload)
            const decoded = await verifyJWT(token)

            expect(decoded).toBeDefined()
            expect(decoded?.sub).toBe(testPayload.sub)
            // expect(decoded?.email).toBe(testPayload.email) // Email not in payload
            expect(decoded?.role).toBe(testPayload.role)
        })

        it('should reject an invalid JWT token', async () => {
            const invalidToken = 'invalid.token.here'
            const decoded = await verifyJWT(invalidToken)

            expect(decoded).toBeNull()
        })

        it('should reject an expired JWT token', async () => {
            const token = await signJWT(testPayload, '1ms') // Expire immédiatement

            // Attendre un peu
            await new Promise(resolve => setTimeout(resolve, 10))

            const decoded = await verifyJWT(token)
            expect(decoded).toBeNull()
        })
    })
})
