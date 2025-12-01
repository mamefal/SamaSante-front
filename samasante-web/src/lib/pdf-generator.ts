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

export const generatePrescriptionPDF = (data: PrescriptionData) => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(22)
    doc.setTextColor(41, 128, 185) // Blue color
    doc.text("SamaSanté", 105, 20, { align: "center" })

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
    doc.text("Ce document est généré électroniquement par SamaSanté.", 105, pageHeight - 10, { align: "center" })

    // Save
    doc.save(`ordonnance_${data.id}_${data.patientName.replace(/\s+/g, '_')}.pdf`)
}
