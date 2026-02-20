import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { answer: "Erro: A chave GROQ_API_KEY não foi lida. Reinicie o terminal." }, 
        { status: 500 }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "Você é a Aura, uma assistente virtual prestativa e amigável. Responda de forma concisa." 
          },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erro Groq:", data.error);
      return NextResponse.json(
        { answer: `Erro na Groq: ${data.error.message}` }, 
        { status: 400 }
      );
    }

    const auraResponse = data.choices[0]?.message?.content || "Não consegui gerar uma resposta.";
    return NextResponse.json({ answer: auraResponse });

  } catch (error: any) {
    return NextResponse.json(
      { answer: "Erro interno no servidor: " + error.message }, 
      { status: 500 }
    );
  }
}