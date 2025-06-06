import  mongoose, {Schema,Document} from 'mongoose';

export interface IRole extends Document {
  name : string;
}

const RoleSchema : Schema = new Schema({
  name : {
    type : String,
    unique : true,
    required : true
  }
});

export default mongoose.model<IRole>('role',RoleSchema);
