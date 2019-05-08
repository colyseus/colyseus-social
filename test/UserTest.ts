import mongoose from "mongoose";
import assert from "assert";

import { connect, getOnlineFriends, logout } from "../src";
import User, { IUser } from "../src/models/User";
import { resetTestUsers, createFacebookTestUsers } from "./utils";

describe("User", () => {
    before(async () => {
        // connect & clear database.
        await connect();
        await resetTestUsers();
        await createFacebookTestUsers();
    });

    after(async () => mongoose.connection.close());

    it("should create brand new user", () => {

    });

    it("getOnlineFriends", async () => {
        const defaultUser = await User.findOne({ username: "Open Graph Test User" });
        const friends = await getOnlineFriends(defaultUser);
        assert.equal(friends.length, 4);
    });

    // it("logout", async () => {
    //     const jake = await User.findOne({ username: "Jake" });
    //     await logout(jake);
    //     assert.equal((await User.findOne({ username: "Jake" })).online, false);
    // })
})