import mongoose, { Document, Schema } from "mongoose";

interface CreateParentTransaction extends Document {
    name: string,
    bomId: mongoose.Schema.Types.ObjectId,
    qty: number,
    child_planning_transaction: mongoose.Schema.Types.ObjectId[],
    status: "Locked" | "Realsed"
}


const TransactionTopModel: Schema = new Schema<CreateParentTransaction>(
    {
        name: {
            type: String,
            required: true
        },
        bomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BOM",
            required: true
        },
        qty: {
            type: Number,
            required: true
        },
        child_planning_transaction: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "child_planning_transaction",
        }],
        status: {
            type: String,
            enum: ["Locked", "Released"],
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.model<CreateParentTransaction>('master_transaction', TransactionTopModel);