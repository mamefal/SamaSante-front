// backend/src/lib/two-factor.ts
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import crypto from 'crypto'
import { prisma } from './prisma.js'

const APP_NAME = 'AMINA'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

// Validation stricte de la clé de chiffrement
if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY must be set in environment variables')
}

if (ENCRYPTION_KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long')
}

const KEY = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))

/**
 * Encrypt data using AES-256
 */
function encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        KEY,
        iv
    )
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt data
 */
function decrypt(text: string): string {
    const parts = text.split(':')
    const iv = Buffer.from(parts[0] || '', 'hex')
    const encryptedText = parts[1] || ''
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        KEY,
        iv
    )
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

/**
 * Génère un secret TOTP et un QR code
 */
export async function generate2FASecret(userId: number, userEmail: string) {
    // Générer un secret
    const secret = authenticator.generateSecret()

    // Créer l'URL otpauth
    const otpauthUrl = authenticator.keyuri(userEmail, APP_NAME, secret)

    // Générer le QR code
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)

    // Générer des codes de backup
    const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
    )

    // Sauvegarder dans la base (encrypted)
    await prisma.twoFactorSecret.upsert({
        where: { userId },
        create: {
            userId,
            secret: encrypt(secret),
            backupCodes: encrypt(JSON.stringify(backupCodes)),
            enabled: false,
        },
        update: {
            secret: encrypt(secret),
            backupCodes: encrypt(JSON.stringify(backupCodes)),
        },
    })

    return {
        secret,
        qrCode: qrCodeDataUrl,
        backupCodes,
    }
}

/**
 * Vérifie un code TOTP
 */
export async function verify2FACode(userId: number, token: string): Promise<boolean> {
    const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
        where: { userId },
    })

    if (!twoFactorSecret || !twoFactorSecret.enabled) {
        return false
    }

    try {
        const secret = decrypt(twoFactorSecret.secret)

        // Vérifier le code TOTP
        const isValid = authenticator.verify({
            token,
            secret,
        })

        if (isValid) {
            return true
        }

        // Vérifier les backup codes
        if (twoFactorSecret.backupCodes) {
            const backupCodes = JSON.parse(decrypt(twoFactorSecret.backupCodes)) as string[]

            if (backupCodes.includes(token.toUpperCase())) {
                // Retirer le code utilisé
                const updatedCodes = backupCodes.filter(code => code !== token.toUpperCase())

                await prisma.twoFactorSecret.update({
                    where: { userId },
                    data: {
                        backupCodes: encrypt(JSON.stringify(updatedCodes)),
                    },
                })

                return true
            }
        }

        return false
    } catch (error) {
        console.error('2FA verification error:', error)
        return false
    }
}

/**
 * Active le 2FA pour un utilisateur
 */
export async function enable2FA(userId: number, verificationCode: string): Promise<boolean> {
    const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
        where: { userId },
    })

    if (!twoFactorSecret) {
        return false
    }

    try {
        const secret = decrypt(twoFactorSecret.secret)

        // Vérifier le code avant d'activer
        const isValid = authenticator.verify({
            token: verificationCode,
            secret,
        })

        if (isValid) {
            await prisma.twoFactorSecret.update({
                where: { userId },
                data: { enabled: true },
            })
            return true
        }

        return false
    } catch (error) {
        console.error('2FA enable error:', error)
        return false
    }
}

/**
 * Désactive le 2FA
 */
export async function disable2FA(userId: number): Promise<void> {
    await prisma.twoFactorSecret.update({
        where: { userId },
        data: { enabled: false },
    })
}

/**
 * Vérifie si le 2FA est activé pour un utilisateur
 */
export async function is2FAEnabled(userId: number): Promise<boolean> {
    const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
        where: { userId },
    })

    return twoFactorSecret?.enabled ?? false
}

/**
 * Régénère les backup codes
 */
export async function regenerateBackupCodes(userId: number): Promise<string[]> {
    const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
    )

    await prisma.twoFactorSecret.update({
        where: { userId },
        data: {
            backupCodes: encrypt(JSON.stringify(backupCodes)),
        },
    })

    return backupCodes
}
