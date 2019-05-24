process.env.WEBPUSH_SUBJECT = 'http://localhost:8000';
process.env.WEBPUSH_PUBLIC_KEY = 'BN1oq1kO-MZFcexPov2yNLSit3R3KcElnH1wJiuXqA3p6V96vK7_LC1JpmqDNOQxf-6umOk1Yl0N8lFiQO6mdd8';
process.env.WEBPUSH_PRIVATE_KEY = '7nIUJ1rZ5fcpy_bDHjFWEFHW-HZJ3CMms-G94a9Upsg';

import cors from "cors";
import express from "express";
import socialRoutesExpress from "../express";

const port = 3000;
const app = express();

app.use(cors());
app.use("/", socialRoutesExpress);
app.listen(port);

console.log(`Listening on http://localhost:${port}`);
