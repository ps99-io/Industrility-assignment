const { Pinecone } = require("@pinecone-database/pinecone");

pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
module.exports.pineConeIndex = pineconeClient.index(process.env.PINECONE_INDEX);
