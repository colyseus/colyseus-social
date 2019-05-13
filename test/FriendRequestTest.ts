import mongoose from "mongoose";
import assert from "assert";

import { connectDatabase, sendFriendRequest, getFriendRequests, consumeFriendRequest, blockUser } from "../src";
import User from "../src/models/User";
import FriendRequest from "../src/models/FriendRequest";
import { clearTestUsers, clearFriendRequests, includes } from "./utils";

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
        await consumeFriendRequest(friendRequest.receiver, friendRequest.sender);

        const removedFriendRequest = await FriendRequest.findOne({ _id: friendRequest._id });
        assert.equal(removedFriendRequest, null);

        const sender = await User.findOne({ _id: friendRequest.sender });
        const receiver = await User.findOne({ _id: friendRequest.receiver });
        assert.ok(includes(sender.friendIds, receiver._id));
        assert.ok(includes(receiver.friendIds, sender._id));
    });

    it("should decline friend request", async () => {
        const jake = await User.findOne({ username: "jake" });
        const katarina = await User.findOne({ username: "katarina" });
        await sendFriendRequest(jake._id, katarina._id);

        const friendRequest = await FriendRequest.findOne({ sender: jake._id });
        await consumeFriendRequest(friendRequest.receiver, friendRequest.sender, false);

        const removedFriendRequest = await FriendRequest.findOne({ _id: friendRequest._id });
        assert.equal(removedFriendRequest, null);

        const sender = await User.findOne({ _id: friendRequest.sender });
        const receiver = await User.findOne({ _id: friendRequest.receiver });

        assert.ok(!includes(sender.friendIds, receiver._id));
        assert.ok(!includes(receiver.friendIds, sender._id));
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

    it("should allow to block a user", async () => {
        // jake send friend request to katarina
        let jake = await User.findOne({ username: "jake" });
        let katarina = await User.findOne({ username: "katarina" });
        await sendFriendRequest(jake._id, katarina._id);

        // katarina blocks jack
        await blockUser(katarina._id, jake._id);

        let friendRequest = await FriendRequest.findOne({ sender: jake._id, receiver: katarina._id });
        assert.equal(friendRequest, null);

        // assert lack of presence in `friendIds` array.
        jake = await User.findOne({ username: "jake" });
        katarina = await User.findOne({ username: "katarina" });
        assert.ok(!includes(jake.friendIds, katarina._id));
        assert.ok(!includes(katarina.friendIds, jake._id));

        // assert presence in `blockedUserIds` array.
        assert.ok(!includes(jake.blockedUserIds, katarina._id));
        assert.ok(includes(katarina.blockedUserIds, jake._id));

        // further friend requests should be ignored.
        await sendFriendRequest(jake._id, katarina._id);
        friendRequest = await FriendRequest.findOne({ sender: jake._id, receiver: katarina._id });
        assert.equal(friendRequest, null);
    });

});
