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
            const partUsageMap: Map<string, { inStock: number, totalRequired: number }> = new Map();

            if (wholeBomObject) {
                for (const bom of wholeBomObject) {
                    const partId = bom.partNumber?._id?.toString();
                    if (!partId) continue;

                    const inStock = bom.partNumber?.in_stock || 0;
                    const requiredQty = bom.required_qty || 1;

                    const existing = partUsageMap.get(partId);
                    if (existing) {
                        existing.totalRequired += requiredQty;
                        // keep the minimum inStock seen for that part, in case it's inconsistent
                        existing.inStock = Math.min(existing.inStock, inStock);
                    } else {
                        partUsageMap.set(partId, { inStock, totalRequired: requiredQty });
                    }
                }

                for (const { inStock, totalRequired } of partUsageMap.values()) {
                    if (totalRequired > 0) {
                        const possibleBuilds = Math.floor(inStock / totalRequired);
                        maxBuildable = Math.min(maxBuildable, possibleBuilds);
                    }
                }
            }

            const objectToSend = {
                bom: wholeBomObject,
                maxBom: maxBuildable
            };

            return res.sendArrayFormatted(objectToSend, "Bom Object Found", 200);
        } catch (error) {
            return res.sendError(error, "Error occurred during fetching bom Object", 400);
        }
    }

    public async getAllBOMWholeImage(req: Request, res: Response) {
        try {
            let { bomId }: any = req.body;

            // if (bomId instanceof Set) {
            //     bomId = Array.from(bomId);
            // }

            const allBOMs: any[] = [];
            const partStockMap: Map<string, number> = new Map();

            // Pass 1: Collect all unique part stocks
            for (const id of bomId) {
                const wholeBomObject = await this.bomRepo.createWholeBomImage(id, 1);

                if (wholeBomObject) {
                    for (const bom of wholeBomObject) {
                        const partId = bom.partNumber?.name?.toString();
                        const inStock = bom.partNumber?.in_stock || 0;

                        if (!partId || partStockMap.has(partId)) continue;
                        partStockMap.set(partId, inStock);
                    }
                }
            }
            console.log(partStockMap, "map");
            // Pass 2: Process each BOM, sum same part quantities
            for (const id of bomId) {
                const wholeBomObject = await this.bomRepo.createWholeBomImage(id, 1);
                let maxCanBuild = Infinity;
                const localRequired: Map<string, number> = new Map();
                const bomObject = await this.bomRepo.getBomById(id);
                if (wholeBomObject) {
                    for (const bom of wholeBomObject) {
                        const partId = bom.partNumber?.name?.toString();
                        const requiredQty = bom.required_qty || 1;
                        if (!partId || requiredQty <= 0) continue;

                        localRequired.set(
                            partId,
                            (localRequired.get(partId) || 0) + requiredQty
                        );
                    }

                    // Calculate max builds from summed required quantities
                    for (const [partId, totalRequiredQty] of localRequired) {
                        const availableStock = partStockMap.get(partId) ?? 0;

                        const possibleBuilds = Math.floor(availableStock / totalRequiredQty);
                        maxCanBuild = Math.min(maxCanBuild, possibleBuilds);
                        if (partId === "2078193") {
                            console.log(availableStock,"avail",possibleBuilds,"maxi");
                        }
                    }

                    // Deduct used stock
                    for (const [partId, totalRequiredQty] of localRequired) {
                        const usedQty = totalRequiredQty * maxCanBuild;
                        const remaining = (partStockMap.get(partId) || 0) - usedQty;
                        partStockMap.set(partId, remaining);
                    }
                }
                console.log("after", partStockMap);

                allBOMs.push({
                    bomId: id,
                    bomInfo: bomObject,
                    bom: wholeBomObject,
                    maxBom: maxCanBuild
                });
            }

            return res.sendArrayFormatted({ allBOMs }, "All BOMs fetched successfully", 200);
        } catch (error) {
            return res.sendError(error, "Error occurred during fetching BOMs", 400);
        }
    }

    public async createWholeBomPlanning(req: Request, res: Response) {
        try {
            const bomId: any = req.params.bomId;
            const { qty } = req.body;
            const allLines = await this.bomRepo.createWholePlanning(bomId, Number(qty));
            return res.sendArrayFormatted(allLines, "Planning for Bom is successfully done!", 200);
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
    public async realseBomQty(req: Request, res: Response) {
        try {
            const bomId: any = req.params.bomId;
            const { qty } = req.body;
            const updatedPartNumbers = await this.bomRepo.realsePlannedPlanning(bomId, qty);
            return res.sendArrayFormatted(updatedPartNumbers, "Updated Part Numbers", 200);
        } catch (error) {
            return res.sendError(error, "Error while realsing the planning enetites", 400);
        }
    }

    public async getPlanningModelsForAll(req: Request, res: Response) {
        try {
            const assignedQuantities: Record<any, any> = req.body.assignedQuantities;
            console.log(assignedQuantities, "body");
            const totalLines: any[] = [];

            for (const [bomId, qty] of Object.entries(assignedQuantities)) {
                const allLines: any = await this.bomRepo.createWholePlanning(bomId, qty);
                totalLines.push(...allLines);
            }

            return res.sendArrayFormatted(totalLines, "Fetched Successfully", 200);
        } catch (error) {
            console.error("Error in getPlanningModelsForAll:", error);
            return res.sendError("Error while fetching lines", "Error while locking lines", 400);
        }
    }


    public async getTransactions(req: Request, res: Response) {
        try {
            const page = parseInt(req.params.page, 10);
            const offset = parseInt(req.params.offset, 10);
            const status = req.query.status as string;

            if (isNaN(page) || isNaN(offset)) {
                return res.sendError("Error", "error", 400);
            }

            const object = await this.bomRepo.getTransactionPages(page, offset, status);

            return res.sendArrayFormatted(object, "Fetched Planning Entites", 200);
        } catch (error) {
            return res.sendError('Error while getting planning', 'Error while getting planning', 400);
        }
    }

}
export default BomService;