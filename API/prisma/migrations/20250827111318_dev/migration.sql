-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Tournament_Players" (
    "playerAlias" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "tournamentId" TEXT NOT NULL,

    PRIMARY KEY ("playerId", "tournamentId"),
    CONSTRAINT "Tournament_Players_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tournament_Players_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
