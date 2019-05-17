import jwt from "jsonwebtoken";
import crypto from "crypto";

import { IUser } from "./models/User";
import { JWT_SECRET } from "./env";

export interface TokenData {
    token: string;
    // expiresIn: number;
}

export interface AuthDataInToken {
    _id: string;
}

export function hashPassword (password: string) {
    // creating a unique salt for a particular user
    const salt = crypto.randomBytes(16).toString('hex');

    // hashing user's salt and password with 1000 iterations, 32 length and sha512 digest
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 32, `sha512`).toString(`hex`);

    return { salt, hash };
}

export function isValidPassword(user: IUser, password) {
    const hash = crypto.pbkdf2Sync(password, user.passwordSalt, 1000, 32, `sha512`).toString(`hex`);
    return user.password === hash;
}

export function createToken(user: IUser): TokenData {
    return { token: jwt.sign({ _id: user._id }, JWT_SECRET) };

    // const expiresIn = 60 * 60; // an hour
    // const data = { _id: user._id };

    // return {
    //     expiresIn,
    //     token: jwt.sign(data, JWT_SECRET, { expiresIn })
    // };
}

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as AuthDataInToken;
}