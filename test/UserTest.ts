import mongoose from "mongoose";
import assert from "assert";

import { connectDatabase, getOnlineFriends, authenticate, updateUser } from "../src";
import User, { IUser } from "../src/models/User";
import { clearTestUsers, createFacebookTestUsers, getTestUsersAccessTokens } from "./utils";
import { getFacebookUser } from "../src/facebook";
import { createToken } from "../src/auth";

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

    it("should allow to upgrade anonymous user", async() => {
        const anonymous = await authenticate({ deviceId: "device3" });
        assert.equal(anonymous.isAnonymous, true);

        const { token } = createToken(anonymous);
        const upgradeUser = await authenticate({ token, email: "someone@example.com", password: "123456" });

        assert.deepEqual(anonymous._id, upgradeUser._id);
        assert.equal(upgradeUser.isAnonymous, false);
        assert.equal(upgradeUser.email, "someone@example.com");
        assert.deepEqual(upgradeUser.devices[0].id, "device3");
    });

    it("should allow to create user by email + password", async () => {
        const byEmailAndPassword = await authenticate({ email: "dummy@example.com", password: "mypass" });
        assert.equal(byEmailAndPassword.isAnonymous, false);
        assert.equal(byEmailAndPassword.email, "dummy@example.com");

        assert.ok(byEmailAndPassword.password);
        assert.ok(byEmailAndPassword.passwordSalt);

        const loginByEmailAndPassword = await authenticate({ email: "dummy@example.com", password: "mypass" });
        assert.deepEqual(loginByEmailAndPassword._id, byEmailAndPassword._id);
    });

    it("should fail to use invalid email + password", async () => {
        const byEmailAndPassword = await authenticate({ email: "fail@example.com", password: "superpass" });
        assert.equal(byEmailAndPassword.isAnonymous, false);
        assert.equal(byEmailAndPassword.email, "fail@example.com");

        await assert.rejects(async () => {
            await authenticate({ email: "fail@example.com", password: "wrong password!" });
        }, /invalid credentials/);

        await assert.rejects(async () => {
            await authenticate({ email: "fail@example.com" });
        }, /password missing/);
    });

    it("should not allow to have two users with the same username", async () => {
        const byEmailAndPassword = await authenticate({ email: "fail@example.com", password: "superpass" });
        await updateUser(byEmailAndPassword._id, { username: "HelloWorld" });

        const anotherUser = await authenticate({ email: "anotheruser@example.com", password: "superpass" });
        assert.rejects(async() => {
            await updateUser(anotherUser._id, { username: "HelloWorld" });
        }, /taken/);
    });

    xit("should logout user", async () => {
        const onlineUser = await User.findOne({ online: true });
        // await logout(onlineUser._id.toString());

        const offlineUser = await User.findOne({ _id: onlineUser._id });
        // assert.equal(offlineUser.online, false);
    });

});
