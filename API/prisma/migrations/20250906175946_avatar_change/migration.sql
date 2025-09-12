/*
  Warnings:

  - You are about to drop the column `avatar` on the `Profile` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Avatar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'default-avatar.png',
    "contentType" TEXT NOT NULL DEFAULT 'image/png',
    CONSTRAINT "Avatar_id_fkey" FOREIGN KEY ("id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Profile_id_fkey" FOREIGN KEY ("id") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("createdAt", "id", "online", "updatedAt") SELECT "createdAt", "id", "online", "updatedAt" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
