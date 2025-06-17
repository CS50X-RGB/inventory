import mongoose, { Document, Schema } from "mongoose";


interface Permission extends Document {
    name: string,
    link: string,
}

const PermissionSchema = new Schema<Permission>({
    name: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    }
});

export default mongoose.model<Permission>('permission',PermissionSchema);