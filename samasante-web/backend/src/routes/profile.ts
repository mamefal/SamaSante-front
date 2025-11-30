import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'

const profile = new Hono()

profile.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id'))

    try {
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                medicalFile: true
            }
        })

        if (!patient) {
            return c.json({ error: "Patient non trouvé" }, 404)
        }

        // Note: Some fields like address, bloodType, etc. are not yet in the schema
        // We return what we have and mock the rest for UI consistency until schema update
        return c.json({
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phone: patient.phone,
            dob: patient.dob.toISOString().split('T')[0],
            address: "Dakar, Sénégal", // Placeholder
            bloodType: "O+", // Placeholder
            height: 170, // Placeholder
            weight: 70, // Placeholder
            emergencyContact: "Non renseigné" // Placeholder
        })
    } catch (error) {
        return c.json({ error: "Erreur lors de la récupération du profil" }, 500)
    }
})

profile.put('/:id', async (c) => {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()

    try {
        const updatedPatient = await prisma.patient.update({
            where: { id },
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                phone: body.phone,
                // dob: new Date(body.dob) // If dob is editable
            }
        })

        return c.json({
            success: true,
            message: "Profil mis à jour avec succès",
            data: updatedPatient
        })
    } catch (error) {
        return c.json({ error: "Erreur lors de la mise à jour du profil" }, 500)
    }
})

export default profile
