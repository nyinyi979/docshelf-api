"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3 = new client_s3_1.S3Client({
    region: region || "us-east-1",
    ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
});
exports.default = s3;
