import { TaskType } from "@google/generative-ai";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
// @ts-ignore
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { pinecone } from "./pinecone";

export const runAuraEngine = async (query: string, chat_history: any[]) => {
  const googleKey = process.env.GOOGLE_API_KEY;

  // 1. Embeddings configurado para bater com a ingestão
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: googleKey,
    modelName: "text-embedding-004",
    taskType: TaskType.RETRIEVAL_QUERY,
  });

  // 2. Modelo de Chat
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: googleKey,
  });

  const index = pinecone.Index(process.env.PINECONE_INDEX!);

  // 3. VectorStore conectando ao namespace correto
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace: "aura-knowledge",
    textKey: "text",
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever({ k: 3 }),
    { returnSourceDocuments: true }
  );

  return await chain.call({
    question: query,
    chat_history: chat_history,
  });
};