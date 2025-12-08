// backend/src/tests/unit/refresh-token.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma.js'
import {
    generateRefreshToken,
    createRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    rotateRefreshToken,
} from '../../lib/refresh-token.js'

describe('Refresh Token Service', () => {
    let testUserId: number

    beforeEach(async () => {
        // Créer un utilisateur de test
        const user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                password: 'hashed_password',
                role: 'DOCTOR',
            },
        })
        testUserId = user.id
    })

    describe('generateRefreshToken', () => {
        it('should generate a random token', () => {
            const token1 = generateRefreshToken()
            const token2 = generateRefreshToken()

            expect(token1).toBeDefined()
            expect(token2).toBeDefined()
            expect(token1).not.toBe(token2)
            expect(token1.length).toBe(128) // 64 bytes en hex
        })
    })

    describe('createRefreshToken', () => {
        it('should create a refresh token for a user', async () => {
            const token = await createRefreshToken(testUserId)

            expect(token).toBeDefined()

            const dbToken = await prisma.refreshToken.findUnique({
                where: { token },
            })

            expect(dbToken).toBeDefined()
            expect(dbToken?.userId).toBe(testUserId)
            expect(dbToken?.revokedAt).toBeNull()
        })
    })

    describe('verifyRefreshToken', () => {
        it('should verify a valid token', async () => {
            const token = await createRefreshToken(testUserId)
            const result = await verifyRefreshToken(token)

            expect(result).toBeDefined()
            expect(result?.userId).toBe(testUserId)
            expect(result?.user.email).toBe('test@example.com')
        })

        it('should return null for invalid token', async () => {
            const result = await verifyRefreshToken('invalid_token')

            expect(result).toBeNull()
        })

        it('should return null for revoked token', async () => {
            const token = await createRefreshToken(testUserId)
            await revokeRefreshToken(token)

            const result = await verifyRefreshToken(token)

            expect(result).toBeNull()
        })
    })

    describe('rotateRefreshToken', () => {
        it('should create new token and revoke old one', async () => {
            const oldToken = await createRefreshToken(testUserId)
            const newToken = await rotateRefreshToken(oldToken)

            expect(newToken).toBeDefined()
            expect(newToken).not.toBe(oldToken)

            // Ancien token révoqué
            const oldTokenData = await prisma.refreshToken.findUnique({
                where: { token: oldToken },
            })
            expect(oldTokenData?.revokedAt).not.toBeNull()
            expect(oldTokenData?.replacedBy).toBe(newToken)

            // Nouveau token valide
            const newTokenData = await verifyRefreshToken(newToken!)
            expect(newTokenData).toBeDefined()
        })
    })
})
