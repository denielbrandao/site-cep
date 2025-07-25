import { OpenAI } from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { jogo } = req.query;
  if (!jogo) return res.status(400).json({ erro: "Nome do jogo não informado" });

  try {
    const prompt = `
Você é uma IA treinada para analisar jogos segundo os critérios do grupo "Cornos & Perigosos".
Regras:
- O jogo deve ter suporte para 4 jogadores. Se tiver até 3, marque como "🟡 Possível sem o Augusto". Menos que isso: "🔴 Apenas 1-2 jogadores".
- Se tiver 4 ou mais: "🟢 Aprovado para 4+".
- Se estiver em Early Access: "🔴 Early Access".
- Se tiver Crossplay: "🟢 Crossplay".
- Se não tiver: "🔴 Sem Crossplay".
- Se tiver tradução para português BR: "🟢 PT-BR".
- Se não tiver: "🔴 Sem PT-BR".
- Se estiver disponível no GeForce NOW: "🟢 GeForce NOW".
- Se não estiver: "🔴 Não está no GFN".

Avalie o jogo "${jogo}" e retorne um objeto JSON com os seguintes campos:
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
Retorne apenas o objeto JSON.`;

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
    });

    const resposta = chatCompletion.choices[0].message.content;

    const resultado = JSON.parse(resposta);

    if (!resultado.nome) {
      return res.status(200).json({
        erro: true,
        motivo: "IA não conseguiu entender o nome do jogo",
      });
    }

    console.log("Resultado da IA:", resultado);
    res.status(200).json(resultado);
  } catch (erro) {
    console.error("Erro:", erro);
    res.status(500).json({ erro: "Erro ao validar o jogo" });
  }
}