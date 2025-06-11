import { ObjectId } from "mongoose";

export interface BOMPlanningCreate {
    name: string;
    bomId: ObjectId;
    qty: number;
}

export interface PlanningCreateObject {
    name: string;
    assemblyLine: ObjectId;
    partNumber: ObjectId;
    qty: number;
}

export interface PlanningTransactionLineInterface {
    name: string;
    planning_bom_id: ObjectId;
    assembly_line_id: ObjectId;
    qty: number;
    status : "Locked"| "Released",
}

export interface PlanningTransactionBOMInterface {
    name: string,
    bomId: ObjectId,
    qty: number,
    status : "Locked"| "Released"
}