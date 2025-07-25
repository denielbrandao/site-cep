import fetch from "node-fetch";
import { config } from "dotenv";
config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  const { jogo } = req.query;
  if (!jogo) return res.status(400).json({ erro: "Nome do jogo não informado" });

  // Prompt simples para avaliação
  const prompt = `
Você é uma IA que avalia jogos para o grupo 'Cornos & Perigosos'.
Analise o jogo '${jogo}' e gere uma resposta JSON precisa com os seguintes campos:

{
  "nome": "",
  "players": "",
  "valido": "",
  "earlyAccess": "",
  "crossplay": "",
  "ptbr": "",
  "geforcenow": "",
  "imagem": ""
}

Regras:
- Players: '🟢 Aprovado para 4+', '🟡 Possível sem o Augusto', '🔴 Apenas 1-2 jogadores'
- Válido: 🟢, 🟡 ou 🔴 (com base na soma dos critérios)
- Early Access: 🟢 Lançado (full release), 🟡 Não lançado (em EA ou anunciado)
- Crossplay: 🟢, 🔴 ou 🟡
- PT-BR: 🟢 Tem, 🟡 Não tem
- GeForce NOW: 🟢, 🔴 ou 🟡
- Imagem: link oficial da imagem do jogo (Steam, PS Store, etc.)

Não invente nada. Use apenas dados verificados da web como Steam, Wikipedia, PlayStation Store, Epic Games.
Responda apenas com o JSON.
`;

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const result = await geminiResponse.json();
    const raw = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSON inválido da IA");

    const parsed = JSON.parse(match[0]);
    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({
      erro: "Erro na requisição Gemini",
      detalhes: error.message
    });
  }
}