import { Hono } from 'hono'
import { auth } from './auth.js'
import { doctors } from './doctors.js'
import { organizations } from './organizations.js'
import { patients } from './patients.js'
import { availability } from './availability.js'
import { appointments } from './appointments.js'
import { pub } from './public.js'
import { admin } from './admin.js'
import { prescriptions } from './prescriptions.js'
import { labOrders } from './labOrders.js'
import { consultationNotes } from './consultationNotes.js'
import { certificates } from './certificates.js'
import { referrals } from './referrals.js'
import { departments } from './departments.js'
import { superAdmin } from './superAdmin.js'
import hospitalAdmins from './hospitalAdmins.js'
import backup from './backup.js'
import { monitoring } from './monitoring.js'
import rooms from './rooms.js'
import admissions from './admissions.js'
import suppliers from './suppliers.js'
import purchaseOrders from './purchaseOrders.js'

import type { HonoEnv } from '../types/env.js'

export const api = new Hono<HonoEnv>()
api.route('/auth', auth)
api.route('/doctors', doctors)
api.route('/organizations', organizations)
api.route('/patients', patients)
api.route('/availability', availability)
api.route('/appointments', appointments)
api.route('/prescriptions', prescriptions)
api.route('/lab-orders', labOrders)
api.route('/consultation-notes', consultationNotes)
api.route('/certificates', certificates)
api.route('/referrals', referrals)
api.route('/departments', departments)
api.route('/super-admin', superAdmin)
api.route('/hospital-admins', hospitalAdmins)
api.route('/backup', backup)
api.route('/public', pub)
import documents from './documents.js'
import profile from './profile.js'
import medicalRecord from './medicalRecord.js'
import notifications from './notifications.js'

import { equipment } from './equipment.js'
import { healthTips } from './healthTips.js'
import { emergencies } from './emergencies.js'

import chat from './chat.js'
import pharmacy from './pharmacy.js'
import patientPortal from './patientPortal.js'
import i18n from './i18n.js'
import billing from './billing.js'

api.route('/documents', documents)
api.route('/profile', profile)
api.route('/medical-record', medicalRecord)
api.route('/notifications', notifications)
api.route('/monitoring', monitoring)
api.route('/equipment', equipment)
api.route('/health-tips', healthTips)
api.route('/emergencies', emergencies)
api.route('/chat', chat)
api.route('/pharmacy', pharmacy)
api.route('/patient-portal', patientPortal)
api.route('/i18n', i18n)
api.route('/billing', billing)
api.route('/rooms', rooms)
api.route('/admissions', admissions)
api.route('/suppliers', suppliers)
api.route('/purchase-orders', purchaseOrders)

