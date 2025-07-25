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

async function buscarWikipediaLink(nome) {
  const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(nome)}&format=json`);
  const data = await res.json();
  const page = data?.query?.search?.[0];
  if (!page) return null;
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`;
}

export default async function handler(req, res) {
  const { jogo } = req.query;
  if (!jogo) return res.status(400).json({ erro: "Nome do jogo não informado" });

  const appId = await buscarSteamAppId(jogo);
  const steamData = appId ? await buscarSteamInfo(appId) : null;
  const wikiLink = await buscarWikipediaLink(jogo);

  const contextoSteam = steamData
    ? `Nome: ${steamData.name}
       Lançamento: ${steamData.release_date?.date} (coming_soon: ${steamData.release_date?.coming_soon})
       Gêneros: ${steamData.genres?.map(g => g.description).join(", ")}
       Idiomas: ${steamData.supported_languages}
       Plataformas: ${Object.entries(steamData.platforms).filter(p => p[1]).map(p => p[0]).join(", ")}
       Multiplayer: ${steamData.categories?.map(c => c.description).join(", ")}`.slice(0, 3000)
    : "Nenhum dado da Steam encontrado.";

  const imagem = steamData?.header_image || "";
  const fontes = [];
  if (steamData?.name) fontes.push({ site: "Steam", url: `https://store.steampowered.com/app/${appId}/` });
  if (wikiLink) fontes.push({ site: "Wikipedia", url: wikiLink });

  const prompt = `
Você é uma IA que avalia jogos para o grupo "Cornos & Perigosos".
Com base nas fontes abaixo, gere um JSON com os seguintes campos:

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

Use APENAS os dados contidos no contexto abaixo, sem inventar nada. Cite fatos usando expressões como "Segundo a Steam", "De acordo com a Wikipedia", etc.

Regras:
- Players: "🟢 Aprovado para 4+", "🟡 Possível sem o Augusto", "🔴 Apenas 1-2 jogadores"
- Válido: 🟢, 🟡 ou 🔴 (com base na soma dos critérios)
- Early Access: 
   🟢 Lançado = full release,
   🟡 Não lançado = ainda em acesso antecipado ou anunciado
- Crossplay: 🟢, 🔴 ou 🟡 (limitado)
- PT-BR: 🟢 se disponível em português, 🟡 se não
- GeForce NOW: 🟢, 🔴 ou 🟡
- Imagem: campo deixado em branco (será preenchido pelo sistema)

Fontes:
${contextoSteam}
${wikiLink || ""}
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
      fontes,
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