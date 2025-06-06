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