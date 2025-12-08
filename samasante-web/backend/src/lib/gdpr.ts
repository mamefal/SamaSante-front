// backend/src/lib/gdpr.ts
import { prisma } from './prisma.js'
import { hashData, anonymizePatientData } from './encryption.js'
import { logDelete, logAccess } from './audit-log.js'
import type { Context } from 'hono'

/**
 * Anonymise les données d'un patient
 * Utilisé pour analytics ou après suppression
 */
export async function anonymizePatient(patientId: number) {
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            medicalFile: true,
            appointments: true,
            prescriptions: true,
        },
    })

    if (!patient) {
        throw new Error('Patient not found')
    }

    // Anonymiser les données personnelles
    const anonymized = {
        ...patient,
        firstName: hashData(patient.firstName),
        lastName: hashData(patient.lastName),
        email: patient.email ? hashData(patient.email) : null,
        phone: patient.phone ? hashData(patient.phone) : null,
        address: null,
        // Garder les données médicales pour statistiques
        dob: patient.dob, // Garder pour calculs d'âge
    }

    return anonymized
}

/**
 * Droit à l'oubli - Supprime toutes les données d'un patient
 * Respecte les obligations légales de conservation
 */
export async function rightToBeForgotten(
    patientId: number,
    userId: number,
    c: Context
): Promise<{ success: boolean; message: string; retainedData?: string[] }> {
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            appointments: true,
            prescriptions: true,
            medicalFile: true,
        },
    })

    if (!patient) {
        throw new Error('Patient not found')
    }

    // Vérifier les obligations légales
    const now = new Date()
    const lastAppointment = patient.appointments
        .sort((a, b) => b.start.getTime() - a.start.getTime())[0]

    const retainedData: string[] = []

    // Dossiers médicaux: conservation 20 ans après dernière consultation
    if (lastAppointment) {
        const yearsSinceLastConsultation =
            (now.getTime() - lastAppointment.start.getTime()) / (1000 * 60 * 60 * 24 * 365)

        if (yearsSinceLastConsultation < 20) {
            retainedData.push(
                `Dossier médical (conservation légale: ${Math.ceil(20 - yearsSinceLastConsultation)} ans restants)`
            )
        }
    }

    // Données de facturation: conservation 10 ans
    const hasRecentBilling = patient.appointments.some((apt) => {
        const yearsSince = (now.getTime() - apt.start.getTime()) / (1000 * 60 * 60 * 24 * 365)
        return yearsSince < 10
    })

    if (hasRecentBilling) {
        retainedData.push('Données de facturation (conservation légale: 10 ans)')
    }

    // Si obligations légales, anonymiser au lieu de supprimer
    if (retainedData.length > 0) {
        // Anonymiser les données personnelles
        await prisma.patient.update({
            where: { id: patientId },
            data: {
                firstName: `ANONYME_${hashData(patient.firstName).substring(0, 8)}`,
                lastName: `ANONYME_${hashData(patient.lastName).substring(0, 8)}`,
                email: null,
                phone: null,
                // address: null, // Not in schema
                // Marquer comme anonymisé
                // Note: Ajouter un champ 'anonymized' au schéma si nécessaire
            },
        })

        // Log l'action
        await logDelete(userId, 'Patient', patientId, patient, c)

        return {
            success: true,
            message: 'Données personnelles anonymisées (conservation légale)',
            retainedData,
        }
    }

    // Sinon, suppression complète
    // Les cascades Prisma supprimeront les données liées
    await prisma.patient.delete({
        where: { id: patientId },
    })

    // Log l'action
    await logDelete(userId, 'Patient', patientId, patient, c)

    return {
        success: true,
        message: 'Toutes les données ont été supprimées',
    }
}

/**
 * Export de toutes les données d'un patient (portabilité RGPD)
 */
