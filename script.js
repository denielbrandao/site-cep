document.querySelector("button").addEventListener("click", async () => {
  const nome = document.querySelector("input").value;
  if (!nome) return;

  document.getElementById("loading").style.display = "block";

  try {
    const res = await fetch(`/api/validar-jogo?jogo=${encodeURIComponent(nome)}`);
    const dados = await res.json();

    document.getElementById("loading").style.display = "none";

    if (dados.erro) {
      alert(dados.motivo || "Erro ao obter dados do jogo");
      return;
    }

    const tabela = document.getElementById("tabela");
    const linha = tabela.insertRow();

    linha.insertCell().innerHTML = `<img src="\${dados.imagem}" width="64">`;
    linha.insertCell().innerText = dados.nome;
    linha.insertCell().innerText = dados.players;
    linha.insertCell().innerText = dados.valido;
    linha.insertCell().innerText = dados.earlyAccess;
    linha.insertCell().innerText = dados.crossplay;
    linha.insertCell().innerText = dados.ptbr;
    linha.insertCell().innerText = dados.geforcenow;
  } catch (e) {
    document.getElementById("loading").style.display = "none";
    alert("Erro ao obter dados do jogo");
  }
});