import express, { Response, Router } from "express";
import jwt from "express-jwt";

import { authenticate, getOnlineFriends, sendFriendRequest, connectDatabase, getFriends, getFriendRequests, getFriendRequestsProfile, consumeFriendRequest, assignDeviceToUser, pingUser, blockUser, unblockUser, updateUser } from "../src";
import User from "../src/models/User";

import { JWT_SECRET } from "../src/env";
import { AuthDataInToken, createToken } from "../src/auth";
import { sendNotification, ServiceWorkerScript } from "../src/push_notifications";
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

/**
 * Auth Routes
 */
const auth = express.Router();
auth.post("/", async (req, res) => {
    tryOrErr(res, async () => {
        const { accessToken, deviceId, platform, token } = req.query;

        const user = await authenticate({ accessToken, deviceId, platform, token });
        if (deviceId && platform) {
            await assignDeviceToUser(user, deviceId, platform);
        }

        res.json({ ...user.toJSON(), ...createToken(user) });
    }, 401);
});

auth.put("/", jwtMiddleware, express.json(), async (req, res) => {
    tryOrErr(res, async () => {
        console.log("params: ", req.params);
        console.log("body: ", req.body);
        res.json({ status: await updateUser(req.auth._id, req.body) });
    }, 500);
});

auth.get("/", jwtMiddleware, async (req, res) => {
    tryOrErr(res, async () => {
        // TODO: allow to set user status?
        const { status } = req.query;

        res.json({ status: await pingUser(req.auth._id) });
    }, 500);
});

const friend = express.Router();
friend.use(jwtMiddleware);
friend.get("/requests", async (req, res) => {
    tryOrErr(res, async () => {
        const requests = await getFriendRequests(req.auth._id);
        const users = await getFriendRequestsProfile(requests);
        res.json(users);
    }, 500);
});

friend.put("/requests", async (req, res) => {
    tryOrErr(res, async () => {
        await consumeFriendRequest(req.auth._id, req.params.userId);
        res.json({ success: true });
    }, 500);
});

friend.delete("/requests", async (req, res) => {
    tryOrErr(res, async () => {
        await consumeFriendRequest(req.auth._id, req.params.userId, false);
        res.json({ success: true });
    }, 500);
});

friend.post("/requests", async (req, res) => {
    tryOrErr(res, async () => {
        await sendFriendRequest(req.auth._id, req.params.userId);
        res.json({success: true});
    }, 500);
});

friend.get("/all", async (req, res) => {
    tryOrErr(res, async () => {
        const user = await User.findOne({ _id: req.auth._id });
        res.json(await getFriends(user));
    }, 500);
});

friend.get("/online", async (req, res) => {
    tryOrErr(res, async () => {
        const user = await User.findOne({ _id: req.auth._id });
        res.json(await getOnlineFriends(user));
    }, 500);
});

friend.post("/block", async (req, res) => {
    tryOrErr(res, async () => {
        blockUser(req.auth._id, req.query.userId);
        res.json({ success: true });
    }, 500);
});

friend.put("/block", async (req, res) => {
    tryOrErr(res, async () => {
        unblockUser(req.auth._id, req.query.userId);
        res.json({ success: true });
    }, 500);
});

/**
 * Push Notification Routes
 */
const push = express.Router();

push.get("/", (req, res) => {
    // TODO: Cache this URL?
    res.set("Content-Type", "text/javascript");
    res.send(ServiceWorkerScript.replace("[BACKEND_URL]", req.protocol + '://' + req.get('host') + req.originalUrl));
});

// send push notifications to all subscribers
push.post("/", async (_, res) => {
    const results = await sendNotification({
        title: "Title, it works!",
        body: "Hello, body!",
    });
    res.json(results);
});

// expose web push public key
push.get("/web", (_, res) => res.json({ publicKey: process.env.WEBPUSH_PUBLIC_KEY }));

// store user subscription
push.post("/subscribe", async (req, res) => {
    tryOrErr(res, async () => {
        await WebPushSubscription.create(req.body);
        res.json({ success: true });
    }, 500);
});

const routes = express.Router();
routes.use("/auth", auth);
routes.use("/push", express.json(), push);
routes.use("/friends", friend);

export { jwtMiddleware };
export default routes;