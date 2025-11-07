-- CreateTable
CREATE TABLE "GameResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "opponentId" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameResult_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
