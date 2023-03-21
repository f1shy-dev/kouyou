import { Router } from "express";
import {
  createApp,
  getAppDetails,
  listAppsForUser,
} from "../controllers/app.controller";
import { verifyToken } from "../helpers/verifyToken";
import analyticsRouter from "./analytics.router";

const appRouter = Router();

appRouter.get("/", verifyToken, listAppsForUser);
appRouter.post("/", verifyToken, createApp);
appRouter.get("/:id", verifyToken, getAppDetails);

appRouter.use("/:id/analytics", analyticsRouter);

export default appRouter;
