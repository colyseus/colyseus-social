import assert from "assert";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import {
    get as getRequest,
    post as postRequest ,
    put as putRequest,
    del as delRequest
} from "httpie";

import authRoutes from "../../express";
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

    // 'get' utility
    const get = async (url: string, headers?: any) => await getRequest(`http://localhost:${TESTPORT}${url}`, {
        headers: { ...headers, 'Accept': 'application/json' }
    });

    // 'post' utility
    const post = async (url: string, headers?: any) => await postRequest(`http://localhost:${TESTPORT}${url}`, {
        headers: { ...headers, 'Accept': 'application/json' }
    });

    // 'put' utility
    const put = async (url: string, headers?: any) => await putRequest(`http://localhost:${TESTPORT}${url}`, {
        headers: { ...headers, 'Accept': 'application/json' }
    });

    // 'del' utility
    const del = async (url: string, headers?: any) => await delRequest(`http://localhost:${TESTPORT}${url}`, {
        headers: { ...headers, 'Accept': 'application/json' }
    });

    const loginRequest = async (fbAccessToken: string) => {
        return await post(`/auth?accessToken=${fbAccessToken}`);
    }

    it("shouldn't sign in with invalid access token", async () => {
        try {
            await post(`/auth?accessToken=invalid%20token`);

        } catch (e) {
            assert.equal(e.statusCode, 401);
            assert.equal(e.data.error, "Invalid OAuth access token.");
        }
    });

    it("should register with valid access token", async () => {
        const accessToken = (await getTestUsersAccessTokens())[0];
        const facebookData = await getFacebookUser(accessToken);

        const response = await loginRequest(accessToken);
        assert.equal(response.statusCode, 200);
        assert.equal(response.data.facebookId, facebookData.id);
    });

    it("should get a list of online friends", async () => {
        const accessToken = (await getTestUsersAccessTokens())[1];
        const jwt = (await loginRequest(accessToken)).data.token;

        const friendsResponse = await get("/friends/online", { authorization: "Bearer " + jwt });
        assert.equal(friendsResponse.statusCode, 200);

        const friends = friendsResponse.data;
        const friendNames = friends.map(friend => friend.displayName);
        assert.deepEqual(Object.keys(friends[0]), ['username', 'displayName', 'avatarUrl', '_id']);
        assert.ok(friends.length > 0);
        assert.ok(friendNames.indexOf("Rick") >= 0);
        assert.ok(friendNames.indexOf("Open") >= 0);
        assert.ok(friendNames.indexOf("Bob") >= 0);
        assert.ok(friendNames.indexOf("Maria") >= 0);
    });
});
