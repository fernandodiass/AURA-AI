// No ficheiro app/api/aura/chat/route.ts
import { NextResponse } from "next/server";
import { runAuraEngine } from "../../../lib/aura/engine";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    const result = await runAuraEngine(message, history || []);

    return NextResponse.json({ 
      answer: result.text,
      sources: result.sourceDocuments?.map((doc: any) => doc.metadata.source) || []
    });

  } catch (error: any) {
    console.error("Erro Aura:", error);
    return NextResponse.json({ error: "Erro interno no motor Aura" }, { status: 500 });
  }
}