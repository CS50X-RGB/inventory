import mongoose, { Schema, Document } from 'mongoose';

export interface IPartNumberModel extends Document {
  name: string;
  description: string;
  in_stock: number;
  reorder_qty: number;
  locked_qty: number;
  assigned_qty: number;
}

const PartNumberSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  in_stock: {
    type: Number,
    required: true,
  },
  reorder_qty: {
    type: Number,
    required: true,
  },
  locked_qty: {
    type: Number,
    default: 0,
  },
  assigned_qty: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model<IPartNumberModel>('PartNumber', PartNumberSchema);
