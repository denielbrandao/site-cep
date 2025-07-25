const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  const { jogo } = req.query;

  if (!jogo) {
    return res.status(400).json({ erro: "Nome do jogo não informado" });
  }

  const prompt = `
Você é uma IA treinada para analisar jogos segundo os critérios do grupo "Cornos & Perigosos".

Regras:
- O jogo deve ter suporte para 4 jogadores. Se tiver até 3, marque como "🟡 Possível sem o Augusto". Menos que isso: "🔴 Apenas 1-2 jogadores".
- Se tiver 4 ou mais: "🟢 Aprovado para 4+".
- Se estiver em Early Access ou ainda não lançado: "🔴 Early Access ou não lançado".
- Se for versão final: "🟢 Aprovado".
- Se tiver idioma PT-BR: "🟢 Tem PT-BR". Se não tiver: "🟡 Sem PT-BR".
- Se tiver Crossplay entre PC e PS5: "🟢 Crossplay". Se não tiver: "🔴 Sem crossplay".
- Se estiver no GeForce Now: "🟢 Disponível no GeForce Now". Se não estiver, mas tiver Crossplay com PS5: "🟡 Não tem GFN mas tem cross com PS5". Se não tiver nenhum dos dois: "🔴 Sem GFN e sem cross".
- No final, diga se o jogo é válido: 🟢, 🟡 ou 🔴, baseado nas regras.

Responda em formato JSON com os seguintes campos:
{
  "Jogo": "...",
  "Número de Players": "...",
  "Valido": "...",
  "Early Access": "...",
  "Crossplay": "...",
  "Línguas Estranhas": "...",
  "GeForce Now": "...",
  "Observações": "..."
}

Jogo: ${jogo}
`;

  try {
    const resposta = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const texto = resposta.choices[0].message.content.trim();
    const json = JSON.parse(texto);
    return res.status(200).json(json);
  } catch (e) {
    return res
      .status(500)
      .json({ erro: "Erro na IA", detalhe: e.message || e.toString() });
  }
};
