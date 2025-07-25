export default async function handler(req, res) {
  try {
    const { jogo } = req.query;
    if (!jogo) {
      return res.status(400).json({ erro: 'Nome do jogo não informado' });
    }

    let resultadoGemini = null;

    try {
      const respostaGemini = await fetch(`${process.env.URL_BASE}/api/validar-gemini?jogo=${encodeURIComponent(jogo)}`);
      resultadoGemini = await respostaGemini.json();
    } catch (err) {
      console.error('Erro no Gemini:', err.message);
    }

    if (resultadoGemini?.valido) {
      return res.status(200).json(resultadoGemini);
    }

    let resultadoFallback = null;
    try {
      const respostaFallback = await fetch(`${process.env.URL_BASE}/api/validar-fallback?jogo=${encodeURIComponent(jogo)}`);
      resultadoFallback = await respostaFallback.json();
    } catch (err) {
      console.error('Erro no Fallback:', err.message);
    }

    if (resultadoFallback?.valido) {
      return res.status(200).json(resultadoFallback);
    }

    return res.status(404).json({ erro: 'Nenhuma fonte retornou resultado válido.' });

  } catch (erroFatal) {
    console.error('Erro fatal:', erroFatal.message);
    return res.status(500).json({ erro: 'Erro interno', detalhe: erroFatal.message });
  }
}
