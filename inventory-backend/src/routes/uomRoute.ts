import Router from "express";
import UOMService from "../services/uomService";
import UserMiddleware from "../middleware/userMiddleware";


const router = Router();

const uomService = new UOMService();
const userMiddleware = new UserMiddleware();

router.get("/all", userMiddleware.verifyAdmin.bind(userMiddleware), uomService.getAllSearchUOMS.bind(uomService));


export default router;