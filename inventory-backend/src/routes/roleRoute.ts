import { Router } from "express";
import RoleService from "../services/roleService";
import RoleMiddleware from "../middleware/roleMiddleware";
import UserMiddleware from "../middleware/userMiddleware";


const router = Router();
const roleService = new RoleService();
const roleMiddleware = new RoleMiddleware();
const userMiddleware = new UserMiddleware();

router.post('/',
    roleMiddleware.createRole.bind(roleMiddleware),
    roleService.createRole.bind(roleService)
);
router.get('/:name',
    roleMiddleware.getRole.bind(roleMiddleware),
    roleService.getRoleId.bind(roleService),
);

router.get('/all/roles',roleService.getRoles.bind(roleService));
export default router;
