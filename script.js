async function adicionarJogo() {
  const nome = document.getElementById("inputJogo").value;
  if (!nome) return alert("Digite o nome de um jogo!");

  document.getElementById("loading").style.display = "block";

  const res = await fetch(`/api/validar-jogo.js?jogo=${encodeURIComponent(nome)}`);
  const data = await res.json();

  document.getElementById("loading").style.display = "none";

  if (!data || !data.nome) return alert("Erro ao obter dados do jogo.");

  const tabela = document.querySelector("#tabela tbody");
  const linha = document.createElement("tr");

  linha.innerHTML = `
    <td><img src="${data.imagem}" alt="img" class="game-thumb" /></td>
    <td>${data.nome}</td>
    <td>${data.players}</td>
    <td>${data.valido}</td>
    <td>${data.earlyAccess}</td>
    <td>${data.crossplay}</td>
    <td>${data.ptbr}</td>
    <td>${data.geforcenow}</td>
    <td><button onclick="this.parentElement.parentElement.remove()">❌</button></td>
  `;

  tabela.appendChild(linha);
  document.getElementById("inputJogo").value = "";

  console.log("DEBUG:", data.debug);
}