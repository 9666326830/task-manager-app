const API = "http://localhost:4000/api";
const token = localStorage.getItem("token");
if (!token && window.location.pathname.includes("dashboard")) {
  // redirect to landing if no token
  // (if user opened dashboard directly)
  // window.location = "index.html";
}

// socket setup
const socket = io("http://localhost:4000");
socket.on("task:created", () => loadTasks());
socket.on("task:updated", () => loadTasks());
socket.on("task:deleted", () => loadTasks());
socket.on("comment:added", (c) => {
  // optional toast
});

// join rooms if viewing a task (handled in comments.js)

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token"); localStorage.removeItem("user"); window.location = "index.html";
});

async function fetchJSON(url, opts = {}) {
  opts.headers = opts.headers || {};
  if (token) opts.headers["Authorization"] = "Bearer " + token;
  const res = await fetch(url, opts);
  return res.json();
}

// Load team into assignee select
async function loadTeamIntoSelect() {
  const users = await fetchJSON(API + "/users");
  const sel = document.getElementById("tAssignee");
  if (!sel) return;
  sel.innerHTML = `<option value="">Unassigned</option>`;
  users.forEach(u => sel.innerHTML += `<option value="${u.id}">${u.name || u.email}</option>`);
}
loadTeamIntoSelect();

// Create task with optional attachment
document.getElementById("taskCreateForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("tTitle").value;
  const description = document.getElementById("tDesc").value;
  const priority = document.getElementById("tPriority").value;
  const due_date = document.getElementById("tDue").value || null;
  const assignee = document.getElementById("tAssignee").value || null;
  const tags = document.getElementById("tTags").value || null;
  const fileInput = document.getElementById("tFile");
  let attachment = null;

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const fd = new FormData();
    fd.append("file", fileInput.files[0]);
    const r = await fetch(API.replace("/api","") + "/upload", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token },
      body: fd
    });
    const d = await r.json();
    if (d.file) attachment = d.file;
  }

  await fetchJSON(API + "/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, priority, due_date, assignee, tags, attachment })
  });

  document.getElementById("taskCreateForm").reset();
  loadTasks();
});

// load and render tasks
async function loadTasks() {
  const search = document.getElementById("searchInput")?.value || "";
  const status = document.getElementById("filterStatus")?.value || "";
  const priority = document.getElementById("filterPriority")?.value || "";

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (priority) params.append("priority", priority);

  const tasks = await fetchJSON(API + "/tasks?" + params.toString());
  renderTasks(tasks);
  drawCharts(tasks);
}

function badgePriority(p) {
  if (!p) return 'badge-priority-medium';
  if (p.toLowerCase() === 'high') return 'badge-priority-high';
  if (p.toLowerCase() === 'low') return 'badge-priority-low';
  return 'badge-priority-medium';
}

function badgeColor(status) {
  if (status === "Completed") return "success";
  if (status === "In Progress") return "warning";
  return "secondary";
}

function daysLeft(date) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = Math.ceil((d - now) / (1000*60*60*24));
  return diff;
}

function renderTasks(tasks) {
  const container = document.getElementById("tasksContainer");
  if (!container) return;
  container.innerHTML = "";
  tasks.forEach(t => {
    const overdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== "Completed";
    container.innerHTML += `
      <div class="col-md-6">
        <div class="card mb-3 ${overdue ? 'border-danger' : ''}">
          <div class="card-body">
            <h5 class="card-title">${t.title} <span class="badge bg-${badgeColor(t.status)}">${t.status}</span></h5>
            <p class="card-text">${t.description || ""}</p>
            <p><span class="badge ${badgePriority(t.priority)}">${t.priority}</span>
            ${t.tags ? `<small class="text-muted ms-2">Tags: ${t.tags}</small>` : ""}</p>
            <p><small class="text-muted">Due: ${t.due_date ? t.due_date : "—"} ${t.due_date ? (daysLeft(t.due_date) < 0 ? '<span class="text-danger">(Overdue)</span>' : '') : ''}</small></p>
            <p><small class="text-muted">Assignee: ${t.assigneeName || '—'}</small></p>
            <div>
              <a href="task.html?id=${t.id}" class="btn btn-sm btn-outline-primary me-2">Open</a>
              <button class="btn btn-sm btn-outline-success me-2" onclick="markDone(${t.id})">Mark Done</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${t.id})">Delete</button>
            </div>
          </div>
        </div>
      </div>`;
  });
}

async function markDone(id) {
  await fetchJSON(API + `/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Completed" })
  });
  loadTasks();
}

async function deleteTask(id) {
  if (!confirm("Delete task?")) return;
  await fetchJSON(API + `/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

let statusChart;
function drawCharts(tasks) {
  const counts = { Todo:0, "In Progress":0, Completed:0 };
  tasks.forEach(t => counts[t.status] = (counts[t.status] || 0) + 1);
  const ctx = document.getElementById("statusChart");
  if (!ctx) return;
  if (statusChart) statusChart.destroy();
  statusChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ["Todo","In Progress","Completed"],
      datasets: [{ data: [counts.Todo, counts["In Progress"], counts.Completed] }]
    }
  });
  const total = tasks.length || 1;
  const donePercent = Math.round((counts.Completed / total) * 100);
  document.getElementById("progressText").innerText = `${donePercent}% completed (${counts.Completed}/${total})`;
}

// filters
document.getElementById("searchInput")?.addEventListener("input", () => loadTasks());
document.getElementById("filterStatus")?.addEventListener("change", () => loadTasks());
document.getElementById("filterPriority")?.addEventListener("change", () => loadTasks());

// theme toggle
document.getElementById("themeToggle")?.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// initial load
loadTasks();
