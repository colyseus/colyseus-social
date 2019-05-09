import assert from "assert";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import phin from "phin";

import authRoutes from "../../router/express";
import { getTestUsersAccessTokens } from "../utils";
import { getFacebookUser } from "../../src/facebook";
import { connectDatabase } from "../../src";
import User from "../../src/models/User";

describe("Express", () => {
    const TESTPORT = 2267;
    const app = express();
    app.use("/", authRoutes);

    // spin-up and tear-down express server for testing
    let server: http.Server;
    before((done) => {
        connectDatabase((err) => {
            server = app.listen(TESTPORT, done);
        });
    });

    after(() => {
        server.close();
        mongoose.connection.close();
    });

    // 'request' utility
    const request = async (url: string, headers?: any) => await phin({
        url: `http://localhost:${TESTPORT}${url}`,
        parse: 'json',
        headers: headers
    });

    const loginRequest = async (fbAccessToken: string) => {
        return await request(`/facebook?accessToken=${fbAccessToken}`);
    }

    it("shouldn't sign in with invalid access token", async () => {
        const accessToken = "invalid%20token";
        const response = await request(`/facebook?accessToken=${accessToken}`);
        assert.equal(response.statusCode, 401);
        assert.equal(response.body.error, "Invalid OAuth access token.");
    });

    it("should register with valid access token", async () => {
        const accessToken = (await getTestUsersAccessTokens())[0];
        const facebookData = await getFacebookUser(accessToken);

        const response = await loginRequest(accessToken);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.facebookId, facebookData.id);
    });

    it("should logout with access token", async () => {
        const accessToken = (await getTestUsersAccessTokens())[0];
        const loginResponse = await loginRequest(accessToken);
        const jwt = loginResponse.body.token;

        const logoutResponse = await request(`/logout`, { authorization: "Bearer " + jwt });
        assert.equal(logoutResponse.statusCode, 200);

        const user = await User.findOne({ _id: loginResponse.body._id });
        assert.equal(user.online, false);
    });

    it("should get a list of online friends", async () => {
        const accessToken = (await getTestUsersAccessTokens())[1];
        const jwt = (await loginRequest(accessToken)).body.token;

        const friendsResponse = await request("/friends", { authorization: "Bearer " + jwt });
        assert.equal(friendsResponse.statusCode, 200);

        const friends = friendsResponse.body;
        const friendNames = friends.map(friend => friend.displayName);
        assert.deepEqual(Object.keys(friends[0]), ['username', 'displayName', 'avatarUrl', '_id']);
        assert.ok(friends.length > 0);
        assert.ok(friendNames.indexOf("Rick") >= 0);
        assert.ok(friendNames.indexOf("Open") >= 0);
        assert.ok(friendNames.indexOf("Bob") >= 0);
        assert.ok(friendNames.indexOf("Maria") >= 0);
    });
});