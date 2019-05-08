import express from "express";

import { facebookAuth } from "../src";

const route = express.Router();

route.get("/facebook", async (req, res) => {
    const { accessToken } = req.params;

    const user = await facebookAuth(accessToken);

    res.json(user);
});

route.get("/logout", (req, res) => {
    res.json({ success: true });
});

export default route;