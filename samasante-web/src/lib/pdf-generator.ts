import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface PrescriptionData {
    id: number
    doctorName: string
    patientName: string
    date: string
    medications: {
        name: string
        dosage: string
        frequency: string
        duration: string
    }[]
    notes?: string
}

interface MedicalReportData {
    patientName: string
    patientDob: string
    doctorName: string
    date: string
    consultationType: string
    observations: string
    diagnosis: string
    treatment: string
    nextSteps?: string
}

interface GDPRData {
    patientName: string
    date: string
    requestType: 'access' | 'portability' | 'rectification'
    dataSummary?: any
}

export const generatePrescriptionPDF = (data: PrescriptionData) => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(22)
    doc.setTextColor(41, 128, 185) // Blue color
    doc.text("AMINA", 105, 20, { align: "center" })

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Plateforme de Gestion Hospitalière", 105, 28, { align: "center" })

    doc.setLineWidth(0.5)
    doc.line(20, 35, 190, 35)

    // Doctor & Patient Info
    doc.setFontSize(10)
    doc.text(`Dr. ${data.doctorName}`, 20, 50)
    doc.text(`Patient: ${data.patientName}`, 140, 50)

    doc.text(`Date: ${format(new Date(data.date), "d MMMM yyyy", { locale: fr })}`, 20, 60)
    doc.text(`N° Ordonnance: #${data.id.toString().padStart(6, '0')}`, 140, 60)

    // Title
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("ORDONNANCE MÉDICALE", 105, 80, { align: "center" })

    // Medications Table
    const tableColumn = ["Médicament", "Dosage", "Fréquence", "Durée"]
    const tableRows = data.medications.map(med => [
        med.name,
        med.dosage,
        med.frequency,
        med.duration
    ])

    autoTable(doc, {
        startY: 90,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 5 },
    })

    // Notes
    if (data.notes) {
        const finalY = (doc as any).lastAutoTable.finalY || 150
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.text("Notes / Instructions:", 20, finalY + 20)
        doc.setFont("helvetica", "italic")
        doc.text(data.notes, 20, finalY + 30, { maxWidth: 170 })
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text("Ce document est généré électroniquement par AMINA.", 105, pageHeight - 10, { align: "center" })

    // Save
    doc.save(`ordonnance_${data.id}_${data.patientName.replace(/\s+/g, '_')}.pdf`)
}

export const generateMedicalReportPDF = (data: MedicalReportData) => {
    const doc = new jsPDF()

    // Header (Common branding)
    const addHeader = () => {
        doc.setFontSize(22)
        doc.setTextColor(41, 128, 185)
        doc.text("AMINA", 105, 20, { align: "center" })
        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text("RAPPORT MÉDICAL COMPLET", 105, 28, { align: "center" })
        doc.setDrawColor(41, 128, 185)
        doc.line(20, 35, 190, 35)
    }

    addHeader()

    // Patient & Doctor block
    doc.setTextColor(0)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Informations Générales", 20, 45)

    doc.setFont("helvetica", "normal")
    doc.text(`Patient: ${data.patientName}`, 20, 55)
    doc.text(`Date de naissance: ${format(new Date(data.patientDob), "d MMMM yyyy", { locale: fr })}`, 20, 62)
    doc.text(`Médecin: Dr. ${data.doctorName}`, 120, 55)
    doc.text(`Date du rapport: ${format(new Date(data.date), "d MMMM yyyy", { locale: fr })}`, 120, 62)

    // Content
    let currentY = 80

    const addSection = (title: string, content: string) => {
        if (currentY > 250) {
            doc.addPage()
            addHeader()
            currentY = 45
        }
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(41, 128, 185)
        doc.text(title, 20, currentY)
        currentY += 8
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.setTextColor(0)
        const lines = doc.splitTextToSize(content, 170)
        doc.text(lines, 20, currentY)
        currentY += (lines.length * 6) + 15
    }

    addSection("Type de Consultation", data.consultationType)
    addSection("Observations Cliniques", data.observations)
    addSection("Diagnostic", data.diagnosis)
    addSection("Traitement Préconisé", data.treatment)

    if (data.nextSteps) {
        addSection("Prochaines Étapes", data.nextSteps)
    }

    // Signature Placeholder
    if (currentY > 240) {
        doc.addPage()
        addHeader()
        currentY = 45
    }
    doc.line(130, currentY + 30, 180, currentY + 30)
    doc.setFontSize(9)
    doc.text("Signature du médecin", 140, currentY + 35)

    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text("Confidentiel - Document généré par AMINA - Santé Numérique au Sénégal", 105, pageHeight - 10, { align: "center" })

    doc.save(`rapport_medical_${data.patientName.replace(/\s+/g, '_')}.pdf`)
}

export const generateGDPRDocumentsPDF = (data: GDPRData) => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(20)
    doc.setTextColor(44, 62, 80)
    doc.text("POLITIQUE DE CONFIDENTIALITÉ & RGPD", 105, 30, { align: "center" })

    doc.setFontSize(12)
    doc.text("Attestation de Gestion des Données Personnelles", 105, 40, { align: "center" })

    // Content
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const introText = `Je soussigné(e) ${data.patientName}, confirme avoir été informé(e) de mes droits concernant le traitement de mes données de santé sur la plateforme AMINA, conformément à la loi sénégalaise sur la protection des données personnelles.`

    const splitIntro = doc.splitTextToSize(introText, 170)
    doc.text(splitIntro, 20, 60)

    let y = 80
    doc.setFont("helvetica", "bold")
    doc.text("Mes Droits:", 20, y)
    y += 10
    doc.setFont("helvetica", "normal")
    const rights = [
        "- Droit d'accès: Consulter mes données à tout moment.",
        "- Droit de rectification: Demander la correction d'erreurs.",
        "- Droit à l'effacement: Droit à l'oubli numérique.",
        "- Droit à la portabilité: Recevoir mes données dans un format structuré."
    ]
    rights.forEach(right => {
        doc.text(right, 25, y)
        y += 7
    })

    y += 15
    doc.setFont("helvetica", "bold")
    doc.text(`Action effectuée: Demande de ${data.requestType}`, 20, y)
    y += 7
    doc.setFont("helvetica", "normal")
    doc.text(`Date de la demande: ${format(new Date(data.date), "d MMMM yyyy HH:mm", { locale: fr })}`, 20, y)

    if (data.dataSummary) {
        y += 20
        doc.setFont("helvetica", "bold")
        doc.text("Résumé des données exportées:", 20, y)
        y += 10

        const summary = JSON.stringify(data.dataSummary, null, 2).substring(0, 500) + "..."
        const splitSummary = doc.splitTextToSize(summary, 170)
        doc.setFont("courier", "normal")
        doc.setFontSize(8)
        doc.text(splitSummary, 20, y)
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9)
    doc.text("Pour toute question: dpo@samasante.sn", 105, pageHeight - 20, { align: "center" })

    doc.save(`document_RGPD_${data.patientName.replace(/\s+/g, '_')}.pdf`)
}
