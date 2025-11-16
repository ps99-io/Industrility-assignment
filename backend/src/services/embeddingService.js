const { InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const { pineConeIndex } = require("../clients/pineCone.js");
const { bedrockClient } = require("../clients/bedRock.js");

// LangChain/Bedrock embedding integration with Pinecone managed under AWS
const embedAndStoreTexts = async (textChunks) => {
  // This function generates embeddings for text chunks using Bedrock and stores them in Pinecone
  const embeddings = [];
  for (const chunk of textChunks) {
    const payload = JSON.stringify({
      inputText: chunk,
    });

    const command = new InvokeModelCommand({
      contentType: "application/json",
      body: payload,
      modelId: "amazon.titan-embed-text-v2:0",
      accept: "application/json",
    });
    console.log("Generating embedding for chunk:", { chunk });

    const response = await bedrockClient.send(command);

    // Decode and parse response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    embeddings.push({
      id: `chunk-${Math.random().toString(36).substr(2, 9)}`,
      values: responseBody.embedding, // embedding vector array
    });
  }

  console.log(`Generated embeddings for ${embeddings.length} chunks.`, {
    embeddings,
  });

  // Upsert vectors to Pinecone (using AWS Managed Pinecone SDK)
  const vectorStoreresp = await pineConeIndex
    .namespace("ns-1")
    .upsert(embeddings);
  console.log(`Upserted ${embeddings.length} vectors to Pinecone.`, {
    vectorStoreresp,
  });
};

module.exports = {
  embedAndStoreTexts,
};
