import mongoose, { Document, Schema } from "mongoose";

export interface IAssemblyLine extends Document {
  name: string;
  partNumber: mongoose.Schema.Types.ObjectId;
  required_qty: number;
  unit_cost: number;
  parent_id: mongoose.Schema.Types.ObjectId;
  parent_model: "BOM" | "AssemblyLine";
  child_id: mongoose.Schema.Types.ObjectId[];
  level: number;
  uom: mongoose.Schema.Types.ObjectId;
}

const AssemblyLineSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    partNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartNumber",
      required: true,
    },
    required_qty: {
      type: Number,
      required: true,
    },
    unit_cost: {
      type: Number,
      required: true,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: "parent_model",
    },
    parent_model: {
      type: String,
      required: false,
      enum: ["BOM", "AssemblyLine"],
    },
    child_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AssemblyLine",
      }
    ],
    level: {
      type: Number,
      required: true,
    },
    uom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "unit_of_measurement",
      required: true,
    },
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IAssemblyLine>(
  "AssemblyLine",
  AssemblyLineSchema
);

