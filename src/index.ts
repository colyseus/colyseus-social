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
    const data: any = await request({
        url: `https://graph.facebook.com/me?fields=friends?access_token=${accessToken}`,
        parse: 'json'
    });

    const facebookID = data.id;
    const friends = data.friends.data;

    let update: Partial<IUser> = {};
    update.email = data.email;
    update.friendIDs = friends;

    const currentUser = await User.findOneAndUpdate({ facebookID }, update, { upsert: true });

    // Add current user to existing users friend list.
    await Promise.all(update.friendIDs.map((_id) => {
        return User.updateOne({ _id }, {
            $addToSet: { friendIDs: currentUser._id }
        });
    }));

    return currentUser;
}

export async function getOnlineFriends(
    user: IUser,
    fields: Array<keyof IUser> = ['_id', 'username', 'displayName', 'avatarUrl'],
) {
    return await User.find({ _id: { $in: user.friendIDs }, online: true }, fields);
}
