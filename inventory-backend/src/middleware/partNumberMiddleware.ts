import { Request, Response, NextFunction } from "express";

class PartNumberMiddleware {
    constructor() { }
    public async checkFile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return res.sendError(null, "File Not Found", 400);
            }
            next();
        } catch (error) {
            return res.sendError("Error in middleware", "Error while creating part Numbers", 500);
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
            return res.sendError(`Error while getting part numbers`,'Error on getting Part Numbers',400)
        }
    }
    public async checkPartNumberId(req : Request,res : Response,next : NextFunction){
        try {
            const id = req.params.id;
            if(!id){
                return res.sendError(null,"Part Number Id Not Found",400);
            }
            next();
        } catch (error) {
            return res.sendError(`Error while deleting part number`,`Error deleting part number`,400);
        }
    }
}

export default PartNumberMiddleware;