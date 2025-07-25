import { config } from "dotenv";
config();

import OpenAI from "openai";
import fetch from "node-fetch";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { jogo } = req.query;

  if (!jogo) {
    return res.status(400).json({ erro: "Nome do jogo não informado" });
  }

  const serpData = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(jogo)}&engine=google&api_key=${process.env.SERPAPI_KEY}`);
  const serpJson = await serpData.json();
  const contexto = serpJson.organic_results?.map(r => r.snippet).join("\n").slice(0, 1000) || "";

  const prompt = `
Você é uma IA treinada para avaliar jogos segundo os critérios do grupo "Cornos & Perigosos".
Analise o jogo "${jogo}" com base nas informações abaixo e retorne o resultado estritamente no seguinte formato JSON:

{
  "nome": "",
  "players": "",
  "valido": "",
  "earlyAccess": "",
  "crossplay": "",
  "ptbr": "",
  "geforcenow": "",
  "observacoes": ""
}

Regras:
- Players: "🟢 Aprovado para 4+", "🟡 Possível sem o Augusto", "🔴 Apenas 1-2 jogadores"
- Válido: 🟢, 🟡 ou 🔴 (veredicto final)
- Early Access: 🟢 ou 🔴
- Crossplay: 🟢, 🔴 ou 🟡 (PS5 apenas)
- PT-BR: 🟢 Tem PT-BR ou 🟡 Sem PT-BR
- GeForce NOW: 🟢, 🔴 ou 🟡 (ex: só se rodar via PS5 remoto)
- Observações: texto livre

Contexto do jogo:
${contexto}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const resposta = completion.choices[0]?.message?.content;

  try {
    const json = JSON.parse(resposta);
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao processar JSON da IA", respostaBruta: resposta });
  }
}
