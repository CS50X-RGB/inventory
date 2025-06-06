import  mongoose, {Schema,Document} from 'mongoose';

export interface IUOM extends Document {
  name : string;
}

const UOMSchema : Schema = new Schema({
  name : {
    type : String,
    unique : true,
    required : true
  }
});

export default mongoose.model<IUOM>('unit_of_measurement',UOMSchema);