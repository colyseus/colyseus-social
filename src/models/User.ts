import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string,
    displayName: string,
    avatarUrl: string,

    lang: string,
    location: string,
    timezone: string,
    metadata: any,

    email: string,
    facebookID: string,
    googleID: string,
    gameCenterID: string,
    steamId: string,

    friends: string[],
    online: boolean,
}

const UserSchema: Schema = new Schema({
    username:       { type: String, minlength: 3, default: "" },
    displayName:    { type: String, minlength: 3, default: "" },
    avatarURL:      { type: String, default: "" },

    lang:           { type: String, default: "en" },
    location:       { type: String, default: "" },
    timezone:       { type: String, default: "" }, 
    metadata:       { type: Schema.Types.Mixed },

    deviceIDs:      { type: [String], default: [] },

    email:          { type: String, default: "" },
    password:       { type: String, default: "" },

    facebookID:     { type: String, default: "" },
    googleID:       { type: String, default: "" },
    gameCenterID:   { type: String, default: "" },
    steamID:        { type: String, default: "" },
    friendIDs:      { type: [String], default: [] },

    online:         { type: Boolean, default: true },
});

export default mongoose.model<IUser>('users', UserSchema);