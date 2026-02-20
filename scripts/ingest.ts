// @ts-nocheck
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function ingest() {
  console.log("🚀 Iniciando ingestão via Chamada Direta (API REST)...");

  try {
    const googleKey = process.env.GOOGLE_API_KEY;
    const pineconeIndexName = process.env.PINECONE_INDEX;
    const pineconeKey = process.env.PINECONE_API_KEY;
    const pdfPath = "public/knowledge.pdf";

    if (!googleKey || !pineconeIndexName || !pineconeKey) throw new Error("Variáveis faltando.");

    const loader = new PDFLoader(pdfPath);
    const rawDocs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const docs = await splitter.splitDocuments(rawDocs);
    
    console.log(`📄 PDF carregado: ${docs.length} fragmentos.`);

    const pineconeClient = new Pinecone({ apiKey: pineconeKey });
    const index = pineconeClient.Index(pineconeIndexName);

    console.log("🧠 Gerando embeddings via REST...");

    const vectors = await Promise.all(
      docs.map(async (doc, i) => {
        // Chamada direta ao endpoint do Google
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${googleKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "models/text-embedding-004",
              content: { parts: [{ text: doc.pageContent }] },
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("❌ Erro Detalhado do Google:", JSON.stringify(data, null, 2));
          throw new Error(`Falha na API: ${response.status}`);
        }

        return {
          id: `chunk-${Date.now()}-${i}`,
          values: data.embedding.values,
          metadata: { text: doc.pageContent, ...doc.metadata },
        };
      })
    );

    console.log(`📤 Enviando ${vectors.length} vetores ao Pinecone...`);
    await index.namespace("aura-knowledge").upsert(vectors);
    console.log("✅ SUCESSO TOTAL NA INGESTÃO!");

  } catch (error: any) {
    console.error("❌ ERRO NO PROCESSO:", error.message);
  }
}

ingest();