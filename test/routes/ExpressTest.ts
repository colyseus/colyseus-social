import http from "http";
import express from "express";
import phin from "phin";

import authRoutes from "../../router/express";

describe("Express Routes", () => {
    const TESTPORT = 2267;
    const app = express();
    app.use("/auth", authRoutes);

    // spin-up and tear-down express server for testing
    let server: http.Server;
    before((done) => server = app.listen(TESTPORT, done));
    after(() => server.close());

    // 'request' utility
    const request = async (url: string) => await phin({
        url: `http://localhost:${TESTPORT}${url}`,
        parse: 'json',
    });

    it("shouldn't sign in with invalid access token", async () => {
        const accessToken = "invalid%20token";
        const data = await request(`/auth/facebook?accessToken=${accessToken}`);
        console.log("data:", data);
    });
});