// @ts-nocheck
/* eslint-disable */
const { Pinecone } = require("@pinecone-database/pinecone");


const apiKey = process.env.PINECONE_API_KEY;

export const pinecone = apiKey ? new Pinecone({ apiKey }) : null; 