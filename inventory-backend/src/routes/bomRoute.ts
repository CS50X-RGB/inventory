import { Router } from "express";
import UserMiddleware from "../middleware/userMiddleware";
import BomService from "../services/bomService";
import BOMMiddleware from "../middleware/bomMiddleware";
import AssemblyLineService from "../services/assemblyLineService";
import { uploadFile } from "../utils/upload";
import ImporterService from "../services/importerService";

const router = Router();
const userMiddlewate = new UserMiddleware();
const bomService = new BomService();
const bomMiddleware = new BOMMiddleware();
const assemblyService = new AssemblyLineService();
const importerService = new ImporterService();

router.post("/create",bomMiddleware.createBOM.bind(bomMiddleware),bomService.createBOM.bind(bomService));
router.get("/get/:page/:offset",bomMiddleware.checkPageParams.bind(bomMiddleware),bomService.getBoms.bind(bomService));
router.get("/get/all",bomService.bombySearch.bind(bomService));
router.get("/single/:bomId",bomMiddleware.checkBomId.bind(bomMiddleware),bomService.getBomById.bind(bomService));
router.post("/create/sub/:bomId",userMiddlewate.verifyAdmin.bind(userMiddlewate),bomMiddleware.checkCreateSubAssembly.bind(bomMiddleware),assemblyService.createAssemblyLine.bind(assemblyService));
router.get("/child/:assemblyId",bomMiddleware.checkSubAssemblyId.bind(bomMiddleware),assemblyService.getSubAssemblyById.bind(assemblyService));
router.get("/search/bom",bomService.bombySearch.bind(bomService));
router.post("/create/sub/:bomId/:assemblyId",bomMiddleware.checkChildSubAssemblyId.bind(bomMiddleware),bomMiddleware.checkCreateSubAssembly.bind(bomMiddleware),assemblyService.createChildAssemblyLine.bind(assemblyService));
router.post("/whole/:bomId",bomMiddleware.checkInvenotryData.bind(bomMiddleware),bomService.getBOMWholeImage.bind(bomService));
router.post("/import",
    uploadFile.single("file"),
    importerService.importFile.bind(importerService)
);
router.post("/plan/create/:bomId",bomService.createWholeBomPlanning.bind(bomService));
router.get("/plan/get/:page/:offset",bomService.getPlanningModels.bind(bomService));
router.get("/plan/get/transaction/:page/:offset",bomService.getTransactions.bind(bomService));
router.get("/plan/get/transaction/:name/:page/:offset",bomService.getTransactionsByBomName.bind(bomService));
router.put("/plan/realse/:bomId",bomMiddleware.checkBomId.bind(bomMiddleware),bomService.realseBomQty.bind(bomService));
router.post("/plan/multi",bomService.getAllBOMWholeImage.bind(bomService));
router.post("/plan/lock/all",bomService.getPlanningModelsForAll.bind(bomService));
router.delete("/delete/:bomId",bomMiddleware.checkBomId.bind(bomMiddleware),bomService.deleteBomEntries.bind(bomService));
export default router;