# Implementation Plan - SamaSante Enhancements

This plan outlines the steps to fulfill the user's requests based on the diagnostic report and current project state.

## 1. Safety & Security (Done)

- [x] Activate backend rate limiting for login.
- [x] Reactivate frontend security middleware.
- [x] Activate Axios response interceptor for 401 handling.

## 2. Shared Medical Record (DMP) - CRUD & Integration

- [ ] **Backend**:
  - [ ] Ensure all necessary endpoints for Medical Record CRUD (allergies, chronic conditions, signs vitaux, consultations) are available in `medicalRecord.ts`.
  - [ ] Verification of `Patient` and `MedicalFile` schema in Prisma.
- [ ] **Frontend**:
  - [ ] Update `src/app/doctor/patients/page.tsx` to allow updating patient medical information (allergies, conditions).
  - [ ] Implement a "Consultation" form for doctors to add a new consultation record.
  - [ ] Update Patient portal to show the newly added records.

## 3. Connect placeholder APIs (TODOs)

- [ ] **Doctor Dashboard**:
  - [ ] Replace mock data in `src/app/doctor/page.tsx` with real data from `/doctors/stats` if not already fully integrated.
  - [ ] Update `src/app/doctor/stats/page.tsx` to fetch real analytics.
- [ ] **Pharmacy module**:
  - [ ] Implement the "Add Medication" modal.
  - [ ] Implement the "Manage Stock" modal.
- [ ] **Appointment Booking**:
  - [ ] Finalize the connection of the modal to the backend (Done: implement call in `appointment-booking-modal.tsx`).

## 4. Notifications & Professional Services

- [ ] **Notifications**:
  - [ ] Verify environment variables for Twilio/Nodemailer.
  - [ ] Ensure `NotificationManager` is used when prescriptions are created or lab results are ready.
- [ ] **PDF Generation**:
  - [ ] Implement `generateMedicalReportPDF` in `src/lib/pdf-generator.ts`.
  - [ ] Add a "Download Medical Report" button in the Patient portal and Doctor patient list.
  - [ ] Implement GDPR document generation.

## 5. Pharmacy & Stock Enhancements

- [ ] **Chat/Discussion**:
  - [ ] Verify the Chat/Discussion feature is accessible for Pharmacy admins to coordinate with doctors/patients.
- [ ] **Stock Management**:
  - [ ] Ensure the stock management logic in `backend/src/routes/pharmacy.ts` is fully functional and handled in the UI.

## 6. Hospital Module Audits & Fixes

- [ ] Review `/hospital/billing` and implement the payment modal placeholder.
- [ ] Verify active user tracking and alerting system.
