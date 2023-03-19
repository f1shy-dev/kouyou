-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "githubUpdateRepo" TEXT,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "_UserApp" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_UserApp_AB_unique" ON "_UserApp"("A", "B");

-- CreateIndex
CREATE INDEX "_UserApp_B_index" ON "_UserApp"("B");

-- AddForeignKey
ALTER TABLE "FullAnalyticsRecord" ADD CONSTRAINT "FullAnalyticsRecord_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitedAnalyticsRecord" ADD CONSTRAINT "LimitedAnalyticsRecord_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppLogsRecord" ADD CONSTRAINT "AppLogsRecord_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserApp" ADD CONSTRAINT "_UserApp_A_fkey" FOREIGN KEY ("A") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserApp" ADD CONSTRAINT "_UserApp_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
