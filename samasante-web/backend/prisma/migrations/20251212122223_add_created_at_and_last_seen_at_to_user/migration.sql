-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN "settings" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastSeenAt" DATETIME DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Emergency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "triage" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "arrivalTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doctorId" INTEGER,
    "organizationId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Emergency_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Emergency_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Emergency_organizationId_idx" ON "Emergency"("organizationId");

-- CreateIndex
CREATE INDEX "Emergency_status_idx" ON "Emergency"("status");

-- CreateIndex
CREATE INDEX "Emergency_severity_idx" ON "Emergency"("severity");
