import { Request, Response } from "express";
import {
  aggregateFullAnalytics,
  aggregateLimitedAnalytics,
} from "../helpers/agregrate";
import prisma from "../helpers/client";

export const listAppsForUser = async (
  req: Request,
  res: Response
): Promise<void | Response<any, any>> => {
  const userId = req.userId;
  const apps = await prisma.app.findMany({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
  });

  res.json(apps);
};

export const createApp = async (
  req: Request,
  res: Response
): Promise<void | Response<any, any>> => {
  const userId = req.userId;
  //only admins can create apps
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (user?.isAdmin !== true) {
    return res.status(401).json({ message: "only admins can make apps" });
  }

  const { name, description, githubUpdateRepo } = req.body;

  if (!name) {
    return res.status(400).json({ message: "field 'name' is required" });
  }
  // githubUpdateRepo is optional but if it is supplied must be in format owner/repo
  if (githubUpdateRepo && !githubUpdateRepo.match(/^[^/]+\/[^/]+$/)) {
    return res
      .status(400)
      .json({ message: "field 'githubUpdateRepo' is invalid" });
  }

  const app = await prisma.app.create({
    data: {
      name,
      description,
      githubUpdateRepo,
      users: {
        connect: { id: userId },
      },
    },
  });

  res.json(app);
};

export const getAppDetails = async (
  req: Request,
  res: Response
): Promise<void | Response<any, any>> => {
  try {
    const app = await prisma.app.findFirstOrThrow({
      where: {
        id: req.params.id,
        users: {
          some: {
            id: req.userId,
          },
        },
      },
    });

    const limitedAnalytics = await prisma.limitedAnalyticsRecord.findMany({
      where: {
        app: {
          id: req.params.id,
        },
      },
    });

    const fullAnalytics = await prisma.fullAnalyticsRecord.findMany({
      where: {
        app: {
          id: req.params.id,
        },
      },
    });

    res.json({
      ...app,
      limitedAnalytics: aggregateLimitedAnalytics(limitedAnalytics),
      fullAnalytics: aggregateFullAnalytics(fullAnalytics),
    });
  } catch (e) {
    return res.status(404).json({ message: "App not found" });
  }
};
