import express, { Response } from "express";
import jwt from "express-jwt";

import { authenticate, getOnlineFriends, sendFriendRequest, connectDatabase, getFriends, getFriendRequests, getFriendRequestsProfile, consumeFriendRequest, assignDeviceToUser, pingUser, blockUser, unblockUser } from "../src";
import User from "../src/models/User";

import { JWT_SECRET } from "../src/env";
import { AuthDataInToken, createToken } from "../src/auth";
import { push } from "../src/push_notifications";
import WebPushSubscription from "../src/models/WebPushSubscription";

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
route.use(express.json());

// route.use(jwtMiddleware.unless({ path: /\/(login)$/ }));
// route.use(jwtMiddleware.unless({ path: /\/(login)$/ }));

route.post("/login", async (req, res) => {
    tryOrErr(res, async () => {
        const { accessToken, deviceId, platform, token } = req.query;

        const user = await authenticate({ accessToken, deviceId, platform, token });
        if (deviceId && platform) {
            await assignDeviceToUser(user, deviceId, platform);
        }

        res.json({ ...user.toJSON(), ...createToken(user) });
    }, 401);
});

route.get("/ping", async (req, res) => {
    tryOrErr(res, async () => {
        // TODO: allow to set user status?
        const { status } = req.query;

        const user = await pingUser(req.auth._id);
        res.json(user);
    }, 500);
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

route.post("/block", async (req, res) => {
    tryOrErr(res, async () => {
        blockUser(req.auth._id, req.query.userId);
        res.json({ success: true });
    }, 500);
});

route.put("/block", async (req, res) => {
    tryOrErr(res, async () => {
        unblockUser(req.auth._id, req.query.userId);
        res.json({ success: true });
    }, 500);
});


// expose web push public key
route.get("/push", async (_, res) => {
    const subscriptions = await WebPushSubscription.find({});
    const result = await push.send(subscriptions, {
        title: "Title, it works!",
        body: "Hello, body!",
    });
    res.json(result);
});

route.get("/push/web", (_, res) => res.json({ publicKey: process.env.WEBPUSH_PUBLIC_KEY }));
route.post("/push/subscribe", async (req, res) => {
    tryOrErr(res, async () => {
        await WebPushSubscription.create(req.body);
        res.json({ success: true });
    }, 500);
});

export { jwtMiddleware };
export default route;