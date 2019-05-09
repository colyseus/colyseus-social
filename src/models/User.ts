import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from '..';

export interface IUser extends Document {
    username: string,
    displayName: string,
    avatarUrl: string,

    lang: string,
    location: string,
    timezone: string,
    metadata: any,

    email: string,
    facebookId: string,
    googleId: string,
    gameCenterId: string,
    steamId: string,

    friendIds: ObjectId[],
    blockedUserIds: ObjectId[],
    online: boolean,

    createdAt: Date,
    updatedAt: Date,
}

const UserSchema: Schema = new Schema<IUser>({
    username:       { type: String, minlength: 3, default: "" },
    displayName:    { type: String, minlength: 3, default: "" },
    avatarUrl:      { type: String, default: "" },

    lang:           { type: String, default: "en" },
    location:       { type: String, default: "" },
    timezone:       { type: String, default: "" },
    metadata:       { type: Schema.Types.Mixed },

    deviceIds:      { type: [String], default: [] },

    email:          { type: String, default: "" },
    password:       { type: String, default: "" },

    facebookId:     { type: String, default: "" },
    googleId:       { type: String, default: "" },
    gameCenterId:   { type: String, default: "" },
    steamId:        { type: String, default: "" },

    friendIds:      { type: [Schema.Types.ObjectId], default: [] },
    blockedUserIds: { type: [Schema.Types.ObjectId], default: [] },

    online:         { type: Boolean, default: true }
}, {
    timestamps: true
});

// TODO:
// UserSchema.indexes

export default mongoose.model<IUser>('User', UserSchema);