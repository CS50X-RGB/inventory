import BomRepo from "../database/repositories/bomRepo";
import PartNumberRepository from "../database/repositories/partNumberRepository";
import PlanningRepo from "../database/repositories/planningRepo";
import { Request, Response } from "express";

class AnalyticsService {
    private partRepo: PartNumberRepository;
    private bomRepo: BomRepo;
    private planningRepo: PlanningRepo;
    constructor() {
        this.bomRepo = new BomRepo();
        this.partRepo = new PartNumberRepository();
        this.planningRepo = new PlanningRepo();
    }
    public async getAnalytics(req: Request, res: Response) {
        try {
            const countBoms = await this.bomRepo.countBoms();
            const countPartNumbers = await this.partRepo.countPartNumber();
            const zeroCountInStockPartNumber = await this.partRepo.getZeroPartCountNumbers();
            const { Locked, Released } = await this.planningRepo.getStatusCount();
            return res.sendFormatted({
                boms : countBoms,
                partNumbers : countPartNumbers,
                locked : Locked,
                zero : zeroCountInStockPartNumber,
                realsed : Released
            },
            "Fetched Analytics",
            200
        );
        } catch (error) {
            return res.sendError(error, 'Error while getting count', 400);
        }
    }
}
export default AnalyticsService;