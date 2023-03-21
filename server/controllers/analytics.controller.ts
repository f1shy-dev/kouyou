//basically router on /apps/:id/analytics

import { FullAnalyticsRecord, LimitedAnalyticsRecord } from "@prisma/client";
import { Request, Response } from "express";
import fetch from "node-fetch";
import prisma from "../helpers/client";

export const postAnalyticsForApp = async (
  req: Request,
  res: Response
): Promise<void | Response<any, any>> => {
  const appId = req.params.id;
  const data = req.body;
  const app = await prisma.app.findUnique({
    where: {
      id: appId,
    },
  });
  if (!app) {
    return res.status(404).json({ message: "App not found" });
  }

  if (data.type === "full") {
    const actualData = data as FullAnalyticsRecord;
    if (
      !actualData.deviceModel ||
      !actualData.deviceOs ||
      !actualData.langRegion ||
      !actualData.appVersion ||
      actualData.appVersion === "" ||
      actualData.firstLaunch === undefined
    ) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const analyticsPromise = prisma.fullAnalyticsRecord.create({
      data: {
        app: {
          connect: { id: appId },
        },
        deviceModel: actualData.deviceModel,
        deviceOs: actualData.deviceOs,
        firstLaunch: actualData.firstLaunch,
        langRegion: actualData.langRegion,
        appVersion: actualData.appVersion,
      },
    });
    if (app.githubUpdateRepo) {
      const updatePromise = fetch(
        `https://api.github.com/repos/${app.githubUpdateRepo}/releases`
      );
      const [analytics, updateReq] = await Promise.all([
        analyticsPromise,
        updatePromise,
      ]);
      const updateData = await updateReq.json();
      return res.json({
        message: "ok",
        updates: updateData,
      });
    }
    await analyticsPromise;
    res.json({ message: "ok" });
  }

  if (data.type === "limited") {
    const actualData = data as LimitedAnalyticsRecord;
    if (
      !actualData.appVersion ||
      actualData.appVersion === "" ||
      !actualData.firstLaunch
    ) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const analyticsPromise = prisma.limitedAnalyticsRecord.create({
      data: {
        app: {
          connect: { id: appId },
        },
        firstLaunch: actualData.firstLaunch,
        appVersion: actualData.appVersion,
      },
    });
    if (app.githubUpdateRepo) {
      const updatePromise = fetch(
        `https://api.github.com/repos/${app.githubUpdateRepo}/releases`
      );
      const [analytics, updateReq] = await Promise.all([
        analyticsPromise,
        updatePromise,
      ]);
      const updateData = await updateReq.json();
      return res.json({
        message: "ok",
        updates: updateData,
      });
    }
    await analyticsPromise;
    res.json({ message: "ok" });
  }
  res.status(400).json({ message: "Invalid data" });
};
