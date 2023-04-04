import { PrismaClient } from "@prisma/client";
import { IncomingMessage } from "http";
import { NextApiRequestCookies } from "next/dist/server/api-utils";

declare global {
  interface CustomNextApiRequest extends IncomingMessage {
    prisma: PrismaClient;
    cookies: NextApiRequestCookies;
  }
}

export type App = {
  id: string;
  name: string;
  description?: string;
  githubUpdateRepo?: string;
  iconURL?: string;
  createdAt: number;
};
export type AppWithAnalytics = App & {
  limitedAnalytics: {
    launches: number;
    firstLaunches: number;
    launchDates: number[];
    firstLaunchDates: number[];
  };
  fullAnalytics: {
    deviceModels: Record<string, number>;
    deviceOs: Record<string, number>;
    langRegion: Record<string, number>;
    launches: number;
    firstLaunches: number;
    launchDates: number[];
    firstLaunchDates: number[];
  };
};
