import mongoose from "mongoose";


export interface IUserCreation {
    name: string;
    password: string;
    email: string;
    role: mongoose.Schema.Types.ObjectId;
}

export interface IUserCreate {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    password: string;
    email: string;
    role: mongoose.Schema.Types.ObjectId;
}
export interface IUserSignin {
    name: string;
    password: string;
    email: string;
    role: mongoose.Schema.Types.ObjectId;
}
export interface IUserCreateReturn {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    password: string;
    isBlocked: boolean,
    email: string;
    role: {
        name: string;
    };
}
export interface IUserLogin {
    name: string;
    password: string;
}
