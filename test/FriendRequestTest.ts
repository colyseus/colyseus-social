import mongoose from "mongoose";
import assert from "assert";

import { connectDatabase, sendFriendRequest, getFriendRequests, consumeFriendRequest, ObjectId } from "../src";
import User from "../src/models/User";
import FriendRequest from "../src/models/FriendRequest";
import { clearTestUsers, clearFriendRequests } from "./utils";

describe("FriendRequest", () => {
    before(async () => {
        // connect & clear database.
        await connectDatabase();
        await clearTestUsers();
        await clearFriendRequests();

        // create dummy users
        await User.create([
            { username: "jake", displayName: "Jake" },
            { username: "snake", displayName: "Snake" },
            { username: "katarina", displayName: "Katarina" },
        ]);
    });

    after(() => mongoose.connection.close());

    it("should send friend request", async () => {
        const jake = await User.findOne({ username: "jake" });
        const snake = await User.findOne({ username: "snake" });

        await sendFriendRequest(jake._id, snake._id);

        const friendRequest = await FriendRequest.findOne({ sender: jake._id });
        assert.deepEqual(friendRequest.sender, jake._id);
        assert.deepEqual(friendRequest.receiver, snake._id);
    });

    it("should list friend requests", async () => {
        const snake = await User.findOne({ username: "snake" });
        const jake = await User.findOne({ username: "jake" });

        const requests = await getFriendRequests(snake._id);
        assert.equal(requests.length, 1);
        assert.deepEqual(requests[0].sender, jake._id);
        assert.deepEqual(requests[0].receiver, snake._id);
    });

    it("should accept friend request", async () => {
        const friendRequest = await FriendRequest.findOne({});
        await consumeFriendRequest(friendRequest);

        const removedFriendRequest = await FriendRequest.findOne({ _id: friendRequest._id });
        assert.equal(removedFriendRequest, null);

        const sender = await User.findOne({ _id: friendRequest.sender });
        const receiver = await User.findOne({ _id: friendRequest.receiver });
        assert.ok(sender.friendIds.filter((id: ObjectId) => id.toString() === receiver._id.toString()).length === 1);
        assert.ok(receiver.friendIds.filter((id: ObjectId) => id.toString() === sender._id.toString()).length === 1);
    });

    it("should decline friend request", async () => {
        const jake = await User.findOne({ username: "jake" });
        const katarina = await User.findOne({ username: "katarina" });
        await sendFriendRequest(jake._id, katarina._id);

        const friendRequest = await FriendRequest.findOne({ sender: jake._id });
        await consumeFriendRequest(friendRequest, false);

        const removedFriendRequest = await FriendRequest.findOne({ _id: friendRequest._id });
        assert.equal(removedFriendRequest, null);

        const sender = await User.findOne({ _id: friendRequest.sender });
        const receiver = await User.findOne({ _id: friendRequest.receiver });
        assert.ok(sender.friendIds.filter((id: ObjectId) => id.toString() === receiver._id.toString()).length === 0);
        assert.ok(receiver.friendIds.filter((id: ObjectId) => id.toString() === sender._id.toString()).length === 0);
    });

    it("shouldn't create multiple friend requests for the same user", async () => {
        const jake = await User.findOne({ username: "jake" });
        const katarina = await User.findOne({ username: "katarina" });

        for (let i=0;i<10;i++) {
            await sendFriendRequest(jake._id, katarina._id);
        }

        const friendRequestCount = await FriendRequest.countDocuments({});
        assert.equal(friendRequestCount, 1);
    });
});
