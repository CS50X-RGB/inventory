import { Router } from "express";
import UserMiddleware from "../middleware/userMiddleware";
import UserService from "../services/userService";

const router = Router();
const userMiddleware  = new UserMiddleware();
const userService = new UserService();

router.post('/login',userMiddleware.login.bind(userMiddleware),userService.login.bind(userService));
router.post('/signin',
    userMiddleware.signin.bind(userMiddleware),
    // userMiddleware.createUser.bind(userMiddleware),
    userService.signUpUser.bind(userService)
);
router.post('/create',
    userMiddleware.verifyAdmin.bind(userMiddleware),
    userMiddleware.createUser.bind(userMiddleware),
    userService.createUser.bind(userService)
);
router.get('/profile',userMiddleware.verifyAdmin.bind(userMiddleware),userService.getProfile.bind(userService));
router.get('/my/user',userMiddleware.verify.bind(userMiddleware),userService.getProfile.bind(userService));
router.get('/all-users',userMiddleware.verifyAdmin.bind(userMiddleware),userService.getAllUsers.bind(userService));
router.delete('/remove/:id',userMiddleware.deleteId.bind(userMiddleware),userService.deleteById.bind(userService));
router.put('/block/:id',userMiddleware.deleteId.bind(userMiddleware),userService.updateIsBlocked.bind(userService));
export default router;
