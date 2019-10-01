import mongoose, { Schema, Document } from 'mongoose';

export interface IFriendRequest extends Document {
    sender: Schema.Types.ObjectId,
    receiver: Schema.Types.ObjectId,
}

const FriendRequestSchema: Schema = new Schema<IFriendRequest>({
    sender: Schema.Types.ObjectId,
    receiver: Schema.Types.ObjectId,
}, {
    timestamps: true,
});

// TODO:
// FriendRequest.indexes

export const FriendRequest = mongoose.model<IFriendRequest>('FriendRequest', FriendRequestSchema);