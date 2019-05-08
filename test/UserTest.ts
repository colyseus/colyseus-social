import mongoose from "mongoose";
import assert from "assert";

import { connect, getOnlineFriends, logout, facebookAuth } from "../src";
import User, { IUser } from "../src/models/User";
import { resetTestUsers, createFacebookTestUsers, getTestUsersAccessTokens } from "./utils";
import { getFacebookUser } from "../src/facebook";

describe("User", () => {
    before(async () => {
        // connect & clear database.
        await connect();
        await resetTestUsers();
        await createFacebookTestUsers();
    });

    after(async () => mongoose.connection.close());

    it("getOnlineFriends", async () => {
        const defaultUser = await User.findOne({ username: "Open Graph Test User" });
        const friends = await getOnlineFriends(defaultUser);
        assert.equal(friends.length, 4);
    });

    it("should allow to login an existing user", async () => {
        const accessToken = (await getTestUsersAccessTokens())[0];

        const previousUsersCount = await User.countDocuments({});
        const userData = await getFacebookUser(accessToken);

        const user = await User.findOne({ facebookId: userData.id });
        const authenticatedUser = await facebookAuth(accessToken);

        assert.equal(previousUsersCount, await User.countDocuments({}));
        assert.deepEqual(authenticatedUser._id, user._id);
    });

    // it("logout", async () => {
    //     const jake = await User.findOne({ username: "Jake" });
    //     await logout(jake);
    //     assert.equal((await User.findOne({ username: "Jake" })).online, false);
    // })
})