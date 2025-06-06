import { Request, Response, NextFunction } from "express";
import { AssemblyLineCreate } from "../interfaces/assemblyLineInterface";

class BOMMiddleware {
    constructor() { }
    public async createBOM(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, description } = req.body;
            if (!name || !description) {
                return res.sendError("Error while creating bom", "Error while creating bom", 400);
            }
            next();
        } catch (error) {
            return res.sendError(error, "Error while creating bom", 400);
        }
    }
    public async checkPageParams(req: Request, res: Response, next: NextFunction) {
        try {
            const page = req.params.page;
            const offset = req.params.offset;
            if (!page || !offset) {
                return res.sendError(null, "Page Params not found", 400);
            }
            next();
        } catch (error) {
            return res.sendError(`Error while getting boms`, 'Error on getting BOMS', 400)
        }
    }
    public async checkBomId(req: Request, res: Response, next: NextFunction) {
        try {
            const bomId = req.params.bomId;
            if (!bomId) {
                return res.sendError('Error while getting bom id', "Error While getting Bom Id", 400);
            }
            next();
        } catch (error) {
            return res.sendError(`Error while getting bom`, `Error on fetching bom object`, 400);
        }
    }
    public async checkCreateSubAssembly(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                name,
                parent_id,
                partNumber,
                parent_model,
                required_qty,
                uom,
                level,
                unit_cost
            }: AssemblyLineCreate = req.body;
            const bomId = req.params.bomId;
            if (
                !bomId ||
                !name ||
                !parent_id ||
                !partNumber ||
                !parent_model ||
                !required_qty ||
                !uom ||
                !level ||
                !unit_cost
            ) {
                return res.sendError("Error while creating assembly line", "Required fields missing", 400);
            }

            next();
        } catch (error) {
            return res.sendError(`Error while creating sub assembly`, `Error on fetching bom object`, 400);
        }
    }
    public async checkInvenotryData(req: Request, res: Response, next: NextFunction) {
        try {
            const bomId = req.params.bomId;
            const { qty } = req.body;
            if (!bomId || !qty) {
                return res.sendError('Error while getting the bom object', 'Bom Object cant be retrived', 400);
            }
            next();
        } catch (error) {
            return res.sendError('Error while getting the bom object', 'Bom Object cant be retrived', 500);
        }
    }
    public async checkSubAssemblyId(req: Request, res: Response, next: NextFunction) {
        try {
            const assemblyId = req.params.assemblyId;
            if (!assemblyId) {
                return res.sendError('Error while getting assembly id', "Error While getting Assembly Id", 400);
            }
            next();
        } catch (error) {
            return res.sendError(`Error while getting bom`, `Error on fetching bom object`, 400);
        }
    }
    public async checkChildSubAssemblyId(req: Request, res: Response, next: NextFunction) {
        try {
            const assemblyId = req.params.assemblyId;
            const bomId = req.params.bomId;
            if (!assemblyId || !bomId) {
                return res.sendError('Error while getting bom id and sub assembly line id', "Error While getting Bom Id and sub assembly line id", 400);
            }
            next();
        } catch (error) {
            return res.sendError(`Error while getting bom`, `Error on creating sub assembly line object`, 400);
        }
    }
}

export default BOMMiddleware;