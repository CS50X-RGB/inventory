import AssemblyLineRepo from "../database/repositories/assemblyLineRepo";
import BomRepo from "../database/repositories/bomRepo";
import { Request, Response } from "express";
import { AssemblyLineCreate } from "../interfaces/assemblyLineInterface";

class AssemblyLineService {
    private bomRepo: BomRepo;
    private assemblyLineRepo: AssemblyLineRepo;
    constructor() {
        this.bomRepo = new BomRepo();
        this.assemblyLineRepo = new AssemblyLineRepo();
    }
    public async createAssemblyLine(req: Request, res: Response) {
        try {
            const assemblyBody: AssemblyLineCreate = req.body;
            const bomId: any = req.params.bomId;
            const assemblyLineObject: any = await this.assemblyLineRepo.createAssemblyLine(assemblyBody);
            const updatebomId = await this.bomRepo.pushSubAssembly(assemblyLineObject._id, bomId, assemblyBody.required_qty * assemblyBody.unit_cost);
            return res.sendFormatted(updatebomId, "Created Sub Assembly", 200);
        } catch (error) {
            return res.sendError(error, "Error while creating assembly line", 500);
        }
    }
    public async createChildAssemblyLine(req: Request, res: Response) {
        try {
            const assemblyBody: AssemblyLineCreate = req.body;
            const bomId: any = req.params.bomId;
            const assemblyId : any = req.params.assemblyId;
            const assemblyLineObject: any = await this.assemblyLineRepo.createAssemblyLine(assemblyBody);
            console.log(assemblyLineObject,"Object");
            const parentUpdatedAssemblyLine = await this.assemblyLineRepo.pushChilds(assemblyLineObject._id,assemblyId);
            console.log(parentUpdatedAssemblyLine,"parent");
            const updatebomId = await this.bomRepo.pushCost(bomId, assemblyBody.required_qty * assemblyBody.unit_cost);
            return res.sendFormatted(updatebomId, "Created Child Sub Assembly", 200);
        } catch (error) {
            return res.sendError(error, "Error while creating child assembly line", 500);
        }
    }
    public async getSubAssemblyById(req: Request, res: Response) {
        try {
            const assemblyId : any = req.params.assemblyId;
            const assemblyObj = await this.assemblyLineRepo.getSubAssemblyById(assemblyId);
            return res.sendFormatted(assemblyObj,"Fetched details of the Assembly Line Details",200);
        } catch (error) {
            return res.sendError(error,"Error while fetching sub assembly line data",400);
        }
    }
}
export default AssemblyLineService;