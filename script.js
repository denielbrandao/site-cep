
function search() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#gamesTable tbody tr");

  rows.forEach(row => {
    const game = row.cells[0].textContent.toLowerCase();
    if (game.includes(input)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}
