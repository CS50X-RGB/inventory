import { Request, Response } from "express";
import UOMRepo from "../database/repositories/unitOfMeasurementrRepository";
import { RoleInterface } from "../interfaces/roleInterface";

class UOMService {
    private uomRepo: UOMRepo;
    constructor() {
        this.uomRepo = new UOMRepo();
    }
    public async createUOMS(names: RoleInterface[]): Promise<void> {
        try {
            for (const role of names) {
                const existingRole = await this.uomRepo.findUOMByName(role.name);
                if (existingRole) {
                    console.log(`UOM '${role.name}' already exists`);
                } else {
                    await this.uomRepo.createUOM(role);
                    console.log(`UOM '${role.name}' created successfully`);
                }
            }
        } catch (error: any) {
            console.error('Error while creating UOM:', error.message);
        }
    }

    public async getAllSearchUOMS(req: Request, res: Response): Promise<void> {
        try {
            const search : any = (req.query.search as string | undefined);
            const uoms = await this.uomRepo.getUOMBySearch(search);
            return res.sendArrayFormatted(uoms,"Fetched all uoms",200);
        } catch (error) {
            
        }
    }
}

export default UOMService;