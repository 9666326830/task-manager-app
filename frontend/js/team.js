const API_BASE = "http://localhost:4000/api";

async function loadTeam() {
  const token = localStorage.getItem("token");
  const res = await fetch(API_BASE + "/users", { headers: { "Authorization": "Bearer " + token }});
  const users = await res.json();
  const list = document.getElementById("teamList");
  list.innerHTML = "";
  users.forEach(u => {
    list.innerHTML += `<div class="list-group-item d-flex justify-content-between align-items-center">
      <div><strong>${u.name || u.email}</strong><div><small>${u.email}</small></div></div>
      <div><span class="badge bg-info">${u.role}</span></div>
    </div>`;
  });
}
loadTeam();
