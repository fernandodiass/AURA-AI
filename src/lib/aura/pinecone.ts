// @ts-nocheck
const { Pinecone } = require("@pinecone-database/pinecone");

if (!process.env.PINECONE_API_KEY) {
throw new Error("PINECONE_API_KEY não configurada.");
}

export const pinecone = new Pinecone({
apiKey: process.env.PINECONE_API_KEY,
});