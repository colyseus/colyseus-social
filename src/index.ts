import mongoose from "mongoose";
import nanoid from "nanoid";
import User, { IUser, Platform, UserExposedFields } from "./models/User";
import { getFacebookUser } from "./facebook";

import { MONGO_URI } from "./env";
import { MongoError } from "mongodb";
import FriendRequest, { IFriendRequest } from "./models/FriendRequest";
import { hashPassword, isValidPassword, verifyToken } from "./auth";

const debug = require('debug')('@colyseus/social');

const DEFAULT_USER_FIELDS: Array<keyof IUser> = ['_id', 'username', 'displayName', 'avatarUrl', 'metadata'];
const ONLINE_SECONDS = 20;

export type ObjectId = string | mongoose.Schema.Types.ObjectId;

export async function connectDatabase(cb?: (err: MongoError) => void) {
    // skip if already connecting or connected.
    if (mongoose.connection.readyState !== 0) {
        if (cb) cb(null);
        return;
    }

    try {
        await mongoose.connect(MONGO_URI, { autoIndex: false, useNewUrlParser: true }, cb);
        debug(`Successfully connected to ${MONGO_URI}`)

        // reconnect if disconnected.
        mongoose.connection.on('disconnected', () => connectDatabase());
    } catch (e) {
        console.error('Error connecting to database: ', e);
    }
}

export async function pingUser(userId: ObjectId) {
    return (await User.updateOne({ _id: userId }, { $set: { updatedAt: new Date() } })).nModified > 0;
}

export async function authenticate({
    accessToken,
    deviceId,
    platform,
    email,
    password,
    token
}: {
    accessToken?: string,
    deviceId?: string,
    platform?: string,
    email?: string,
    password?: string,
    token?: string,

}): Promise<IUser> {
    const $filter: any = {};
    const $set: any = {};
    const $setOnInsert: any = {};

    let friendIds = [];
    let facebookFriendsIds = [];

    const _id = token && verifyToken(token)._id;
    let existingUser: IUser;

    if (accessToken) {
        // facebook auth
        const data = await getFacebookUser(accessToken);

        $filter['facebookId'] = data.id;

        $set['facebookId'] = data.id; // upgrading from user token
        $set['avatarUrl'] = data.picture.data.url;
        $set['isAnonymous'] = false;

        $setOnInsert['username'] = data.name;
        $setOnInsert['displayName'] = data.short_name;
        if (data.email) {
            $setOnInsert['email'] = data.email;
        }

        if (data.friends) {
            facebookFriendsIds = data.friends.data.map(friend => friend.id);
        }

        // fetch existing users by their facebookId from database
        if (facebookFriendsIds.length > 0) {
            friendIds = (await User.
                find({ facebookId: { $in: facebookFriendsIds } }, ["_id"])).
                map(user => user._id);
        }

    } else if (email) {
        // validate password provided
        if (!password || password.length < 3) {
            throw new Error("password missing")
        }

        // email + password auth
        existingUser = await User.findOne({ email });

        if (existingUser) {
            // login via email + password
            if (isValidPassword(existingUser, password)) {
                return existingUser;

            } else {
                throw new Error("invalid credentials");
            }

        } else {
            const { salt, hash } = hashPassword(password);

            // create new user with email + password
            $filter['email'] = email;

            $set['email'] = email; // upgrading from user token
            $set['password'] = hash;
            $set['passwordSalt'] = salt;
            $set['isAnonymous'] = false;
        }

    } else if (!_id) {
        // anonymous auth
        if (!deviceId) { deviceId = nanoid(); }

        // $filter['devices'] = { id: deviceId, platform: platform };
        $filter['devices.id'] = deviceId;
        $filter['devices.platform'] = platform;

        // only allow anonymous login if account is not connected with external services
        $filter['facebookId'] = { $exists: false };
        $filter['twitterId'] = { $exists: false };
        $filter['googleId'] = { $exists: false };

        $setOnInsert['isAnonymous'] = true;
    }

    // has filters, let's find which user matched to update.
    if (Object.keys($filter).length > 0) {
        existingUser = await User.findOne($filter);
    }

    const filter = (existingUser) ? { _id: existingUser._id } : { _id }

    // find or create user
    await User.updateOne(filter, {
        $setOnInsert,
        $set,
        $addToSet: { friendIds: friendIds }
    }, { upsert: true });

    const currentUser = await User.findOne(filter);

    // Add current user to existing users friend list.
    if (facebookFriendsIds.length > 0) {
        await Promise.all(facebookFriendsIds.map((facebookId) => {
            return User.updateOne({ facebookId }, {
                $addToSet: { friendIds: currentUser._id }
            });
        }));
    }

    return currentUser;
}

