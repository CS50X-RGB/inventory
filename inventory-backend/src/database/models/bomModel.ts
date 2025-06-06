import mongoose, { Document, Schema } from "mongoose";

export interface IBomModel extends Document {
    name: string;
    description: string;
    total_price: number;
    sub_line: mongoose.Schema.Types.ObjectId[];
}

const BomSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    total_price: {
        type: Number,
        default: 0,
    },
    sub_line: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AssemblyLine",
        },
    ],
});

export default mongoose.model<IBomModel>("BOM", BomSchema);
