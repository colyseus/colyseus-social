import mongoose from "mongoose";
import User, { IUser } from "./models/User";
import { getFacebookUser } from "./facebook";

import { MONGO_URI } from "./env";
import { MongoError } from "mongodb";

const debug = require('debug')('@colyseus/social');

export async function connectDatabase(cb?: (err: MongoError) => void) {
    // skip if already connecting or connected.
    if (mongoose.connection.readyState !== 0) {
        cb(null);
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

export async function logout(userId: string | mongoose.Schema.Types.ObjectId) {
    return await User.updateOne({ _id: userId }, { $set: { online: false } });
}

export async function facebookAuth(accessToken: string): Promise<IUser> {
    const data = await getFacebookUser(accessToken);

    if (data.error) {
        throw new Error(data.error.message);
    }

    const facebookId = data.id;

    // fetch existing users by their facebookId from database
    const facebookFriendsIds = data.friends.data.map(friend => friend.id);
    const friendIds = (facebookFriendsIds.length === 0)
        ? []
        : (await User.
            find({ facebookId: { $in: facebookFriendsIds } }, ["_id"])).
            map(user => user._id);

    // find or create user
    await User.updateOne({ facebookId }, {
        $setOnInsert: {
            username: data.name,
            displayName: data.short_name,
            email: data.email,
        },
        $set: {
            avatarUrl: data.picture.data.url,
            online: true,
        },
        $addToSet: {
            friendIds: friendIds
        }
    }, { upsert: true });

    const currentUser = await User.findOne({ facebookId });

    // Add current user to existing users friend list.
    await Promise.all(facebookFriendsIds.map((facebookId) => {
        return User.updateOne({ facebookId }, {
            $addToSet: { friendIds: currentUser._id }
        });
    }));

    return currentUser;
}

export async function getOnlineFriends(
    user: IUser,
    fields: Array<keyof IUser> = ['_id', 'username', 'displayName', 'avatarUrl'],
) {
    return await User.find({ _id: { $in: user.friendIds }, online: true }, fields);
}
