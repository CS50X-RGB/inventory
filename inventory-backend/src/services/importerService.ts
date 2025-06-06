import AssemblyLineRepo from "../database/repositories/assemblyLineRepo";
import BomRepo from "../database/repositories/bomRepo";
import PartNumberRepository from "../database/repositories/partNumberRepository";
import UOMRepo from "../database/repositories/unitOfMeasurementrRepository";
import { Request, Response } from "express";
import * as XLSX from "xlsx";
import fs from "fs";
import { AssemblyLineCreate } from "../interfaces/assemblyLineInterface";
import { PartNumberCreationInterface } from "../interfaces/partNumberInterface";

class ImporterService {
    private partNumberRepo: PartNumberRepository;
    private assemblyLineRepo: AssemblyLineRepo;
    private bomRepo: BomRepo;
    private uomRepo: UOMRepo;
    constructor() {
        this.partNumberRepo = new PartNumberRepository();
        this.assemblyLineRepo = new AssemblyLineRepo();
        this.bomRepo = new BomRepo();
        this.uomRepo = new UOMRepo();
    }
    public async importFile(req: Request, res: Response) {
        if (!req.file) {
            return res.sendError("File is missing", "File is not send", 400);
        }
        try {
            const workbook = XLSX.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet);
            fs.unlink(req.file.path, (err) => {
                if (err) console.log("File Deletion Failed:", err);
            })
            const normalizedData = sheetData.map((row: any) => {
                const rawItem = row["ITEM"];
                const cleanedItem =
                    typeof rawItem === "string" ? rawItem.replace(/•/g, "").trim() : rawItem;

                return {
                    tla: row["TLA"] ?? "",
                    level: row["LVL"] ?? "",
                    partNumber: cleanedItem,
                    required_qty: row["Calculated Quantity"] ?? "",
                    description: row["DESCRIPTION"] ?? "",
                    uom: row["UOM"] ?? "",
                    unit_cost: row["UNIT COST $"] ?? "",
                    parent_part: row['Parent Part'] ?? "",
                };
            });
            const finalItems = [];
            for (const item of normalizedData) {
                if (item.level === 0) {
                    const obj = {
                        name: item.partNumber,
                        description: item.description
                    };
                    const bomObject = await this.bomRepo.createBom(obj);
                    finalItems.push(bomObject);
                } else if (item.level > 0) {
                    const uom = await this.uomRepo.getUOMIdByName(item.uom);
                    console.log(uom._id);
                    let parent_id = null;
                    let parent_model: "BOM" | "AssemblyLine" = "BOM";
                    let partNumber = await this.partNumberRepo.getPartNumberIdByName(item.partNumber);
                    if (!partNumber) {
                        const part_item: PartNumberCreationInterface = {
                            name: item.partNumber,
                            description: item.description,
                            in_stock: 1000,
                            reorder_qty: 30,
                        }
                        const partObject = await this.partNumberRepo.createPartNumber(part_item);
                        partNumber = partObject;
                    }
                    if (item.level === 1) {
                        parent_id = await this.bomRepo.getBomsByName(item.parent_part);
                        parent_model = "BOM";
                    } else {
                        parent_id = await this.assemblyLineRepo.getSubAssemblyByName(item.parent_part);
                        parent_model = "AssemblyLine";
                    }
                    const assemblyLineObject: AssemblyLineCreate = {
                        name: `${item.partNumber}`,
                        partNumber: partNumber._id,
                        uom: uom._id,
                        parent_id: parent_id._id,
                        parent_model: parent_model,
                        level: item.level,
                        required_qty: Number(item.required_qty),
                        unit_cost: Number(item.unit_cost)
                    }
                    const assembly: any = await this.assemblyLineRepo.createAssemblyLine(assemblyLineObject);
                    if (item.level === 1) {
                        const updatedBom = await this.bomRepo.pushSubAssembly(assembly._id, parent_id, assemblyLineObject.required_qty * assemblyLineObject.unit_cost);
                    } else if (item.level > 1) {
                        const updatedParentSubAssembly = await this.assemblyLineRepo.pushChilds(assembly._id, parent_id);
                        const bom_id = await this.bomRepo.getBomsByName(item.tla);
                        console.log(bom_id,item.level,"BOM Object with level");
                        if (bom_id) {
                            console.log(assemblyLineObject.required_qty * assemblyLineObject.unit_cost,"Cost to increase");
                            const bomObject = await this.bomRepo.pushCost(bom_id._id, assemblyLineObject.required_qty * assemblyLineObject.unit_cost);
                            console.log(item.level);
                        }
                    }
                    finalItems.push(assembly);
                }
            }

            return res.sendArrayFormatted(finalItems, "Fetched Data from BOM Creation", 200);
        } catch (error) {
            return res.sendError(error, "Error while creating bom", 400);
        }
    }
}

export default ImporterService;