export async function updateUser(_id: ObjectId, fields: { [id in keyof IUser]: any }) {
    const $set: any = {};

    // filter only exposed fields
    for (const field of UserExposedFields) {
        if (fields[field]) { $set[field] = fields[field]; }
    }

    return (await User.updateOne({ _id }, { $set })).nModified > 0;
}

export async function assignDeviceToUser (user: IUser, deviceId: string, platform: Platform) {
    const existingDevice = user.devices.filter(device =>
        device.id === deviceId && device.platform === platform)[0]

    if (!existingDevice) {
        user.devices.push({ id: deviceId, platform: platform });
        await user.save();
    }
}

export async function sendFriendRequest(senderId: ObjectId, receiverId: ObjectId) {
    const isAllowedToSend = await User.findOne({
        _id: receiverId,
        blockedUserIds: { $nin: [senderId] }
    });

    if (isAllowedToSend !== null) {
        return await FriendRequest.updateOne({
            sender: senderId,
            receiver: receiverId
        }, {}, {
            upsert: true
        });

    } else {
        return false;
    }
}

export async function consumeFriendRequest(receiverId: ObjectId, senderId: ObjectId, accept: boolean = true) {
    if (accept) {
        await User.updateOne({ _id: receiverId }, { $addToSet: { friendIds: senderId } });
        await User.updateOne({ _id: senderId }, { $addToSet: { friendIds: receiverId } });
    }
    await FriendRequest.remove({ sender: senderId, receiver: receiverId });
}

export async function blockUser(userId: ObjectId, blockedUserId: ObjectId) {
    await User.updateOne({ _id: userId }, {
        $addToSet: { blockedUserIds: blockedUserId },
        $pull: { friendIds: blockedUserId }
    });
    await User.updateOne({ _id: blockedUserId }, {
        $pull: { friendIds: userId }
    });
    await FriendRequest.deleteOne({ sender: blockedUserId, receiver: userId });
}

export async function unblockUser(userId: ObjectId, blockedUserId: ObjectId) {
    await User.updateOne({ _id: userId }, {
        $addToSet: { friendIds: blockedUserId },
        $pull: { blockedUserIds: blockedUserId }
    });
}

export async function getFriendRequests(userId: ObjectId): Promise<IFriendRequest[]> {
    return await FriendRequest.find({ receiver: userId });
}

export async function getFriendRequestsProfile(
    friendRequests: IFriendRequest[],
    fields: Array<keyof IUser> = DEFAULT_USER_FIELDS,
) {
    return await User.find({ _id: { $in: friendRequests.map(request => request.sender) } }, fields);
}

export async function getFriends(
    user: IUser,
    fields: Array<keyof IUser> = DEFAULT_USER_FIELDS,
) {
    return await User.find({ _id: { $in: user.friendIds } }, fields);
}

export async function getOnlineFriends(
    user: IUser,
    fields: Array<keyof IUser> = DEFAULT_USER_FIELDS,
) {
    return await User.find({
        _id: { $in: user.friendIds },
        updatedAt: { $gte: Date.now() - 1000 * ONLINE_SECONDS }
    }, fields);
}

// re-exports
export {
    verifyToken,
    FriendRequest,
    IFriendRequest,
    User,
    IUser,
    mongoose
};

// export async function logout(userId: string | mongoose.Schema.Types.ObjectId) {
//     return await User.updateOne({ _id: userId }, { $set: { online: false } });
// }
