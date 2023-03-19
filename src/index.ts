import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import {
  FullAnalyticsRecord,
  LimitedAnalyticsRecord,
  PrismaClient,
} from "@prisma/client";
import { aggregateFullAnalytics, aggregateLimitedAnalytics } from "./agregrate";
import fetch from "node-fetch";
const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 7979;

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

app.use(bodyParser.json());

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers.authorization || "").split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  });
};

app.get("/", async (req: Request, res: Response) => {
  res.json({
    message: `kouyou analytics server${
      process.env.npm_package_version
        ? " v" + process.env.npm_package_version
        : ""
    }`,
    apps: await (await prisma.app.findMany()).length,
    users: await (await prisma.user.findMany()).length,
  });
});

app.post("/api/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  res.json({ token });
});

app.get("/api/apps", verifyToken, async (req: Request, res: Response) => {
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
});

app.post("/api/apps", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId;
  const { name, description, githubUpdateRepo } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
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
});

app.post("/api/apps/:id/analytics", async (req: Request, res: Response) => {
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
});

app.get("/api/apps/:id", verifyToken, async (req: Request, res: Response) => {
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
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
