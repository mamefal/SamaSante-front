import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🗑️  Starting doctor data reset...')

    // Delete in order of dependencies (child tables first if no cascade, but Prisma handles cascade if configured)
    // We'll delete child tables explicitly to be safe

    console.log('Deleting Prescription Medications...')
    await prisma.prescriptionMedication.deleteMany({})

    console.log('Deleting Prescriptions...')
    await prisma.prescription.deleteMany({})

    console.log('Deleting Lab Tests...')
    await prisma.labTest.deleteMany({})

    console.log('Deleting Lab Orders...')
    await prisma.labOrder.deleteMany({})

    console.log('Deleting Consultation Notes...')
    await prisma.consultationNote.deleteMany({})

    console.log('Deleting Medical Certificates...')
    await prisma.medicalCertificate.deleteMany({})

    console.log('Deleting Appointments...')
    await prisma.appointment.deleteMany({})

    console.log('Deleting Availabilities...')
    await prisma.availability.deleteMany({})

    console.log('Deleting Patients...')
    // Patients are linked to User accounts and MedicalFiles.

    // 1. Delete Medical Files
    console.log('Deleting Medical Files...')
    await prisma.medicalFile.deleteMany({})

    // 2. Find patients to delete linked users
    // Patients are linked to User accounts. We must unlink or delete the user first if cascade isn't set.
    // Or we can delete the User if the patient is the primary identity.
    // Let's find patients first, then delete their user accounts if they exist.
    const patients = await prisma.patient.findMany({ select: { id: true } })

    if (patients.length > 0) {
        console.log(`Found ${patients.length} patients. Deleting linked Users...`)
        // Delete users linked to these patients
        await prisma.user.deleteMany({
            where: {
                patientId: {
                    in: patients.map(p => p.id)
                }
            }
        })

        // Now delete patients
        await prisma.patient.deleteMany({})
    }

    console.log('Resetting Organization Settings & Stats...')
    // Statistics are derived from data, so deleting data resets stats.
    // We will also reset organization settings if any.
    await prisma.organization.updateMany({
        data: {
            settings: {}, // Reset settings to empty object
        }
    })

    // Optional: Delete Doctor Documents if "all data" includes files
    // await prisma.doctorDocument.deleteMany({})

    console.log('✅ All doctor clinical data, patients, and settings have been reset to zero.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })


