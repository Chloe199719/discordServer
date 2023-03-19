-- DropForeignKey
ALTER TABLE "contexts" DROP CONSTRAINT "contexts_userId_fkey";

-- DropIndex
DROP INDEX "contexts_userId_key";

-- AddForeignKey
ALTER TABLE "contexts" ADD CONSTRAINT "contexts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("discordID") ON DELETE CASCADE ON UPDATE CASCADE;
