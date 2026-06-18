import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é a Aura, uma assistente de inteligência artificial avançada.

Suas características:
- Comunicação clara, inteligente e empática em português brasileiro
- Respostas bem estruturadas com markdown quando necessário (use **negrito** para destaque, \`código\` inline)
- Proatividade: antecipe dúvidas e ofereça contexto adicional útil
- Seja concisa mas completa — evite respostas excessivamente longas sem necessidade
- Se não souber algo, admita com honestidade e sugira como o usuário pode encontrar a resposta

Capacidades principais: análise de dados, programação, redação, pesquisa, raciocínio lógico e criatividade.`;

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ answer: "Mensagem vazia." }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { answer: "⚠️ Erro de configuração: `GROQ_API_KEY` não encontrada. Configure no arquivo `.env.local`." },
        { status: 500 }
      );
    }

    // Montar histórico (últimas 10 trocas para não estoura contexto)
    const recentHistory = (history as { role: string; content: string }[]).slice(-20);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...recentHistory,
          { role: "user", content: message },
        ],
        temperature: 0.65,
        max_tokens: 1024,
        top_p: 0.9,
      }),
    });

    const data = await response.json();

    if (data.error) {
      const errMsg = data.error.message ?? "Erro desconhecido da API Groq";
      console.error("[Aura API] Groq error:", data.error);
      return NextResponse.json(
        { answer: `⚠️ Erro Groq: ${errMsg}` },
        { status: 400 }
      );
    }

    const answer =
      data.choices?.[0]?.message?.content?.trim() ??
      "Não consegui gerar uma resposta. Tente novamente.";

    return NextResponse.json({
      answer,
      model: data.model,
      usage: data.usage,
    });
  } catch (error: any) {
    console.error("[Aura API] Unexpected error:", error);
    return NextResponse.json(
      { answer: `⚠️ Erro interno: ${error.message}` },
      { status: 500 }
    );
  }
}
