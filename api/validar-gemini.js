import fetch from "node-fetch";
import { config } from "dotenv";
config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  const { jogo } = req.query;
  if (!jogo) return res.status(400).json({ erro: "Nome do jogo não informado" });

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ erro: "GEMINI_API_KEY não configurada" });
  }

  const prompt = `
Você é uma IA que avalia jogos para o grupo 'Cornos & Perigosos'.
Analise o jogo '${jogo}' e gere uma resposta JSON com os campos:

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

Use dados reais da web (Steam, Wikipedia, PS Store). Não invente. Responda só com o JSON.
`;

  try {
    const geminiResponse = await fetch(
      \`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=\${GEMINI_API_KEY}\`,
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
    if (!match) throw new Error("JSON malformado da IA");

    const parsed = JSON.parse(match[0]);
    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({
      erro: "Erro interno ao processar resposta do Gemini",
      detalhes: error.message
    });
  }
}