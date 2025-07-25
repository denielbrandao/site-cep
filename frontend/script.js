function addGame() {
  const input = document.getElementById("gameInput");
  const gameName = input.value.trim();
  if (!gameName) return;

async function validarJogo(nome) {
  const res = await fetch(`/api/validar-jogo?jogo=${encodeURIComponent(nome)}`);
  const dados = await res.json();
  console.log(dados); // aqui você adapta pra montar a tabela visual no HTML
}


  // Aqui você vai integrar a chamada à API da IA futuramente
  alert(`Ainda não implementado: "${gameName}" será analisado pela IA em breve.`);
  input.value = "";
}
