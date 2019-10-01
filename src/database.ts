import mongoose from "mongoose";
import { MONGO_URI } from "./env";
import { MongoError } from "mongodb";
import { debug } from "./index";

export async function connectDatabase(cb?: (err: MongoError) => void) {
    // skip if already connecting or connected.
    if (mongoose.connection.readyState !== 0) {
        if (cb)
            cb(null);
        return;
    }
    try {
        await mongoose.connect(MONGO_URI, { autoIndex: false, useNewUrlParser: true, useUnifiedTopology: true }, cb);
        debug(`Successfully connected to ${MONGO_URI}`);
        // reconnect if disconnected.
        mongoose.connection.on('disconnected', () => connectDatabase());
    }
    catch (e) {
        console.error('Error connecting to database: ', e);
    }
}
