import mongoose from "mongoose";
import assert from "assert";

import { connectDatabase, getOnlineFriends, authenticate } from "../src";
import User, { IUser } from "../src/models/User";
import { clearTestUsers, createFacebookTestUsers, getTestUsersAccessTokens } from "./utils";
import { getFacebookUser } from "../src/facebook";

describe("User", () => {
    before(async () => {
        // connect & clear database.
        await connectDatabase();
        await clearTestUsers();
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
        const authenticatedUser = await authenticate({ accessToken });

        assert.equal(previousUsersCount, await User.countDocuments({}));
        assert.deepEqual(authenticatedUser._id, user._id);
    });

    it("should allow to login as anonymous", async () => {
        const anonymous = await authenticate({ deviceId: "device1" });
        assert.equal(anonymous.isAnonymous, true);

        const sameAnonymous = await authenticate({ deviceId: "device1" });
        assert.deepEqual(anonymous._id, sameAnonymous._id);

        const secondAnonymous = await authenticate({});
        assert.equal(secondAnonymous.isAnonymous, true);
        assert.notDeepEqual(secondAnonymous._id, anonymous._id);
    });

    xit("should logout user", async () => {
        const onlineUser = await User.findOne({ online: true });
        // await logout(onlineUser._id.toString());

        const offlineUser = await User.findOne({ _id: onlineUser._id });
        // assert.equal(offlineUser.online, false);
    });

});
