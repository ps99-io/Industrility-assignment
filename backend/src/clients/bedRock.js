const {
  InvokeModelCommand,
  BedrockRuntimeClient,
} = require("@aws-sdk/client-bedrock-runtime");

module.exports.bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});
