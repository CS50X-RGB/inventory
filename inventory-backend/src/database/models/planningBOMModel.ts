import mongoose, { Schema, Document, Types } from "mongoose";


export interface IPlanningBOMModel extends Document {
    name: string;
    bomId: Types.ObjectId;
    qty: number;
    createdAt: Date;
    updatedAt: Date;
    planningLines : Types.ObjectId[]
}


const BOMPlanningSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        bomId: {
            type: Schema.Types.ObjectId,
            ref: "BOM",
            required: true,
        },
        qty: {
            type: Number,
            required: true,
        },
        planningLines : [{
            type : Schema.Types.ObjectId,
            ref  : "planning_assembly_line"
        }]
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IPlanningBOMModel>(
    "planning_bom",
    BOMPlanningSchema
);
