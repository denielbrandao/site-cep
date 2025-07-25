import { config } from "dotenv";
config();

import OpenAI from "openai";
import fetch from "node-fetch";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function buscarSteamAppId(nome) {
  const res = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(nome)}&cc=br&l=portuguese`);
  const dados = await res.json();
  return dados.items?.[0]?.id || null;
}

async function buscarSteamInfo(appId) {
  const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=br&l=portuguese`);
  const dados = await res.json();
  return dados[appId]?.data || null;
}

export default async function handler(req, res) {
  const { jogo } = req.query;

  if (!jogo) return res.status(400).json({ erro: "Nome do jogo não informado" });

  const appId = await buscarSteamAppId(jogo);
  let steamData = null;
  if (appId) {
    steamData = await buscarSteamInfo(appId);
  }

  const contextoSteam = steamData
    ? `Nome: ${steamData.name}
       Lançamento: ${steamData.release_date?.date} (coming_soon: ${steamData.release_date?.coming_soon})
       Gêneros: ${steamData.genres?.map(g => g.description).join(", ")}
       Idiomas: ${steamData.supported_languages}
       Plataformas: ${Object.entries(steamData.platforms).filter(p => p[1]).map(p => p[0]).join(", ")}
       Multiplayer: ${steamData.categories?.map(c => c.description).join(", ")}`.slice(0, 3000)
    : "Nenhum dado da Steam encontrado.";

  const imagem = steamData?.header_image || "";

  const prompt = `
Você é uma IA que avalia jogos segundo critérios do grupo "Cornos & Perigosos".
Com base nas informações abaixo, gere um JSON com os seguintes campos:

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
- Players: "🟢 Aprovado para 4+", "🟡 Possível sem o Augusto", "🔴 Apenas 1-2 jogadores"
- Válido: 🟢 (se todos os critérios forem bons), 🟡 (se apenas jogável sem Augusto), 🔴 (inadequado)
- Early Access: 
   - 🟢 Lançado (se o jogo já está lançado oficialmente e fora do Early Access)
   - 🟡 Não lançado (se está em Early Access ou ainda não foi lançado)
- Crossplay: 🟢 (tem), 🔴 (não tem), 🟡 (limitado ou só PS5)
- PT-BR: 🟢 Tem PT-BR, 🟡 Sem PT-BR
- GeForce NOW: 🟢, 🔴 ou 🟡
- Imagem: campo deixado em branco (será preenchido no backend)

Informações reais extraídas da Steam:
${contextoSteam}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });

  const resposta = completion.choices[0]?.message?.content;

  try {
    const match = resposta.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match[0]);

    res.status(200).json({
      ...parsed,
      imagem,
      debug: {
        respostaBruta: resposta,
        contextoSteam
      }
    });
  } catch (err) {
    res.status(500).json({
      erro: "Erro ao processar JSON da IA",
      respostaBruta: resposta,
      contextoSteam
    });
  }
}