import prisma from "./client";
import { faker } from "@faker-js/faker";

const iphoneNamePrefixes = [
  "SE",
  "Pro",
  "Pro Max",
  "Ultra",
  "5G",
  "4G+",
  "Mini",
];

export const injectFakeAnalyticsData = async (appId: string): Promise<void> => {
  const app = await prisma.app.findUnique({
    where: {
      id: appId,
    },
  });
  if (!app) {
    throw new Error("App not found");
  }

  const rnd = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  //random number of records between 1500 and 3000
  await prisma.fullAnalyticsRecord.createMany({
    data: [...Array(rnd(25000, 50000))].map(() => ({
      appId,
      deviceModel: [
        "iPhone",
        rnd(7, 16),
        iphoneNamePrefixes[rnd(0, 7)],
        iphoneNamePrefixes[rnd(0, 7)],
      ].join(" "),
      // 1-3
      deviceOs:
        "iOS" + rnd(15, 16) + "." + rnd(1, 3).toString().split("").join("."),
      firstLaunch: Math.random() > 0.5,
      langRegion: faker.address.countryCode(),
      appVersion: rnd(1, 3) + "." + rnd(0, 9) + "." + rnd(0, 9),
      date: faker.date.between(
        new Date().setFullYear(new Date().getFullYear() - 2),
        new Date()
      ),
    })),
  });

  await prisma.limitedAnalyticsRecord.createMany({
    data: [...Array(rnd(25000, 50000))].map(() => ({
      appId,
      firstLaunch: Math.random() > 0.5,
      appVersion: rnd(1, 3) + "." + rnd(0, 9) + "." + rnd(0, 9),
      date: faker.date.between(
        new Date().setFullYear(new Date().getFullYear() - 2),
        // new Date().getTime() - 60 * 60 * 1000,
        new Date()
      ),
    })),
  });

  const amountOfFullAnalyticsRecords = await prisma.fullAnalyticsRecord.count({
    where: {
      appId,
    },
  });

  const amountOfLimitedAnalyticsRecords =
    await prisma.limitedAnalyticsRecord.count({
      where: {
        appId,
      },
    });

  console.log(
    `App "${appId}" now has ${amountOfFullAnalyticsRecords} full analytics records and ${amountOfLimitedAnalyticsRecords} limited analytics records`
  );
};

export const injectFakeAnalyticsDataForAllApps = async (): Promise<void> => {
  const apps = await prisma.app.findMany();
  for (const app of apps) {
    await injectFakeAnalyticsData(app.id);
  }
};
