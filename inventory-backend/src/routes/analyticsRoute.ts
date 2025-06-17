import {Router} from "express";
import AnalyticsService from "../services/analyticsService";
import UserMiddleware from "../middleware/userMiddleware";

const router = Router();
const userMiddleware = new UserMiddleware();
const analyticsService = new AnalyticsService();

router.get("/getCount",analyticsService.getAnalytics.bind(analyticsService));
router.get("/getPlanning",analyticsService.getPlanningGraph.bind(analyticsService));
export default router;
