import express from "express";
import jwt from "express-jwt";

import { facebookAuth, getOnlineFriends, logout } from "../src";
import User from "../src/models/User";

import { JWT_SECRET } from "../src/env";
import { AuthDataInToken, createToken } from "../src/auth";

// @types/express-jwt: extends to include "auth" on `req`
declare global {
    namespace Express {
        export interface Request {
            auth?: AuthDataInToken
        }
    }
}

const jwtMiddleware = jwt({
    secret: JWT_SECRET,
    userProperty: "auth"
});

const route = express.Router();
route.use(jwtMiddleware.unless({ path: "/facebook" }));

route.get("/facebook", async (req, res) => {
    const { accessToken } = req.params;
    const user = await facebookAuth(accessToken);
    const token = createToken(user);
    res.json({ ...user, ...token });
});

route.get("/friends", async (req, res) => {
    const user = await User.findOne({ _id: req.auth._id });
    res.json(await getOnlineFriends(user));
});

route.get("/logout", async (req, res) => {
    await logout(req.auth._id);
    res.json({ success: true });
});

export { jwtMiddleware };
export default route;