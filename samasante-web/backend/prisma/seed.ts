import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.medicalFile.deleteMany()
  await prisma.prescriptionMedication.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.labTest.deleteMany()
  await prisma.labOrder.deleteMany()
  await prisma.consultationNote.deleteMany()
  await prisma.medicalCertificate.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.doctorDocument.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()
  await prisma.organization.deleteMany()

  console.log('✅ Cleared existing data')

  // Create Organizations
  const hopitalDakar = await prisma.organization.create({
    data: {
      name: 'Hôpital Principal de Dakar',
      slug: 'hopital-dakar',
      type: 'hopital',
      region: 'Dakar',
      city: 'Dakar',
      address: 'Avenue Cheikh Anta Diop',
      phone: '+221 33 889 01 01',
      email: 'contact@hopital-dakar.sn',
      isActive: true
    }
  })

  const cliniquThies = await prisma.organization.create({
    data: {
      name: 'Clinique Moderne de Thiès',
      slug: 'clinique-thies',
      type: 'clinique',
      region: 'Thiès',
      city: 'Thiès',
      address: 'Route de Dakar',
      phone: '+221 33 951 12 34',
      email: 'info@clinique-thies.sn',
      isActive: true
    }
  })

  const centreKaolack = await prisma.organization.create({
    data: {
      name: 'Centre de Santé de Kaolack',
      slug: 'centre-kaolack',
      type: 'centre',
      region: 'Kaolack',
      city: 'Kaolack',
      address: 'Quartier Médina',
      phone: '+221 33 941 23 45',
      email: 'contact@centre-kaolack.sn',
      isActive: true
    }
  })

  console.log('✅ Created 3 organizations')

  // Create Departments for Hôpital Dakar
  const cardiologie = await prisma.department.create({
    data: {
      name: 'Cardiologie',
      description: 'Service de cardiologie et maladies cardiovasculaires',
      organizationId: hopitalDakar.id
    }
  })

  const pediatrie = await prisma.department.create({
    data: {
      name: 'Pédiatrie',
      description: 'Service de pédiatrie et néonatologie',
      organizationId: hopitalDakar.id
    }
  })

  const urgences = await prisma.department.create({
    data: {
      name: 'Urgences',
      description: 'Service des urgences médicales',
      organizationId: hopitalDakar.id
    }
  })

  console.log('✅ Created 3 departments')

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Super Admin
  await prisma.user.create({
    data: {
      email: 'admin@samasante.sn',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  })

  // Create Hospital Admins
  await prisma.user.create({
    data: {
      email: 'admin@hopital-dakar.sn',
      password: hashedPassword,
      role: 'HOSPITAL_ADMIN',
      organizationId: hopitalDakar.id
    }
  })

  await prisma.user.create({
    data: {
      email: 'admin@clinique-thies.sn',
      password: hashedPassword,
      role: 'HOSPITAL_ADMIN',
      organizationId: cliniquThies.id
    }
  })

  console.log('✅ Created admin users')

  // Create Doctors for Hôpital Dakar
  const drFall = await prisma.doctor.create({
    data: {
      ordreNumber: 'SN-12345',
      firstName: 'Amadou',
      lastName: 'Fall',
      specialty: 'Cardiologie',
      phonePublic: '+221 77 123 45 67',
      emailPublic: 'dr.fall@hopital-dakar.sn',
      status: 'verified',
      kycScore: 100,
      organizationId: hopitalDakar.id,
      departmentId: cardiologie.id
    }
  })

  const drDiop = await prisma.doctor.create({
    data: {
      ordreNumber: 'SN-12346',
      firstName: 'Fatou',
      lastName: 'Diop',
      specialty: 'Pédiatrie',
      phonePublic: '+221 77 234 56 78',
      emailPublic: 'dr.diop@hopital-dakar.sn',
      status: 'verified',
      kycScore: 100,
      organizationId: hopitalDakar.id,
      departmentId: pediatrie.id
    }
  })

  // Create Doctors for Clinique Thiès
  const drNdiaye = await prisma.doctor.create({
    data: {
      ordreNumber: 'SN-12347',
      firstName: 'Moussa',
      lastName: 'Ndiaye',
      specialty: 'Médecine Générale',
      phonePublic: '+221 77 345 67 89',
      emailPublic: 'dr.ndiaye@clinique-thies.sn',
      status: 'verified',
      kycScore: 95,
      organizationId: cliniquThies.id
    }
  })

  console.log('✅ Created 3 doctors')

  // Create Doctor Users
  await prisma.user.create({
    data: {
      email: 'dr.fall@hopital-dakar.sn',
      password: hashedPassword,
      role: 'DOCTOR',
      doctorId: drFall.id,
      organizationId: hopitalDakar.id
    }
  })

  await prisma.user.create({
    data: {
      email: 'dr.diop@hopital-dakar.sn',
      password: hashedPassword,
      role: 'DOCTOR',
      doctorId: drDiop.id,
      organizationId: hopitalDakar.id
    }
  })

  await prisma.user.create({
    data: {
      email: 'dr.ndiaye@clinique-thies.sn',
      password: hashedPassword,
      role: 'DOCTOR',
      doctorId: drNdiaye.id,
      organizationId: cliniquThies.id
    }
  })

  // Create Shared Patients (no organizationId - accessible to all)
  const patient1 = await prisma.patient.create({
    data: {
      firstName: 'Ibrahima',
      lastName: 'Sarr',
      dob: new Date('1985-03-15'),
      phone: '+221 77 111 22 33',
      email: 'ibrahima.sarr@email.sn'
    }
  })

  const patient2 = await prisma.patient.create({
    data: {
      firstName: 'Aissatou',
      lastName: 'Sy',
      dob: new Date('1990-07-22'),
      phone: '+221 77 222 33 44',
      email: 'aissatou.sy@email.sn'
    }
  })

  const patient3 = await prisma.patient.create({
    data: {
      firstName: 'Ousmane',
      lastName: 'Ba',
      dob: new Date('1978-11-08'),
      phone: '+221 77 333 44 55',
      email: 'ousmane.ba@email.sn'
    }
  })

  console.log('✅ Created 3 shared patients')

  // Create Medical Files
  await prisma.medicalFile.create({
    data: {
      patientId: patient1.id,
      allergies: 'Pénicilline',
      treatments: 'Hypertension - Amlodipine 5mg',
      notes: 'Patient suivi depuis 2020'
    }
  })

  await prisma.medicalFile.create({
    data: {
      patientId: patient2.id,
      allergies: 'Aucune',
      treatments: 'Aucun',
      notes: 'Première consultation'
    }
  })

  // Create Patient Users
  await prisma.user.create({
    data: {
      email: 'patient1@email.sn',
      password: hashedPassword,
      role: 'PATIENT',
      patientId: patient1.id
    }
  })

  await prisma.user.create({
    data: {
      email: 'patient2@email.sn',
      password: hashedPassword,
      role: 'PATIENT',
      patientId: patient2.id
    }
  })

  console.log('✅ Created patient users')

  // Create some appointments
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)

  await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: drFall.id,
      motive: 'Consultation de suivi cardiologique',
      start: tomorrow,
      end: new Date(tomorrow.getTime() + 30 * 60000),
      status: 'booked'
    }
  })

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(14, 0, 0, 0)

  await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      doctorId: drDiop.id,
      motive: 'Vaccination enfant',
      start: nextWeek,
      end: new Date(nextWeek.getTime() + 30 * 60000),
      status: 'booked'
    }
  })

  console.log('✅ Created sample appointments')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Super Admin:')
  console.log('  Email: admin@samasante.sn')
  console.log('  Password: password123')
  console.log('\nHospital Admin (Dakar):')
  console.log('  Email: admin@hopital-dakar.sn')
  console.log('  Password: password123')
  console.log('\nHospital Admin (Thiès):')
  console.log('  Email: admin@clinique-thies.sn')
  console.log('  Password: password123')
  console.log('\nDoctor (Cardiologie):')
  console.log('  Email: dr.fall@hopital-dakar.sn')
  console.log('  Password: password123')
  console.log('\nDoctor (Pédiatrie):')
  console.log('  Email: dr.diop@hopital-dakar.sn')
  console.log('  Password: password123')
  console.log('\nDoctor (Médecine Générale):')
  console.log('  Email: dr.ndiaye@clinique-thies.sn')
  console.log('  Password: password123')
  console.log('\nPatient 1 (Ibrahima Sarr):')
  console.log('  Email: patient1@email.sn')
  console.log('  Password: password123')
  console.log('\nPatient 2 (Aissatou Sy):')
  console.log('  Email: patient2@email.sn')
  console.log('  Password: password123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
