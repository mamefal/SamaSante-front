// backend/src/lib/encryption.ts
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const ALGORITHM = 'aes-256-cbc'

// Validation stricte de la clé de chiffrement
if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY must be set in environment variables')
}

if (ENCRYPTION_KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long')
}

// S'assurer que la clé fait exactement 32 caractères
const KEY = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))

/**
 * Encrypts sensitive data
 */
export function encryptData(text: string): string {
    if (!text) return text

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Retourner IV:encrypted
    return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypts sensitive data
 */
export function decryptData(encryptedText: string): string {
    if (!encryptedText) return encryptedText

    try {
        const parts = encryptedText.split(':')
        if (parts.length !== 2) {
            // Pas encrypté, retourner tel quel
            return encryptedText
        }

        const iv = Buffer.from(parts[0] || '', 'hex')
        const encrypted = parts[1] || ''

        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)

        let decrypted = decipher.update(encrypted, 'hex', 'utf8')
        decrypted += decipher.final('utf8')

        return decrypted
    } catch (error) {
        console.error('Decryption error:', error)
        // En production, on devrait logger et potentiellement alerter
        // plutôt que de retourner silencieusement le texte chiffré
        throw new Error('Failed to decrypt data')
    }
}

/**
 * Hash sensitive data (one-way)
 */
export function hashData(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex')
}

/**
 * Encrypt medical notes
 */
export function encryptMedicalNote(note: string): string {
    return encryptData(note)
}

/**
 * Decrypt medical notes
 */
export function decryptMedicalNote(encryptedNote: string): string {
    return decryptData(encryptedNote)
}

/**
 * Encrypt allergies
 */
export function encryptAllergies(allergies: string): string {
    return encryptData(allergies)
}

/**
 * Decrypt allergies
 */
export function decryptAllergies(encryptedAllergies: string): string {
    return decryptData(encryptedAllergies)
}

/**
 * Anonymize patient data for analytics
 */
export function anonymizePatientData(data: any) {
    return {
        ...data,
        firstName: hashData(data.firstName || ''),
        lastName: hashData(data.lastName || ''),
        email: data.email ? hashData(data.email) : null,
        phone: data.phone ? hashData(data.phone) : null,
    }
}
