import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'

const documents = new Hono()

// Schema for document upload (metadata only for now)
const uploadSchema = z.object({
    title: z.string(),
    type: z.string(),
    patientId: z.number(),
    url: z.string().optional() // In a real app, this would be the file path after upload
})

// GET /documents/patient/:id - Get all documents for a patient
documents.get('/patient/:id', async (c) => {
    const patientId = parseInt(c.req.param('id'))

    try {
        const docs = await prisma.patientDocument.findMany({
            where: { patientId },
            orderBy: { uploadedAt: 'desc' }
        })

        return c.json(docs.map(doc => ({
            id: doc.id,
            title: doc.title,
            type: doc.type,
            date: doc.uploadedAt.toISOString().split('T')[0],
            size: doc.fileSize || "Unknown",
            url: doc.fileUrl
        })))
    } catch (error) {
        return c.json({ error: "Erreur lors de la récupération des documents" }, 500)
    }
})

// POST /documents/upload - Upload a document (Mock upload, real DB entry)
documents.post('/upload', zValidator('json', uploadSchema), async (c) => {
    const data = c.req.valid('json')

    try {
        const newDoc = await prisma.patientDocument.create({
            data: {
                patientId: data.patientId,
                title: data.title,
                type: data.type,
                fileUrl: data.url || "/docs/placeholder.pdf", // Mock URL if not provided
                fileSize: "1.5 MB" // Mock size
            }
        })

        return c.json({
            success: true,
            message: "Document ajouté avec succès",
            document: {
                id: newDoc.id,
                title: newDoc.title,
                type: newDoc.type,
                date: newDoc.uploadedAt.toISOString().split('T')[0],
                size: newDoc.fileSize,
                url: newDoc.fileUrl
            }
        }, 201)
    } catch (error) {
        return c.json({ error: "Erreur lors de l'ajout du document" }, 500)
    }
})

export default documents
