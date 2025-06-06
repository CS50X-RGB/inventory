import { Request, Response, NextFunction } from "express";

class RoleMiddleware{
    constructor(){}
    public async createRole(req : Request, res : Response,next : NextFunction){
        try {
            const { name } = req.body;
            if(!name){
                return res.sendError(null,"Role name is required",400);
            } 
            next();
        } catch (error : any) {
            return res.sendError(error.message,"An unexpected error occurred",500);
        }
    }
    public async getRole(req : Request, res : Response,next : NextFunction){
        try {
            const { name } = req.params;
            if(!name){
                return res.sendError(null,"Role Name is required",400);
            }
            next();
        } catch (error : any) {
            return res.sendError(error.message, "An unexpected error occurred",500);
        }
    }
}

export default RoleMiddleware;