import { ObjectId } from "mongoose";
import { BomCreateInterface } from "../../interfaces/bomInterface";
import BOMModel from "../models/bomModel";
import AssemblyLineRepo from "./assemblyLineRepo";
import { BOMPlanningCreate, PlanningCreateObject, PlanningTransactionBOMInterface, PlanningTransactionLineInterface } from "../../interfaces/planningInterface";
import PlanningRepo from "./planningRepo";
import PartNumberRepository from "./partNumberRepository";
import { AnyARecord } from "dns";

class BomRepo {
    private assemblyRepo: AssemblyLineRepo;
    private planningRepo: PlanningRepo;
    private partNumberRepo: PartNumberRepository;
    constructor() {
        this.assemblyRepo = new AssemblyLineRepo();
        this.planningRepo = new PlanningRepo();
        this.partNumberRepo = new PartNumberRepository();
    }
    public async createBom(bomObject: BomCreateInterface) {
        try {
            const createBOM = await BOMModel.create(bomObject);
            return createBOM.toObject();
        } catch (error) {
            throw new Error(`Error while creating Bom`);
        }
    }
    public async getBoms(page: number, offset: number, search?: string) {
        try {
            const skip = (page - 1) * offset;
            const query: any = {};
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }
            const boms = await BOMModel.find(query).skip(skip).limit(offset).lean();
            let count = await BOMModel.countDocuments();
            if (search) {
                count = await BOMModel.countDocuments(query);
            }
            return {
                boms,
                count
            };
        } catch (error) {
            throw Error('Error while viewing bulk BOMS');
        }
    }
    public async getBomById(bomId: any) {
        try {
            const bomObject = await BOMModel.findById(bomId);
            if (!bomObject) return null;
            if (bomObject.sub_line.length > 0) {
                await bomObject.populate({
                    path: "sub_line",
                    populate: [
                        { path: "uom" },
                        { path: "partNumber" }
                    ]
                });
            }
            return bomObject.toObject();
        } catch (error: any) {
            throw new Error(`Error caused by finding Bom`);
        }
    }
    public async getBOMBySearch(name: string): Promise<any | null> {
        try {
            let query = {};

            if (name && name.trim() !== "") {
                query = {
                    name: { $regex: new RegExp(name.trim(), "i") },
                };
            }
            const boms = await BOMModel.find(query);
            return boms;
        } catch (error) {
            throw new Error(`Error while getting all BOMS`);
        }
    }
    public async createWholeBomImage(bomId: ObjectId, qty: any): Promise<any[] | null> {
        try {
            const bomObject = await BOMModel.findById(bomId);
            if (!bomObject || !bomObject.sub_line || bomObject.sub_line.length === 0) {
                return null;
            }
            const allLines: any[] = [];
            for (const sub of bomObject.sub_line) {
                const subTree = await this.assemblyRepo.getAllChildrenFlat(sub, qty);
                allLines.push(...subTree);
            }

            return allLines;
        } catch (error) {
            console.error("Failed to create BOM image:", error);
            throw error;
        }
    }
    public async pushCost(bom_id: ObjectId, total_price: number): Promise<any | null> {
        try {
            const bomObjectUpdate = await BOMModel.findByIdAndUpdate(
                bom_id,
                {
                    $inc: { total_price: total_price },
                },
                { new: true }
            );
            return bomObjectUpdate?.toObject();
        } catch (error) {
            throw new Error(`Error while puhsing the sub assembly`);
        }
    }
    public async pushSubAssembly(sub_line_id: ObjectId, bom_id: ObjectId, total_price: number): Promise<any | null> {
        try {
            const bomObjectUpdate = await BOMModel.findByIdAndUpdate(
                bom_id,
                {
                    $addToSet: { sub_line: sub_line_id },
                    $inc: { total_price: total_price },
                },
                { new: true }
            );
            return bomObjectUpdate?.toObject();
        } catch (error) {
            throw new Error(`Error while puhsing the sub assembly`);
        }
    }
    public async getBomsByName(name: string): Promise<any | null> {
        try {
            const bomObject = await BOMModel.findOne({
                name
            }).lean();
            return bomObject;
        } catch (error) {
            throw Error(`Error while finding ${name} in bom Entity`);
        }
    }
    public async createWholePlanning(bomId: any, qty: number): Promise<any[] | null> {
        try {
            const getWholeBomObject = await this.createWholeBomImage(bomId, qty);
            const bomObject: any = await this.getBomById(bomId);
            const lines = [];
            if (bomObject && getWholeBomObject) {
                const createBomObject: BOMPlanningCreate = {
                    name: `${bomObject.name}_${new Date().toISOString()}`,
                    bomId: bomObject._id,
                    qty: qty
                };

                const plannedMaster: any = await this.planningRepo.createBomPlanning(createBomObject);
                const transactionMaster: PlanningTransactionBOMInterface = {
                    name: `${bomObject.name}_${new Date().toISOString()}`,
                    bomId: bomObject._id,
                    qty: qty,
                    status: "Locked"
                }
                const transactionMasterObject: any = await this.planningRepo.createTransactionParent(transactionMaster);
                for (const obj of getWholeBomObject) {
                    const assemblyLinePlan: PlanningCreateObject = {
                        name: `${obj.partNumber.name}_${new Date().toISOString()}`,
                        assemblyLine: obj._id,
                        partNumber: obj.partNumber._id,
                        qty: obj.required_qty * qty,
                    };
                    await this.partNumberRepo.lockPartNumber(assemblyLinePlan.partNumber, assemblyLinePlan.qty);
                    const assemblyLinePlanObject: any = await this.planningRepo.createAsssemblyLine(assemblyLinePlan);
                    if (transactionMaster) {
                        const transactionLineObject: PlanningTransactionLineInterface = {
                            name: `${obj.partNumber.name}_${new Date().toISOString()}`,
                            planning_bom_id: transactionMasterObject._id,
                            assembly_line_id: obj._id,
                            qty: obj.required_qty * qty,
                            status: "Locked"
                        }
                        const transactionObject: any = await this.planningRepo.createTransactionLine(transactionLineObject);
                        lines.push(assemblyLinePlanObject.toObject());
                        await this.planningRepo.pushLineTransaction(transactionObject._id, transactionMasterObject._id);
                    }
                    await this.planningRepo.pushAssemblyLine(assemblyLinePlanObject._id, plannedMaster._id);
                }
            }
            return lines;
        } catch (error) {
            console.error("Error in createWholePlanning:", error);
            throw error;
        }
    }
    public async getPlanningPagedPlanning(page: number, offset: number) {
        try {
            const { bomPlanning, countDocuments } = await this.planningRepo.getBOMsPlanning(page, offset);
            return { data: bomPlanning, count: countDocuments };
        } catch (error) {
            throw new Error(`Error during getting from planning repo ${error}`);
        }
    }
    public async realsePlannedPlanning(bomId: ObjectId, qty: number) {
        try {
            const updatedPartNumbers = [];
            const partNumbersIds = await this.planningRepo.getPlanningAssemblyLines(bomId, qty);
            const getBomId: any = await this.planningRepo.getBomIdByPlanningParent(bomId);

            if (getBomId) {
                const bomObject = await this.getBomById(getBomId);
                const transactionMaster: PlanningTransactionBOMInterface = {
                    name: `${bomObject?.name}_${new Date().toISOString()}`,
                    bomId: getBomId,
                    qty: qty,
                    status: "Released"
                }
                const transactionMasterObject: any = await this.planningRepo.createTransactionParent(transactionMaster);
                for (const { partNumber, total, planningLineId, assemblyLine } of partNumbersIds) {
                    const updatedPartNumber = await this.partNumberRepo.realsePartNumber(partNumber, total);
                    updatedPartNumbers.push(updatedPartNumber);
                    await this.planningRepo.updatePlanningEntites(planningLineId, total, bomId);
                    const partNumeberObject = await this.partNumberRepo.getPartNumberById(partNumber);
                    if (partNumeberObject && transactionMasterObject) {
                        const transactionLine: PlanningTransactionLineInterface = {
                            name: `${partNumeberObject.name}_${new Date().toISOString()}`,
                            planning_bom_id: transactionMasterObject._id,
                            assembly_line_id: assemblyLine,
                            qty: total,
                            status: "Released"
                        }
                        const transactionLineObject: any = await this.planningRepo.createTransactionLine(transactionLine);
                        await this.planningRepo.pushLineTransaction(transactionLineObject._id, transactionMasterObject._id);
                    }
                }
            }
            await this.planningRepo.updateBomPlanning(bomId, qty);
            return updatedPartNumbers;
        } catch (error) {
            throw new Error(`Error while updating partnumbers`);
        }
    }

    public async getTransactionPages(page: number, offset: number, status = "all") {
        try {
            const object = await this.planningRepo.getTransactions(page, offset, status);

            return object;
        } catch (error) {
            throw new Error(`Error while getting transactions`);
        }
    }
}

export default BomRepo;