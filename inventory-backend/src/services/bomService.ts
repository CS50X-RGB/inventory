import BomRepo from "../database/repositories/bomRepo";
import { Request, Response } from "express";
import { BomCreateInterface } from "../interfaces/bomInterface";

class BomService {
    private bomRepo: BomRepo
    constructor() {
        this.bomRepo = new BomRepo();
    }
    public async createBOM(req: Request, res: Response) {
        try {
            const bomObject: BomCreateInterface = req.body;
            const bomCreation = await this.bomRepo.createBom(bomObject);
            return res.sendFormatted(bomCreation, "Bom Created", 200);
        } catch (error: any) {
            return res.sendError(error, "Error while creating Bom", 400);
        }
    }
    public async getBoms(req: Request, res: Response) {
        try {
            const page = parseInt(req.params.page || "1", 10);
            const offset = parseInt(req.params.offset || "10", 10);
            const search = (req.query.search as string | undefined)?.trim();
            const { boms, count } = await this.bomRepo.getBoms(page, offset, search);

            return res.sendArrayFormatted(boms, `${count} boms Fetched`, 200);
        } catch (error) {
            console.error(error);
            return res.sendError(error, "Error while getting Boms", 500);
        }
    }
    public async getBomById(req: Request, res: Response) {
        try {
            const bomId: any = req.params.bomId;
            const bomObject = await this.bomRepo.getBomById(bomId);
            return res.sendFormatted(bomObject, `Bom Object found`, 200);
        } catch (error) {
            return res.sendError(error, "Error while getting bom objxect", 500);
        }
    }
    public async bombySearch(req: Request, res: Response) {
        try {
            const search: any = (req.query.search as string | undefined);
            const toplevel = await this.bomRepo.getBOMBySearch(search);
            return res.sendArrayFormatted(toplevel, "Fetched Top Levels", 200);
        } catch (error) {
            return res.sendError(error, "Error while getting Top Levels");
        }
    }
    public async getBOMWholeImage(req: Request, res: Response) {
        try {
            const bomId: any = req.params.bomId;
            const qty: any = req.body;
            const wholeBomObject = await this.bomRepo.createWholeBomImage(bomId, qty);
            let maxBuildable = Infinity;
            if (wholeBomObject) {
                for (const bom of wholeBomObject) {
                    const inStock = bom.partNumber?.in_stock || 0;
                    const requiredQty = bom.required_qty || 1;

                    if (requiredQty > 0) {
                        const possibleBuilds = Math.floor(inStock / requiredQty);
                        maxBuildable = Math.min(maxBuildable, possibleBuilds);
                    }
                }
            }
            const objectToSend = {
                bom: wholeBomObject,
                maxBom: maxBuildable
            }
            return res.sendArrayFormatted(objectToSend, "Bom Object Found", 200);
        } catch (error) {
            return res.sendError(error, "Error occured during fethcing bom Object", 400);
        }
    }
    public async createWholeBomPlanning(req: Request, res: Response) {
        try {
            const bomId: any = req.params.bomId;
            const { qty } = req.body;
            const allLines = await this.bomRepo.createWholePlanning(bomId, Number(qty));
            return res.sendArrayFormatted([], "Planning for Bom is successfully done!", 200);
        } catch (error) {
            return res.sendError("Error for creating bom planning", "Error while doing planing", 400);
        }
    }
    public async getPlanningModels(req: Request, res: Response) {
        try {
            const page = parseInt(req.params.page, 10);
            const offset = parseInt(req.params.offset, 10);

            if (isNaN(page) || isNaN(offset)) {
                return res.sendError(null, "Invalid pagination parameters", 400);
            }

            const planningModels = await this.bomRepo.getPlanningPagedPlanning(page, offset);
            return res.sendArrayFormatted(planningModels, "Planning Models fetched", 200);
        } catch (error) {
            return res.sendError(error, "Error while getting planning models", 400);
        }
    }
    // public async realseBomQty(req : Request,res : Response){
    //     try {
    //         const bomId = req.params.bomId;

    //     } catch (error) {
            
    //     }
    // }
}
export default BomService;