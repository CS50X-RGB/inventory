import mongoose, { Schema, Document } from "mongoose";

interface CreateLineTransaction extends Document {
  name: string;
  planning_bom_id: mongoose.Schema.Types.ObjectId;
  assembly_line_id: mongoose.Schema.Types.ObjectId;
  qty: number;
  status: "Locked" | "Realsed";
}

const CreateLineTransactionSchema = new Schema<CreateLineTransaction>(
  {
    name: {
      type: String,
    },
    planning_bom_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "master_transaction",
      required: true,
    },
    assembly_line_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssemblyLine",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Locked", "Released"],
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Fixed: closed parentheses for model() call
export default mongoose.model<CreateLineTransaction>(
  "child_planning_transaction",
  CreateLineTransactionSchema
);


