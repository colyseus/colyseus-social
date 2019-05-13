import express, { Response } from "express";
import jwt from "express-jwt";

import { facebookAuth, getOnlineFriends, logout, sendFriendRequest, connectDatabase, getFriends, getFriendRequests, getFriendRequestsProfile, consumeFriendRequest } from "../src";
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

const tryOrErr = async (res: Response, cb: () => void, statusCode: number) => {
    try {
        await cb();
    } catch (e) {
        res.status(statusCode);
        res.json({ error: (e.data && e.data.error && e.data.error.message) || e.message })
    }
}

const jwtMiddleware = jwt({
    secret: JWT_SECRET,
    userProperty: "auth",
    getToken: function (req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
});

// connect into the database!
connectDatabase();

const route = express.Router();
route.use(jwtMiddleware.unless({ path: /\/facebook$/ }));

route.get("/facebook", async (req, res) => {
    tryOrErr(res, async () => {
        const { accessToken } = req.query;

        if (!accessToken) {
            throw new Error("'accessToken' missing on query string.");
        }

        const user = await facebookAuth(accessToken);
        const token = createToken(user);
        res.json({ ...user.toJSON(), ...token });
    }, 401);
});

route.get("/friend_requests", async (req, res) => {
    tryOrErr(res, async () => {
        const requests = await getFriendRequests(req.auth._id);
        const users = await getFriendRequestsProfile(requests);
        res.json(users);
    }, 500);
});

route.put("/friend_requests", async (req, res) => {
    tryOrErr(res, async () => {
        await consumeFriendRequest(req.auth._id, req.params.userId);
        res.json({ success: true });
    }, 500);
});

route.delete("/friend_requests", async (req, res) => {
    tryOrErr(res, async () => {
        await consumeFriendRequest(req.auth._id, req.params.userId, false);
        res.json({ success: true });
    }, 500);
});

route.post("/friend_requests", async (req, res) => {
    tryOrErr(res, async () => {
        await sendFriendRequest(req.auth._id, req.params.userId);
        res.json({success: true});
    }, 500);
});

route.get("/friends", async (req, res) => {
    tryOrErr(res, async () => {
        const user = await User.findOne({ _id: req.auth._id });
        res.json(await getFriends(user));
    }, 500);
});

route.get("/online_friends", async (req, res) => {
    tryOrErr(res, async () => {
        const user = await User.findOne({ _id: req.auth._id });
        res.json(await getOnlineFriends(user));
    }, 500);
});

route.get("/logout", async (req, res) => {
    tryOrErr(res, async () => {
        await logout(req.auth._id);
        res.json({ success: true });
    }, 500);
});

export { jwtMiddleware };
export default route;