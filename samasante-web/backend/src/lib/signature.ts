// backend/src/lib/signature.ts
import crypto from 'crypto'
import { prisma } from './prisma.js'

/**
 * Génère une signature électronique pour un document
 */
export async function signDocument(
    documentId: number,
    documentType: string,
    userId: number,
    content: string
): Promise<string> {
    // Créer un hash du contenu
    const contentHash = crypto.createHash('sha256').update(content).digest('hex')

    // Créer une signature avec timestamp
    const timestamp = new Date().toISOString()
    const signatureData = `${documentId}:${documentType}:${userId}:${contentHash}:${timestamp}`

    // Signer avec clé privée (en production, utiliser une vraie clé)
    const privateKey = process.env.SIGNATURE_PRIVATE_KEY || 'dev-private-key'
    const signature = crypto
        .createHmac('sha256', privateKey)
        .update(signatureData)
        .digest('hex')

    // Enregistrer la signature
    await prisma.documentSignature.create({
        data: {
            documentId,
            documentType,
            userId,
            contentHash,
            signature,
            signedAt: new Date(timestamp),
        },
    })

    return signature
}

/**
 * Vérifie la signature d'un document
 */
export async function verifyDocumentSignature(
    documentId: number,
    documentType: string,
    content: string
): Promise<{
    valid: boolean
    signature?: any
    message: string
}> {
    // Récupérer la signature
    const signatureRecord = await prisma.documentSignature.findFirst({
        where: {
            documentId,
            documentType,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            signedAt: 'desc',
        },
    })

    if (!signatureRecord) {
        return {
            valid: false,
            message: 'Aucune signature trouvée pour ce document',
        }
    }

    // Vérifier le hash du contenu
    const currentHash = crypto.createHash('sha256').update(content).digest('hex')

    if (currentHash !== signatureRecord.contentHash) {
        return {
            valid: false,
            signature: signatureRecord,
            message: 'Le document a été modifié après signature',
        }
    }

    // Recalculer la signature
    const signatureData = `${documentId}:${documentType}:${signatureRecord.userId}:${signatureRecord.contentHash}:${signatureRecord.signedAt.toISOString()}`
    const privateKey = process.env.SIGNATURE_PRIVATE_KEY || 'dev-private-key'
    const expectedSignature = crypto
        .createHmac('sha256', privateKey)
        .update(signatureData)
        .digest('hex')

    if (expectedSignature !== signatureRecord.signature) {
        return {
            valid: false,
            signature: signatureRecord,
            message: 'Signature invalide',
        }
    }

    return {
        valid: true,
        signature: signatureRecord,
        message: 'Signature valide',
    }
}

/**
 * Génère un certificat de signature
 */
export function generateSignatureCertificate(signature: any): string {
    return `
CERTIFICAT DE SIGNATURE ÉLECTRONIQUE

Document ID: ${signature.documentId}
Type: ${signature.documentType}
Signé par: ${signature.user.name} (${signature.user.email})
Rôle: ${signature.user.role}
Date: ${signature.signedAt.toISOString()}

Hash du contenu: ${signature.contentHash}
Signature: ${signature.signature}

Ce document a été signé électroniquement conformément aux normes en vigueur.
La signature garantit l'intégrité et l'authenticité du document.
  `.trim()
}

/**
 * Signe une prescription médicale
 */
export async function signPrescription(
    prescriptionId: number,
    doctorId: number,
    medications: string
): Promise<string> {
    const content = JSON.stringify({
        prescriptionId,
        doctorId,
        medications,
        date: new Date().toISOString(),
    })

    return signDocument(prescriptionId, 'PRESCRIPTION', doctorId, content)
}

/**
 * Signe un certificat médical
 */
export async function signMedicalCertificate(
    certificateId: number,
    doctorId: number,
    content: string
): Promise<string> {
    return signDocument(certificateId, 'MEDICAL_CERTIFICATE', doctorId, content)
}

/**
 * Signe une lettre de référence
 */
export async function signReferralLetter(
    letterId: number,
    doctorId: number,
    content: string
): Promise<string> {
    return signDocument(letterId, 'REFERRAL_LETTER', doctorId, content)
}
