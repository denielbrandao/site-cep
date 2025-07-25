export default async function handler(req, res) {
  try {
    const { jogo } = req.query;
    if (!jogo) return res.status(400).json({ erro: 'Nome não informado' });

    // Exemplo de fallback para outra API como SerpAPI, scraping, etc.
    // Aqui está como stub, substitua pela sua lógica
    return res.status(200).json({ valido: false });
  } catch (e) {
    console.error('Erro fallback:', e.message);
    return res.status(500).json({ erro: 'Erro na função fallback', detalhe: e.message });
  }
}
