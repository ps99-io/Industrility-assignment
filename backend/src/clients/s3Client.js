const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

module.exports.s3Client = new S3Client({ region: process.env.AWS_REGION });
