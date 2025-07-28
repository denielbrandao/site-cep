document.querySelector("button").addEventListener("click", async () => {
  const nome = document.querySelector("input").value.trim();
  if (!nome) return alert("Digite o nome do jogo");

  document.querySelector("#loading").style.display = "block";

  const res = await fetch("/api/validar-jogo.js?jogo=" + encodeURIComponent(nome));
  const data = await res.json();

  document.querySelector("#loading").style.display = "none";

  if (data.erro) return alert("Erro ao obter dados do jogo.");

  const row = document.createElement("tr");
  row.innerHTML = \`
    <td><img src="/icon.png" width="32" height="32"></td>
    <td>\${data.jogo}</td>
    <td>\${data.players}</td>
    <td>\${data.valido}</td>
    <td>\${data.early}</td>
    <td>\${data.cross}</td>
    <td>\${data.ptbr}</td>
    <td>\${data.geforce}</td>
  \`;
  document.querySelector("table").appendChild(row);
});
