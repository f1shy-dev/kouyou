import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import prisma from "./helpers/client";
import appRouter from "./routes/app.router";
import userRouter from "./routes/user.router";
import next from "next";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "./helpers/verifyToken";
import { clearFetchCache } from "./helpers/cache-fetch";
import {
  injectFakeAnalyticsData,
  injectFakeAnalyticsDataForAllApps,
} from "./helpers/fakeData";

const app = express();
const nextApp = next({ dev: process.env.NODE_ENV == "development" });
const handle = nextApp.getRequestHandler();
const port = process.env.PORT || 7979;
const versionString = process.env.npm_package_version
  ? " v" + process.env.npm_package_version
  : "";

app.use(bodyParser.json());
if (process.env.NODE_ENV === "development")
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.url.startsWith("/_next"))
      console.log(`[${req.method}] ${req.url}`);
    next();
  });

// app.get("/", (req: Request, res: Response) => {
//   res.json({
//     message: `kouyou analytics server${versionString} - frontend coming soon. api is at /api`,
//   });
// });

app.get("/api", async (req: Request, res: Response) => {
  res.json({
    message: `kouyou analytics server api${versionString}`,
    apps: await (await prisma.app.findMany()).length,
    users: await (await prisma.user.findMany()).length,
  });
});

app.use("/api/apps", appRouter);
app.use("/api/users", userRouter);
app.use(
  "/api/clear-gh-cache",
  verifyToken,
  async (req: Request, res: Response) => {
    await clearFetchCache();
    res.json({ message: "Cache cleared", success: true });
  }
);

type CustomRequest = Request & { prisma: PrismaClient };

nextApp.prepare().then(() => {
  app.get("*", (creq, res) => {
    const req = creq as CustomRequest;
    req.prisma = prisma;
    return handle(req, res);
  });

  app.listen(port, async () => {
    console.log(`✨ Server listening on port ${port}`);
    // check in the db if there are no users and if there are none, create a default user with name admin, password kouyou
    let users = await prisma.user.findMany();
    if (users.length === 0) {
      await prisma.user.create({
        data: {
          name: "admin",
          email: "admin@kouyou.local",
          //passwordhash is sha256 of "kouyou"
          passwordHash:
            "2afa12ec4007acc98b38dcbefa82220e615dfa9840087c7ac84deaea98bfe706",
          isAdmin: true,
        },
      });
      console.log(
        "🙌 No users found, default user was created with email 'admin@kouyou.local' and password 'kouyou'"
      );
    }

    if (
      process.env.INJECT_FAKE == "true" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("🤖 Injecting fake analytics data");
      await injectFakeAnalyticsDataForAllApps();
    }
  });
});
