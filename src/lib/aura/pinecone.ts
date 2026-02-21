// @ts-nocheck
const { Pinecone } = require("@pinecone-database/pinecone");

if (!process.env.PINECONE_API_KEY) {
  // Use console.error em vez de throw durante o build 
  // para evitar que o Next.js quebre antes de terminar a compilação
  console.error("PINECONE_API_KEY não configurada.");
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "dummy-key",
});