export async function exportPatientData(patientId: number, userId: number, c: Context) {
    // Log l'accès
    await logAccess(userId, 'Patient', patientId, c)

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            medicalFile: true,
            appointments: {
                include: {
                    doctor: {
                        select: {
                            firstName: true,
                            lastName: true,
                            specialty: true,
                        },
                    },
                    consultationNote: true,
                },
            },
            prescriptions: {
                include: {
                    doctor: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    medications: true,
                },
            },
            labOrders: {
                include: {
                    tests: true,
                },
            },
            consultationNotes: {
                include: {
                    doctor: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
            certificates: true,
            referralLetters: true,
        },
    })

    if (!patient) {
        throw new Error('Patient not found')
    }

    // Structurer les données pour export
    const exportData = {
        metadata: {
            exportDate: new Date().toISOString(),
            patientId: patient.id,
            format: 'JSON',
            version: '1.0',
        },
        personalData: {
            firstName: patient.firstName,
            lastName: patient.lastName,
            dob: patient.dob,
            // gender: patient.gender, // Not in schema
            email: patient.email,
            phone: patient.phone,
            // address: patient.address, // Not in schema
            createdAt: patient.createdAt,
        },
        medicalFile: patient.medicalFile
            ? {
                // bloodType: patient.medicalFile.bloodType, // Not in schema
                allergies: patient.medicalFile.allergies,
                // chronicDiseases: patient.medicalFile.chronicDiseases, // Not in schema
                // surgeries: patient.medicalFile.surgeries, // Not in schema
                // familyHistory: patient.medicalFile.familyHistory, // Not in schema
                // currentMedications: patient.medicalFile.currentMedications, // Not in schema
                notes: patient.medicalFile.notes,
            }
            : null,
        appointments: patient.appointments.map((apt) => ({
            date: apt.start,
            doctor: `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
            specialty: apt.doctor.specialty,
            motive: apt.motive,
            status: apt.status,
            notes: apt.consultationNote?.notes || null,
        })),
        prescriptions: patient.prescriptions.map((presc) => ({
            date: presc.createdAt,
            doctor: `Dr. ${presc.doctor.firstName} ${presc.doctor.lastName}`,
            medications: presc.medications.map(m => `${m.medicationName} ${m.dosage}`).join(', '),
            instructions: presc.medications.map(m => m.instructions).filter(Boolean).join('; '),
        })),
        labOrders: patient.labOrders.map((order) => ({
            date: order.createdAt,
            type: order.tests.map(t => t.category).join(', '),
            tests: order.tests.map(t => t.testName).join(', '),
            results: order.results,
            status: order.status,
        })),
        consultationNotes: patient.consultationNotes.map((note) => ({
            date: note.createdAt,
            doctor: `Dr. ${note.doctor.firstName} ${note.doctor.lastName}`,
            reason: note.chiefComplaint,
            diagnosis: note.diagnosis,
            treatment: note.treatment,
            notes: note.notes,
        })),
        certificates: patient.certificates.map((cert) => ({
            date: cert.createdAt,
            type: cert.type,
            content: cert.content,
        })),
        referralLetters: patient.referralLetters.map((letter) => ({
            date: letter.createdAt,
            specialty: letter.specialty,
            reason: letter.reason,
            urgency: letter.urgency,
        })),
    }

    return exportData
}

/**
 * Générer un fichier CSV pour export
 */
export function generateCSVExport(data: any): string {
    const lines: string[] = []

    // Header
    lines.push('Type,Date,Description,Détails')

    // Appointments
    data.appointments?.forEach((apt: any) => {
        lines.push(
            `Rendez-vous,${apt.date},${apt.doctor},${apt.specialty} - ${apt.motive}`
        )
    })

    // Prescriptions
    data.prescriptions?.forEach((presc: any) => {
        lines.push(
            `Prescription,${presc.date},${presc.doctor},"${presc.medications}"`
        )
    })

    // Lab orders
    data.labOrders?.forEach((order: any) => {
        lines.push(`Examen,${order.date},${order.type},"${order.tests}"`)
    })

    return lines.join('\n')
}

/**
 * Générer un PDF pour export (nécessite une lib PDF)
 */
export async function generatePDFExport(data: any): Promise<Buffer> {
    // TODO: Implémenter avec une lib comme pdfkit ou puppeteer
    // Pour l'instant, retourner un placeholder
    throw new Error('PDF export not yet implemented')
}
