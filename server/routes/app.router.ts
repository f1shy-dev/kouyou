import { Router } from "express";
import {
  createApp,
  deleteAnalyticsForApp,
  deleteApp,
  getAppDetails,
  listAppsForUser,
  patchApp,
} from "../controllers/app.controller";
import { verifyToken } from "../helpers/verifyToken";
import analyticsRouter from "./analytics.router";

const appRouter = Router();

appRouter.get("/", verifyToken, listAppsForUser);
appRouter.post("/", verifyToken, createApp);
appRouter.get("/:id", verifyToken, getAppDetails);
appRouter.delete("/:id", verifyToken, deleteApp);
appRouter.patch("/:id", verifyToken, patchApp);

appRouter.delete("/:id/analytics", verifyToken, deleteAnalyticsForApp);
appRouter.use("/:id/analytics", analyticsRouter);

export default appRouter;
