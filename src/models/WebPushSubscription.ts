import mongoose, { Schema, Document } from 'mongoose';

export interface IWebPushSubscription extends Document {
    endpoint: string,
    expirationTime: Date,
    keys: {
        p256dh: string,
        auth: string
    }
};

const WebPushSubscription: Schema = new Schema<IWebPushSubscription>({
    endpoint: String,
    expirationTime: Date,
    keys: {
        p256dh: String,
        auth: String
    }
});

export default mongoose.model<IWebPushSubscription>('WebPushSubscription', WebPushSubscription);