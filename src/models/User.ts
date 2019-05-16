import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from '..';

export enum Platform {
    ios = "ios",
    android = "android"
}

export interface Device {
    id: string,
    platform: Platform
}

export interface IUser extends Document {
    username: string,
    displayName: string,
    avatarUrl: string,

    isAnonymous: boolean,
    email: string,
    password: string,

    lang: string,
    location: string,
    timezone: string,
    metadata: any,

    devices: Device[],

    facebookId: string,
    googleId: string,
    gameCenterId: string,
    steamId: string,

    friendIds: ObjectId[],
    blockedUserIds: ObjectId[],

    createdAt: Date,
    updatedAt: Date,
}

const UserSchema: Schema = new Schema<IUser>({
    username:       { type: String, minlength: 3, default: "" },
    displayName:    { type: String, minlength: 3, default: "" },
    avatarUrl:      { type: String, default: "" },

    isAnonymous:    { type: Boolean, default: false },
    email:          { type: String, default: "" },
    password:       { type: String, default: "" },

    lang:           { type: String, default: "en" },
    location:       { type: String, default: "" },
    timezone:       { type: String, default: "" },
    metadata:       { type: Schema.Types.Mixed },

    devices:        [{
                        id:       { type: String },
                        platform: { type: String }, // "ios" | "android"
                    }],

    facebookId:     { type: String, default: "" },
    googleId:       { type: String, default: "" },
    gameCenterId:   { type: String, default: "" },
    steamId:        { type: String, default: "" },

    friendIds:      { type: [Schema.Types.ObjectId], default: [] },
    blockedUserIds: { type: [Schema.Types.ObjectId], default: [] },
}, {
    timestamps: true
});

// TODO:
// UserSchema.indexes

export default mongoose.model<IUser>('User', UserSchema);