import request from "phin";
import mongoose from "mongoose";
import User, { IUser } from "./models/User";

const debug = require('debug')('@colyseus/social');

const FACEBOOK_APP_TOKEN = process.env.FACEBOOK_APP_TOKEN || '353169041992501|8d17708d062493030db44dd687b73e97';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/colyseus';

export async function connect() {
    try {
        await mongoose.connect(MONGO_URI, { autoIndex: false, useNewUrlParser: true });
        debug(`Successfully connected to ${MONGO_URI}`)

        // reconnect if disconnected.
        mongoose.connection.on('disconnected', () => connect());
    } catch (e) {
        console.error('Error connecting to database: ', e);
    }
}

export async function logout(user: IUser) {
    user.online = false;
    return user.save();
}

export async function facebookAuth(accessToken: string): Promise<IUser> {
    const fields = 'id,name,short_name,friends,email,picture';
    const data: any = (await request({
        url: `https://graph.facebook.com/me?fields=${fields}&access_token=${accessToken}`,
        parse: 'json'
    })).body;

    if (data.error) {
        throw new Error(data.error.message);
    }

    const facebookId = data.id;

    // fetch existing users by their facebookId from database
    const facebookFriendsIds = data.friends.data.map(friend => friend.id);
    const friendIds = (await User.
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
