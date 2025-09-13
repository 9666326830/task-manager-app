const socket = io("http://localhost:4000");
const apiBase = "http://localhost:4000/api";
const tokenC = localStorage.getItem("token");

const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get("id");
const commentList = document.getElementById("commentList");
const commentInput = document.getElementById("commentInput");
const sendCommentBtn = document.getElementById("sendCommentBtn");
const taskDetail = document.getElementById("taskDetail");

async function loadTaskDetail() {
  const res = await fetch(apiBase + "/tasks/" + taskId, { headers: { "Authorization": "Bearer " + tokenC }});
  const t = await res.json();
  taskDetail.innerHTML = `<h4>${t.title} <span class="badge bg-${t.status==='Completed'?'success':'secondary'}">${t.status}</span></h4>
    <p>${t.description || ""}</p>
    <p><small>Due: ${t.due_date || "—"} | Assignee: ${t.assigneeName || "—"}</small></p>
    ${t.attachment ? `<p><a href="${t.attachment}" target="_blank">Attachment</a></p>` : ''}`;
}

async function loadComments() {
  const res = await fetch(apiBase + "/comments/" + taskId, { headers: { "Authorization": "Bearer " + tokenC }});
  const comments = await res.json();
  commentList.innerHTML = "";
  comments.forEach(c => {
    commentList.innerHTML += `<div class="list-group-item"><strong>${c.userName}</strong>: ${c.text} <br><small class="text-muted">${c.createdAt}</small></div>`;
  });
}

sendCommentBtn?.addEventListener("click", async () => {
  const text = commentInput.value.trim();
  if (!text) return;
  await fetch(apiBase + "/comments/" + taskId, {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tokenC },
    body: JSON.stringify({ text })
  });
  commentInput.value = "";
  // server emits comment:added, client will receive and refresh
});

socket.emit("joinTask", taskId);
socket.on("comment:added", (comment) => {
  if (String(comment.taskId) === String(taskId)) loadComments();
});

loadTaskDetail();
loadComments();

window.addEventListener("beforeunload", () => socket.emit("leaveTask", taskId));
