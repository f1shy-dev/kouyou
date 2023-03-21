import { Router } from "express";
import { postAnalyticsForApp } from "../controllers/analytics.controller";
const analyticsRouter = Router();

analyticsRouter.post("/", postAnalyticsForApp);

export default analyticsRouter;
