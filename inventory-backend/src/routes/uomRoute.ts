import Router from "express";
import UOMService from "../services/uomService";
import UserMiddleware from "../middleware/userMiddleware";


const router = Router();

const uomService = new UOMService();
const userMiddleware = new UserMiddleware();

router.get("/all", uomService.getAllSearchUOMS.bind(uomService));


export default router;