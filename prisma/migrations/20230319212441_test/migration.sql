/*
  Warnings:

  - You are about to drop the `_contextsTousers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `contexts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `contexts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_contextsTousers" DROP CONSTRAINT "_contextsTousers_A_fkey";

-- DropForeignKey
ALTER TABLE "_contextsTousers" DROP CONSTRAINT "_contextsTousers_B_fkey";

-- AlterTable
ALTER TABLE "contexts" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_contextsTousers";

-- CreateIndex
CREATE UNIQUE INDEX "contexts_userId_key" ON "contexts"("userId");

-- AddForeignKey
ALTER TABLE "contexts" ADD CONSTRAINT "contexts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
