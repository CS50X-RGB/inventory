import mongoose, { Schema, Document, Types } from "mongoose";

// Enum
enum PlanningStatus {
    LOCKED = "locked",
    RELEASED = "released", 
}

// Interface
export interface IPlanningAssemblyLineModel extends Document {
    name: string;
    assemblyLine: Types.ObjectId;
    partNumber: Types.ObjectId;
    qty: number;
    lineStatus: PlanningStatus;
    createdAt: Date;
    updatedAt: Date;
}

// Schema
const PlanningAssemblyLineSchema = new Schema<IPlanningAssemblyLineModel>(
    {
        name: {
            type: String,
            required: true,
        },
        assemblyLine: {
            type: Schema.Types.ObjectId,
            ref: "AssemblyLine",
            required: true,
        },
        partNumber: {
            type: Schema.Types.ObjectId,
            ref: "PartNumber",
            required: true,
        },
        qty: {
            type: Number,
            required: true,
        },
        lineStatus: {
            type: String,
            enum: Object.values(PlanningStatus),
            default: PlanningStatus.LOCKED,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IPlanningAssemblyLineModel>(
    "planning_assembly_line",
    PlanningAssemblyLineSchema
);
