const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { s3Client } = require("./src/clients/s3Client.js");
const {
  streamToBufferHelper,
  parseDocument,
  createChecksheetXLS,
  createWorkInstructionDOCX,
} = require("./src/utils/fileStreamHelpers.js");
const { embedAndStoreTexts } = require("./src/services/embeddingService.js");
const { queryLLM } = require("./src/services/llmService.js");
const BUCKET = process.env.BUCKET_NAME;

module.exports.getPresignedUrl = async (event) => {
  try {
    const filename = event.queryStringParameters.filename;
    const key = `uploads/${filename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: "application/octet-stream",
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    console.log(`Generated presigned URL for ${key}`, { url, key });

    return {
      statusCode: 200,
      body: JSON.stringify({ url, key }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};

module.exports.generate = async (event) => {
  try {
    const { keys, useCase } = JSON.parse(event.body);

    const allChunks = [];
    for (const key of keys) {
      const resp = await s3Client.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: key })
      );
      console.log(`Fetched file from S3: ${key}`);
      const fileBuffer = await streamToBufferHelper(resp.Body);
      const parsedChunks = await parseDocument(fileBuffer);
      allChunks.push(...parsedChunks);
    }

    console.log(
      `Parsed total ${allChunks.length} text chunks from documents.`,
      { allChunks }
    );

    // Embed and store in Pinecone
    await embedAndStoreTexts(allChunks);

    // Build prompt and query Bedrock LLM
    const prompt = buildPrompt(useCase, allChunks.join(" "));
    console.log("Constructed prompt for LLM:", { prompt });
    const aiOutput = await queryLLM(prompt);

    console.log("Received AI output from LLM:", { aiOutput });

    // Generate final output file
    let outputBuffer, outputKey;
    if (useCase === "checksheet") {
      outputBuffer = await createChecksheetXLS(aiOutput);
      outputKey = `outputs/checksheet-${Date.now()}.xlsx`;
    } else {
      outputBuffer = await createWorkInstructionDOCX(aiOutput);
      outputKey = `outputs/workinstruction-${Date.now()}.docx`;
    }

    // // Upload generated file to S3 bucket
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: outputKey,
        Body: outputBuffer,
        ContentType:
          useCase === "checksheet"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
    );

    // // Generate presigned download URL
    const downloadUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: BUCKET, Key: outputKey }),
      { expiresIn: 600 }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ resultUrl: downloadUrl }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (err) {
    console.error("Error in generate:", err);
    return { statusCode: 500, body: err.message };
  }
};

// Compose prompt for use cases
function buildPrompt(useCase, contextText) {
  if (useCase === "checksheet") {
    return `generate a summary in XLS in a particular format - Checksheet. \n Checksheet is like a form in a row column manner that maintenance technician fills up. \n ${contextText}`;
  }
  if (useCase === "workinstruction") {
    return `generate a summary in DOCX format and create work instructions based on the below text context: \n${contextText}`;
  }
  return contextText;
}
