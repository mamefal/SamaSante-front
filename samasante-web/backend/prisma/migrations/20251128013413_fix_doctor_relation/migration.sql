-- CreateTable
CREATE TABLE "Department" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "headDoctorId" INTEGER,
    "organizationId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Doctor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordreNumber" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "phonePublic" TEXT,
    "emailPublic" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "kycScore" INTEGER NOT NULL DEFAULT 0,
    "practiceSiteId" INTEGER,
    "organizationId" INTEGER NOT NULL,
    "departmentId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" DATETIME,
    CONSTRAINT "Doctor_practiceSiteId_fkey" FOREIGN KEY ("practiceSiteId") REFERENCES "PracticeSite" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Doctor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Doctor_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Doctor" ("createdAt", "emailPublic", "firstName", "id", "kycScore", "lastName", "ordreNumber", "organizationId", "phonePublic", "practiceSiteId", "specialty", "status", "verifiedAt") SELECT "createdAt", "emailPublic", "firstName", "id", "kycScore", "lastName", "ordreNumber", "organizationId", "phonePublic", "practiceSiteId", "specialty", "status", "verifiedAt" FROM "Doctor";
DROP TABLE "Doctor";
ALTER TABLE "new_Doctor" RENAME TO "Doctor";
CREATE UNIQUE INDEX "Doctor_ordreNumber_key" ON "Doctor"("ordreNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
