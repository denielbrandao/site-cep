async function validarJogo(nome) {
  const res = await fetch(`/api/validar-jogo?jogo=${encodeURIComponent(nome)}`);
  const dados = await res.json();
  return dados;
}

function criarLinha(dados) {
  const tabela = document.getElementById("gameTableBody");
  const tr = document.createElement("tr");

  const campos = [
    "Jogo",
    "Valido",
    "Early Access",
    "Número de Players",
    "Crossplay",
    "Línguas Estranhas",
    "GeForce Now"
  ];

  campos.forEach(campo => {
    const td = document.createElement("td");
    td.textContent = dados[campo] || "-";
    tr.appendChild(td);
  });

  // Botão remover
  const tdRemover = document.createElement("td");
  const btn = document.createElement("button");
  btn.textContent = "Remover";
  btn.onclick = () => tr.remove();
  tdRemover.appendChild(btn);
  tr.appendChild(tdRemover);

  tabela.appendChild(tr);
}

async function addGame() {
  const input = document.getElementById("gameInput");
  const gameName = input.value.trim();
  if (!gameName) return;

  try {
    const dados = await validarJogo(gameName);

    if (dados.erro) {
      alert("Erro ao buscar o jogo: " + dados.erro);
      return;
    }

    criarLinha(dados);
  } catch (e) {
    alert("Erro inesperado ao buscar o jogo.");
    console.error(e);
  }

  input.value = "";
}
