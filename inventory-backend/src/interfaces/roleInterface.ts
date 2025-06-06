import mongoose from "mongoose";

export interface RoleInterface { 
  name : string;
}
export interface RoleInterfaceGet{
  _id : mongoose.Schema.Types.ObjectId;
  name : string;
}
