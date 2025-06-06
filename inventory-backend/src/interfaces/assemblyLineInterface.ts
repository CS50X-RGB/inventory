import mongoose from "mongoose";

export interface AssemblyLineCreate {
    name: string;
    partNumber: mongoose.Schema.Types.ObjectId;
    required_qty: number;
    unit_cost: number;
    parent_id: mongoose.Schema.Types.ObjectId;
    parent_model: "BOM" | "AssemblyLine";
    child_id?: mongoose.Schema.Types.ObjectId[];
    level: number;
    uom: mongoose.Schema.Types.ObjectId;
}

