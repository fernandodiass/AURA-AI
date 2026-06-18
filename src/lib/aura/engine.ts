// @ts-nocheck
import { ChatCohere, CohereEmbeddings } from "@langchain/cohere";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { PineconeStore } from "@langchain/pinecone";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { pinecone } from "./pinecone";

export async function runAuraEngine(query: string, history: any[]) {
  try {
    const index = pinecone.Index("aura-index");
    const model = new ChatCohere({ apiKey: process.env.COHERE_API_KEY, model: "command-r", temperature: 0.3 });
    const embeddings = new CohereEmbeddings({ apiKey: process.env.COHERE_API_KEY, model: "embed-multilingual-v3.0" });

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text", // Deve ser 'text' para bater com seu print
    });

    const retriever = vectorStore.asRetriever({ k: 2 });
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "Você é a Aura. Responda usando o contexto: {context}"],
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
    ]);

    const combineDocsChain = await createStuffDocumentsChain({
      llm: model,
      prompt,
      // Garante que o conteúdo seja string
      documentSerializer: (docs) => docs.map(d => String(d.pageContent)).join("\n\n"),
    });

    const chain = await createRetrievalChain({ retriever, combineDocsChain });
    const response = await chain.invoke({ input: query, chat_history: history || [] });

    return { text: response.answer, sources: response.context };
  } catch (error) {
    console.error("Erro no Engine:", error);
    throw error;
  }
}