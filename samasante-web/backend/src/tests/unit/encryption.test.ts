// backend/src/tests/unit/encryption.test.ts
import { describe, it, expect } from 'vitest'
import {
    encryptData,
    decryptData,
    hashData,
    encryptMedicalNote,
    decryptMedicalNote,
    anonymizePatientData,
} from '../../lib/encryption.js'

describe('Encryption Service', () => {
    describe('encryptData / decryptData', () => {
        it('should encrypt and decrypt data correctly', () => {
            const originalData = 'Sensitive medical information'
            const encrypted = encryptData(originalData)
            const decrypted = decryptData(encrypted)

            expect(encrypted).not.toBe(originalData)
            expect(encrypted).toContain(':') // IV:encrypted format
            expect(decrypted).toBe(originalData)
        })

        it('should produce different encrypted values for same input', () => {
            const data = 'Test data'
            const encrypted1 = encryptData(data)
            const encrypted2 = encryptData(data)

            expect(encrypted1).not.toBe(encrypted2) // Different IV
            expect(decryptData(encrypted1)).toBe(data)
            expect(decryptData(encrypted2)).toBe(data)
        })

        it('should handle empty strings', () => {
            const encrypted = encryptData('')
            const decrypted = decryptData(encrypted)

            expect(decrypted).toBe('')
        })
    })

    describe('hashData', () => {
        it('should hash data consistently', () => {
            const data = 'test@example.com'
            const hash1 = hashData(data)
            const hash2 = hashData(data)

            expect(hash1).toBe(hash2)
            expect(hash1).not.toBe(data)
            expect(hash1.length).toBe(64) // SHA-256 hex
        })

        it('should produce different hashes for different inputs', () => {
            const hash1 = hashData('test1@example.com')
            const hash2 = hashData('test2@example.com')

            expect(hash1).not.toBe(hash2)
        })
    })

    describe('Medical Data Encryption', () => {
        it('should encrypt and decrypt medical notes', () => {
            const note = 'Patient has severe allergies to penicillin'
            const encrypted = encryptMedicalNote(note)
            const decrypted = decryptMedicalNote(encrypted)

            expect(encrypted).not.toBe(note)
            expect(decrypted).toBe(note)
        })
    })

    describe('anonymizePatientData', () => {
        it('should anonymize patient personal information', () => {
            const patientData = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+221771234567',
                dob: new Date('1990-01-01'),
            }

            const anonymized = anonymizePatientData(patientData)

            expect(anonymized.id).toBe(1)
            expect(anonymized.dob).toEqual(patientData.dob)
            expect(anonymized.firstName).not.toBe(patientData.firstName)
            expect(anonymized.lastName).not.toBe(patientData.lastName)
            expect(anonymized.email).not.toBe(patientData.email)
            expect(anonymized.phone).not.toBe(patientData.phone)

            // Hashes should be consistent
            const anonymized2 = anonymizePatientData(patientData)
            expect(anonymized.firstName).toBe(anonymized2.firstName)
        })
    })
})
