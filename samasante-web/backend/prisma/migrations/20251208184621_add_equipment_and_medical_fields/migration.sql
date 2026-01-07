-- AlterTable
ALTER TABLE "MedicalFile" ADD COLUMN "bloodType" TEXT;
ALTER TABLE "MedicalFile" ADD COLUMN "chronicConditions" TEXT;
ALTER TABLE "MedicalFile" ADD COLUMN "emergencyContact" TEXT;

-- CreateTable
CREATE TABLE "Equipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serialNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'operational',
    "department" TEXT,
    "organizationId" INTEGER NOT NULL,
    "lastMaintenance" DATETIME,
    "nextMaintenance" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equipment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Equipment_organizationId_idx" ON "Equipment"("organizationId");
