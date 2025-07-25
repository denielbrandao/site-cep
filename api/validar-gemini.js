import fetch from "node-fetch";
import { config } from "dotenv";
config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERPAPI_KEY = process.env.SERPAPI_KEY;

function detectarInfo(texto, padroes) {
  for (const padrao of padroes) {
    if (texto.toLowerCase().includes(padrao)) return true;
  }
  return false;
}

export default async function handler(req, res) {
  const { jogo } = req.query;
  if (!jogo) return res.status(400).json({ erro: "Nome do jogo não informado" });

  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(jogo + " crossplay pt-br early access")}&api_key=${SERPAPI_KEY}`;
    const serp = await fetch(url);
    const resultado = await serp.json();

    const contexto = resultado.organic_results?.slice(0, 5).map(r =>
      r.title + ": " + r.snippet
    ).join("\n") || "";

    const texto = contexto.toLowerCase();

    const resposta = {
      nome: jogo,
      players: "🟢 Aprovado para 4+",
      valido: "🟢",
      earlyAccess: texto.includes("early access") && !texto.includes("lançado") ? "🟡 Não lançado" : "🟢 Lançado",
      crossplay: detectarInfo(texto, ["crossplay", "cross-play", "cross platform"]) ? "🟢" : "🔴",
      ptbr: detectarInfo(texto, ["português", "pt-br", "idioma brasileiro"]) ? "🟢" : "🟡",
      geforcenow: "🟡 Informação não confirmada",
      imagem: resultado.inline_images?.[0]?.thumbnail || ""
    };

    // Se nada confiável foi encontrado, tenta fallback com Gemini
    if (!texto || texto.length < 100) {
      if (!GEMINI_API_KEY) {
        return res.status(200).json({ ...resposta, aviso: "Sem contexto e sem fallback Gemini." });
      }

      const prompt = `
Você é uma IA que avalia jogos. Analise o jogo "${jogo}" e gere um JSON assim:
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
Use dados reais. Responda apenas com JSON.
`;

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
      const parsed = JSON.parse(match[0]);
      return res.status(200).json(parsed);
    }

    res.status(200).json(resposta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar ou processar dados", detalhes: err.message });
  }
}