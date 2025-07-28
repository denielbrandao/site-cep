import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const nome = searchParams.get("jogo");

  if (!nome) return NextResponse.json({ erro: "Nome do jogo não informado" }, { status: 400 });

  const prompt = `
Você é uma IA encarregada de buscar informações de jogos para uma tabela de 4 jogadores chamada "Cornos & Perigosos".

Analise o jogo "${nome}" e retorne APENAS o seguinte JSON com emojis e descrição curta:

{
  "jogo": "NOME OFICIAL DO JOGO",
  "players": "🟢 Aprovado para 4+",
  "valido": "🟢",
  "early": "🔴 Early Access",
  "cross": "🟢 Crossplay",
  "ptbr": "🟢 PT-BR",
  "geforce": "🟢 GeForce NOW",
  "obs": "Nenhuma observação relevante"
}

- Use 🔴 se o jogo estiver em Early Access ou limitado a 1–2 jogadores.
- Use 🟡 se for jogável sem 1 membro ou com crossplay parcial.
- Use 🟢 apenas se 100% ideal.

Responda SOMENTE com o JSON solicitado.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  try {
    const jsonString = response.choices[0].message.content.trim();
    const data = JSON.parse(jsonString);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ erro: "Erro ao processar resposta da IA" }, { status: 500 });
  }
}
