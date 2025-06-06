import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

interface ResponseFormat {
  success: boolean;
  data?: any;
  message?: string;
  error?: any;
}

export const formatResponse = (
  success: boolean,
  data: any = null,
  message: string = "",
  error: any = null
): ResponseFormat => {
  var data = { ...data };
  return {
    success,
    data,
    message,
    error,
  };
};
export const formatArrayResponse = (
  success: boolean,
  data: any = null,
  message: string = "",
  error: any = null
): ResponseFormat => {
  return {
    success,
    data,
    message,
    error,
  };
};
declare global {
  namespace Express {
    interface Request {
      user? : {
        name : string,
        _id : mongoose.Schema.Types.ObjectId
      }
    }
    interface Response {
      sendFormatted: (data: any, message?: string, status?: number) => void;
      sendArrayFormatted: (
        data: any,
        message?: string,
        status?: number
      ) => void;
      sendError: (error: any, message?: string, status?: number) => void;
    }
  }
}

export const responseFormatter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.sendFormatted = (
    data: any,
    message: string = "",
    status: number = 200
  ) => {
    res.status(status).json(formatResponse(true, data, message));
  };
  res.sendArrayFormatted = (
    data: any,
    message: string = "",
    status: number = 200
  ) => {
    res.status(status).json(formatArrayResponse(true, data, message));
  };

  res.sendError = (error: any, message: string = "", status: number = 500) => {
    res.status(status).json(formatResponse(false, null, message, error));
  };

  next();
};