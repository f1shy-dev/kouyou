import { FullAnalyticsRecord, LimitedAnalyticsRecord } from "@prisma/client";

interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

const getDateMap = (
  datesArray: Date[],
  interval: number,
  timePeriod: number,
  from: Date
): number[] => {
  const intervalCount = Math.ceil(timePeriod / interval);

  // const intervalStart = new Date();
  const intervalStart = from;
  // intervalStart.setTime(intervalStart.getTime() - timePeriod);
  // const intervalStart = new Date();
  // intervalStart.setMinutes(0);
  // intervalStart.setSeconds(0);
  // intervalStart.setMilliseconds(0);
  // intervalStart.setHours(intervalStart.getHours() + 1);
  // console.log(intervalStart, intervalCount, datesArray.length, interval);
  // console.log(intervalStart);
  // intervalStart.setTime(
  //   Math.floor(intervalStart.getTime() / interval) * interval
  // );

  const hourCounts = new Map<number, number>();
  for (let i = 0; i < intervalCount; i++) {
    hourCounts.set(i, 0);
  }

  datesArray.forEach((date) => {
    const intervalIndex = Math.floor(
      (date.getTime() - intervalStart.getTime()) / interval
    );
    const currentCount = hourCounts.get(intervalIndex) || 0;
    hourCounts.set(intervalIndex, currentCount + 1);
  });

  const countsArray: number[] = [];
  for (let i = 0; i < intervalCount; i++) {
    const intervalCount = hourCounts.get(i) || 0;
    countsArray.push(intervalCount);
  }

  return countsArray;
};

type AnalyticsRecord = FullAnalyticsRecord | LimitedAnalyticsRecord;
function parse<T extends AnalyticsRecord>(
  analytics_raw: T[],
  query: ParsedQs
): [T[], number, number, Date] {
  const from = new Date(parseInt(query.from as string));
  const to = new Date(parseInt(query.to as string));

  const analytics =
    query.from && query.to
      ? analytics_raw.filter((a) => {
          const date = new Date(a.date);
          return (
            date.getTime() >= from.getTime() && date.getTime() <= to.getTime()
          );
        })
      : analytics_raw;

  const timeRange =
    query.from && query.to
      ? to.getTime() - from.getTime()
      : 1000 * 60 * 60 * 24;
  const interval = query.interval
    ? parseInt(query.interval as string)
    : 1000 * 60 * 60;
  return [analytics, timeRange, interval, from];
}

export const aggregateFullAnalytics = (
  analytics_raw: FullAnalyticsRecord[],
  query: ParsedQs
) => {
  const [analytics, timeRange, interval, from] = parse(analytics_raw, query);
  const summary = {
    deviceModels: {} as Record<string, number>,
    deviceOs: {} as Record<string, number>,
    langRegion: {} as Record<string, number>,
    launches: analytics.length,
    firstLaunches: analytics.filter((a) => a.firstLaunch).length,
    launchDates: getDateMap(
      analytics.map((a) => a.date),
      interval,
      timeRange,
      from
    ),
    firstLaunchDates: getDateMap(
      analytics.filter((i) => i.firstLaunch).map((a) => a.date),
      interval,
      timeRange,
      from
    ),
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
  analytics_raw: LimitedAnalyticsRecord[],
  query: ParsedQs
) => {
  const [analytics, timeRange, interval, from] = parse(analytics_raw, query);

  return {
    launches: analytics.length,
    firstLaunches: analytics.filter((a) => a.firstLaunch).length,
    launchDates: getDateMap(
      analytics.map((a) => a.date),
      interval,
      timeRange,
      from
    ),
    firstLaunchDates: getDateMap(
      analytics.filter((i) => i.firstLaunch).map((a) => a.date),
      interval,
      timeRange,
      from
    ),
  };
};
