// @ts-nocheck
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from "@pinecone-database/pinecone";
import { CohereClient } from "cohere-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function ingest() {
  console.log("🚀 Iniciando ingestão corrigida...");
  try {
    const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index("aura-index");

    const loader = new PDFLoader("public/knowledge.pdf");
    const rawDocs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 600, chunkOverlap: 100 });
    const docs = await splitter.splitDocuments(rawDocs);
    
    console.log(`✅ PDF processado: ${docs.length} partes.`);

    const embed = await cohere.embed({
      texts: docs.map(d => d.pageContent),
      model: "embed-multilingual-v3.0",
      inputType: "search_document",
    });

    const records = embed.embeddings.map((values, i) => ({
      id: `v-${i}-${Date.now()}`,
      values: values,
      metadata: { text: String(docs[i].pageContent) } // Força string
    }));

    await index.upsert(records);
    console.log("✨ SUCESSO! Banco de dados atualizado.");
  } catch (error) {
    console.error("🛑 ERRO:", error.message);
  }
}
ingest();