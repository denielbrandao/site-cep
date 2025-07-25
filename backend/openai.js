// backend/openai.js
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function fetchGameInfo(gameName) {
  const prompt = `Para o jogo '${gameName}', diga se ele está em Early Access, quantos jogadores suporta, se tem crossplay, se tem suporte a PT-BR e se está disponível no GeForce NOW. Responda no seguinte formato JSON:

  {
    "early_access": false,
    "num_players": 4,
    "crossplay": true,
    "ptbr": true,
    "geforce_now": false
  }`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }]
  });

  const content = completion.choices[0].message.content;

  try {
    const data = JSON.parse(content);
    return data;
  } catch (err) {
    console.error("Erro ao converter resposta:", content);
    return null;
  }
}

module.exports = { fetchGameInfo };
