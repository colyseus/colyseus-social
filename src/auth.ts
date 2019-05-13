import jwt from "jsonwebtoken";

import { IUser } from "./models/User";
import { JWT_SECRET } from "./env";

export interface TokenData {
    token: string;
    // expiresIn: number;
}

export interface AuthDataInToken {
    _id: string;
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
