import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId, hooks } from '..';

export enum Platform {
    ios = "ios",
    android = "android",
}

export interface Device {
    id: string,
    platform: Platform
}

export const UserExposedFields = ['username', 'displayName', 'avatarUrl', 'lang', 'location', 'timezone'];

export interface IUser<T=any> extends Document {
    username: string,
    displayName: string,
    avatarUrl: string,

    isAnonymous: boolean,
    email: string,
    password: string,
    passwordSalt: string,

    lang: string,
    location: string,
    timezone: string,
    metadata: T,

    devices: Device[],

    facebookId: string,
    twitterId: string,
    googleId: string,
    gameCenterId: string,
    steamId: string,

    friendIds: ObjectId[],
    blockedUserIds: ObjectId[],

    createdAt: Date,
    updatedAt: Date,
}

const DeviceSchema = new mongoose.Schema({
    id: String,
    platform: String,
}, {
    _id: false
});

const UserSchema: Schema<IUser> = new Schema<IUser>({
    username:       { type: String, index: { unique: true, sparse: true } },
    displayName:    { type: String, default: "" },
    avatarUrl:      { type: String, default: "" },

    isAnonymous:    { type: Boolean, default: true },
    email:          { type: String },
    password:       { type: String },
    passwordSalt:   { type: String },

    lang:           { type: String },
    location:       { type: String },
    timezone:       { type: String },
    metadata:       { type: Schema.Types.Mixed },

    devices:        [ DeviceSchema ],

    facebookId:     { type: String },
    twitterId:      { type: String },
    googleId:       { type: String },
    gameCenterId:   { type: String },
    steamId:        { type: String },

    friendIds:      { type: [Schema.Types.ObjectId], default: [] },
    blockedUserIds: { type: [Schema.Types.ObjectId], default: [] },

}, {
    timestamps: true,
});

/**
 * Hooks
 */
UserSchema.pre<IUser>('save', async function () {
    const fields = this.modifiedPaths().reduce<Partial<IUser>>((previous, current) => {
        previous[current] = this.get(current);
        return previous;
    }, {});

    await hooks.beforeUserUpdate.invokeAsync(this._id, fields);
});

export default mongoose.model<IUser>('User', UserSchema);