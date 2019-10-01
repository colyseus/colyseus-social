import mongoose from "mongoose";
export { mongoose };

export const debug = require('debug')('@colyseus/social');

export type ObjectId = string | mongoose.Schema.Types.ObjectId;
export type AuthProvider = 'email' | 'facebook' | 'anonymous';

export { connectDatabase } from "./database";

export { User, IUser } from "./models/User";
export { FriendRequest, IFriendRequest } from "./models/FriendRequest";

export {
    pingUser,
    authenticate,
    updateUser,
    assignDeviceToUser,
    getOnlineUserCount,
    sendFriendRequest,
    consumeFriendRequest,
    blockUser,
    unblockUser,
    getFriendRequests,
    getFriendRequestsProfile,
    getFriends,
    getOnlineFriends
} from "./user";

export { verifyToken } from "./auth";
export { hooks } from "./hooks";