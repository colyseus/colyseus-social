process.env.WEBPUSH_SUBJECT = 'http://localhost:8000';
process.env.WEBPUSH_PUBLIC_KEY = 'BN1oq1kO-MZFcexPov2yNLSit3R3KcElnH1wJiuXqA3p6V96vK7_LC1JpmqDNOQxf-6umOk1Yl0N8lFiQO6mdd8';
process.env.WEBPUSH_PRIVATE_KEY = '7nIUJ1rZ5fcpy_bDHjFWEFHW-HZJ3CMms-G94a9Upsg';

import cors from "cors";
import express from "express";
import expressSession from "express-session";
import socialRoutesExpress from "../express";

const grant = require('grant').express();

const port = 3000;
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(expressSession({ secret: "!F@(*HF(@*HF" }));
app.use(express.static(__dirname));

app.use("/", socialRoutesExpress);

app.use(grant({
    "defaults": {
        "protocol": "http",
        "host": "localhost:3000",
        "transport": "session",
        "state": true,
        "callback": "/auth/callback"
        // "response": "tokens"
    },
    "google": {
        "key": "402720941034-3748t7qrb9hddjiv0f55raetcjdamgnc.apps.googleusercontent.com",
        "secret": "lk36xNl_tc2-XsPrxfIkfS03",
        "scope": ["openid"],
        "nonce": true,
        "custom_params": {"access_type": "offline"},
    },
    "twitter": {
        "key": "JehPM5P4UxbVbrEQlrtx6ED2x",
        "secret": "M19cCQwfWvA3vBVsNTULruD9Ez5PzJf0GPpWe2YF7DzQxvEkYU",
    },
    "facebook": {
        "key": "353169041992501",
        "secret": "8d17708d062493030db44dd687b73e97"
    }
}));


app.listen(port);
console.log(`Listening on http://localhost:${port}`);
