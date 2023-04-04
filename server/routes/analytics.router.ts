import { Router } from "express";
import { postAnalyticsForApp } from "../controllers/analytics.controller";
const analyticsRouter = Router();

analyticsRouter.post("/:id/analytics", postAnalyticsForApp);

export default analyticsRouter;
