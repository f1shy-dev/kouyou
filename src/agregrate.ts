import { FullAnalyticsRecord, LimitedAnalyticsRecord } from "@prisma/client";

export const aggregateFullAnalytics = (analytics: FullAnalyticsRecord[]) => {
  const summary = {
    deviceModels: {} as Record<string, number>,
    deviceOs: {} as Record<string, number>,
    langRegion: {} as Record<string, number>,
    launches: analytics.length,
    firstLaunches: analytics.filter((a) => a.firstLaunch).length,
  };

  analytics.forEach((a) => {
    summary.deviceModels[a.deviceModel] =
      (summary.deviceModels[a.deviceModel] || 0) + 1;
    summary.deviceOs[a.deviceOs] = (summary.deviceOs[a.deviceOs] || 0) + 1;
    summary.langRegion[a.langRegion] =
      (summary.langRegion[a.langRegion] || 0) + 1;
  });

  return summary;
};

export const aggregateLimitedAnalytics = (
  analytics: LimitedAnalyticsRecord[]
) => {
  return {
    launches: analytics.length,
    firstLaunches: analytics.filter((a) => a.firstLaunch).length,
  };
};
