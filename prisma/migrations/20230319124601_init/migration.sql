/*
  Warnings:

  - You are about to drop the `Analytics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_appId_fkey";

-- AlterTable
ALTER TABLE "App" ADD COLUMN     "githubUpdateRepo" TEXT;

-- DropTable
DROP TABLE "Analytics";

-- CreateTable
CREATE TABLE "FullAnalyticsRecord" (
    "id" TEXT NOT NULL,
    "deviceModel" TEXT NOT NULL,
    "deviceOs" TEXT NOT NULL,
    "firstLaunch" BOOLEAN NOT NULL,
    "langRegion" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "appVersion" TEXT NOT NULL,

    CONSTRAINT "FullAnalyticsRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LimitedAnalyticsRecord" (
    "id" TEXT NOT NULL,
    "firstLaunch" BOOLEAN NOT NULL,
    "appId" TEXT NOT NULL,
    "appVersion" TEXT NOT NULL,

    CONSTRAINT "LimitedAnalyticsRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppLogsRecord" (
    "id" TEXT NOT NULL,
    "logs" TEXT NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "AppLogsRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FullAnalyticsRecord" ADD CONSTRAINT "FullAnalyticsRecord_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitedAnalyticsRecord" ADD CONSTRAINT "LimitedAnalyticsRecord_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppLogsRecord" ADD CONSTRAINT "AppLogsRecord_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
