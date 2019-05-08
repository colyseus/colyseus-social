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
    const fields = 'id,name,friends,email,picture';
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
    const currentUser = (await User.findOne({ facebookId })) || new User();
    if (!currentUser.username) {
        currentUser.username = data.name;
    }

    if (!currentUser.displayName) {
        currentUser.displayName = data.name;
    }

    if (!currentUser.email) {
        currentUser.email = data.email;
    }

    if (!currentUser.avatarUrl) {
        currentUser.avatarUrl = data.picture.data.url;
    }

    currentUser.facebookId = facebookId;
    currentUser.online = true;
    currentUser.friendIds = friendIds;
    console.log("currentUser", currentUser);
    currentUser.save();

    // Add current user to existing users friend list.
    await Promise.all(friendIds.map((_id) => {
        return User.updateOne({ _id }, {
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
