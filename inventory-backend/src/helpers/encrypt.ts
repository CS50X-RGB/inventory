import argon2 from 'argon2';
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { SECRET_KEY, EXPIRE_TIME } from '../config/config';


const secret_key: string = SECRET_KEY;
const expireTime: string | number = EXPIRE_TIME;

export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
}

export const isMatch = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await argon2.verify(hashedPassword, password);
}
export const createToken = (payload: object): string => {
  return jwt.sign(
    payload,
    secret_key as Secret,
    { expiresIn: expireTime as SignOptions['expiresIn'] }
  );
};
export const verifyToken = (
  token: string,
  name?: string
): object | string | boolean => {
  try {
    return jwt.verify(token, secret_key);
  } catch (err: any) {
    console.log(err);

    // if token is expired, return an error message
    if (err.name === "TokenExpiredError") {
      return false;
    }
    throw new Error("Invalid Token");
  }
};

