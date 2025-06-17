import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: mongoose.Schema.Types.ObjectId[];
}

const RoleSchema: Schema = new Schema<IRole>({
  name: {
    type: String,
    unique: true,
    required: true
  },
  permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'permission', 
      default : [],
    }
  ]
});

export default mongoose.model<IRole>('role', RoleSchema);

