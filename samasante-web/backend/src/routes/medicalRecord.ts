import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'

const medicalRecord = new Hono()

medicalRecord.get('/:id', async (c) => {
    const patientId = parseInt(c.req.param('id'))

    try {
        const medicalFile = await prisma.medicalFile.findUnique({
            where: { patientId }
        })

        // Fetch recent consultations for history inference (optional/advanced)
        // const consultations = await prisma.consultationNote.findMany({ where: { patientId } })

        if (!medicalFile) {
            // Return empty/default structure if no file exists
            return c.json({
                allergies: [],
                chronicConditions: [],
                surgeries: [],
                vaccinations: [],
                familyHistory: []
            })
        }

        // Parse allergies if stored as JSON or comma-separated string
        let allergiesList: string[] = []
        if (medicalFile.allergies) {
            try {
                allergiesList = JSON.parse(medicalFile.allergies)
            } catch {
                allergiesList = medicalFile.allergies.split(',').map((s: string) => s.trim())
            }
        }

        return c.json({
            allergies: allergiesList,
            chronicConditions: [], // Not yet in DB
            surgeries: [], // Not yet in DB
            vaccinations: [], // Not yet in DB
            familyHistory: [], // Not yet in DB
            notes: medicalFile.notes
        })
    } catch (error) {
        return c.json({ error: "Erreur lors de la récupération du dossier médical" }, 500)
    }
})

export default medicalRecord
