import {Router} from "express";
import AnalyticsService from "../services/analyticsService";
import UserMiddleware from "../middleware/userMiddleware";

const router = Router();
const userMiddleware = new UserMiddleware();
const analyticsService = new AnalyticsService();

router.get("/getCount",userMiddleware.verifyAdmin.bind(userMiddleware),analyticsService.getAnalytics.bind(analyticsService));
router.get("/getPlanning",userMiddleware.verifyAdmin.bind(userMiddleware),analyticsService.getPlanningGraph.bind(analyticsService));
export default router;
