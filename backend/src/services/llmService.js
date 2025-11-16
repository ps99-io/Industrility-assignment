const { InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { bedrockClient } = require("../clients/bedRock.js");
// Call Bedrock LLM to generate formatted text
const queryLLM = async (prompt) => {
  const modelId = "us.anthropic.claude-3-5-haiku-20241022-v1:0";
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ],
  };

  // Invoke Claude with the payload and wait for the response.
  const command = new InvokeModelCommand({
    contentType: "application/json",
    body: JSON.stringify(payload),
    modelId,
  });
  const apiResponse = await bedrockClient.send(command);

  // Decode and return the response(s)
  const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
  /** @type {MessagesResponseBody} */
  const responseBody = JSON.parse(decodedResponseBody);
  return responseBody.content[0].text;
};

module.exports = {
  queryLLM,
};
