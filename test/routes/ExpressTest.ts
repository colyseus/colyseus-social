import assert from "assert";
import http from "http";
import express from "express";
import phin from "phin";

import authRoutes from "../../router/express";
import { getTestUsersAccessTokens } from "../utils";
import { getFacebookUser } from "../../src/facebook";
import { connectDatabase } from "../../src";

describe("Express Routes", () => {
    const TESTPORT = 2267;
    const app = express();
    app.use("/auth", authRoutes);

    // spin-up and tear-down express server for testing
    let server: http.Server;
    before((done) => {
        connectDatabase((err) => {
            server = app.listen(TESTPORT, done);
        });
    });
    after(() => server.close());

    // 'request' utility
    const request = async (url: string) => await phin({
        url: `http://localhost:${TESTPORT}${url}`,
        parse: 'json'
    });

    it("shouldn't sign in with invalid access token", async () => {
        const accessToken = "invalid%20token";
        const response = await request(`/auth/facebook?accessToken=${accessToken}`);
        assert.equal(response.statusCode, 401);
        assert.equal(response.body.error, "Invalid OAuth access token.");
    });

    it("should register with valid access token", async () => {
        const accessToken = (await getTestUsersAccessTokens())[0];
        const facebookData = await getFacebookUser(accessToken);

        const response = await request(`/auth/facebook?accessToken=${accessToken}`);
        // console.log(response.body);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.facebookId, facebookData.id);
    });
});