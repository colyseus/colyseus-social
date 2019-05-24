import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from '..';

export enum Platform {
    ios = "ios",
    android = "android",
}

export interface Device {
    id: string,
    platform: Platform
}

export const UserExposedFields = ['username', 'displayName', 'avatarUrl', 'lang', 'location', 'timezone'];

export interface IUser extends Document {
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
    metadata: any,

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

const UserSchema: Schema = new Schema<IUser>({
    username:       { type: String, minlength: 3, default: "" },
    displayName:    { type: String, minlength: 3, default: "" },
    avatarUrl:      { type: String, default: "" },

    isAnonymous:    { type: Boolean, default: false },
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
    timestamps: true
});

// TODO:
// UserSchema.indexes

export default mongoose.model<IUser>('User', UserSchema);