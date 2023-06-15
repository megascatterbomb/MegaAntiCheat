-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('NORMAL', 'SUSPICIOUS', 'CHEATER');

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "steamId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[],
    "status" "PlayerStatus" NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_steamId_key" ON "Player"("steamId");
