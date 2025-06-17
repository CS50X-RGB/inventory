import { Router } from "express";
import PartNumberService from "../services/partNumberService";
import { uploadFile } from "../utils/upload";
import UserMiddleware from "../middleware/userMiddleware";
import PartNumberMiddleware from "../middleware/partNumberMiddleware";

const router = Router();
const partNumberService = new PartNumberService();
const userMiddleware = new UserMiddleware();
const partNumberMiddleware = new PartNumberMiddleware();

router.post(
    '/create',
    uploadFile.single("file"),
    partNumberMiddleware.checkFile.bind(partNumberMiddleware),
  //  userMiddleware.verifyAdmin.bind(userMiddleware),
    partNumberService.createPartNumbers.bind(partNumberService)
);

router.get("/all/:page/:offset",
 //   userMiddleware.verifyAdmin.bind(userMiddleware),
    partNumberMiddleware.checkPageParams.bind(partNumberService),
    partNumberService.getPartNumber.bind(partNumberService),
);


router.delete("/delete/:id",
 //   userMiddleware.verifyAdmin.bind(userMiddleware),
    partNumberMiddleware.checkPartNumberId.bind(partNumberMiddleware),
    partNumberService.deletePartNumberByID.bind(partNumberService)
);

router.get("/search/all",
    userMiddleware.verifyAdmin.bind(userMiddleware),
    partNumberService.partNumberBySearch.bind(partNumberService)
)

export default router;