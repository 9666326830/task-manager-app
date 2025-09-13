const API = "http://localhost:4000/api";

function toast(message, type = "info") {
  const container = document.getElementById("toasts") || document.getElementById("toastContainer");
  if (!container) return alert(message);
  const id = "t" + Date.now();
  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${type} border-0`;
  el.setAttribute("role","alert");
  el.setAttribute("id",id);
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  container.appendChild(el);
  const t = new bootstrap.Toast(el);
  t.show();
  setTimeout(()=> el.remove(), 5000);
}

// Login form on landing
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const res = await fetch(API + "/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast("Login successful", "success");
      window.location = "dashboard.html";
    } else toast(data.error || "Login failed", "danger");
  });
}

// Register form on landing
const regForm = document.getElementById("registerForm");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const res = await fetch(API + "/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.user) {
      toast("Registered! Please login", "success");
      var loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
      loginModal.show();
    } else toast(data.error || "Register failed", "danger");
  });
}

// Page login forms (if present)
const loginFormPage = document.getElementById("loginFormPage");
if (loginFormPage) {
  loginFormPage.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmailPage").value;
    const password = document.getElementById("loginPasswordPage").value;
    const res = await fetch(API + "/auth/login", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location = "dashboard.html";
    } else alert(data.error);
  });
}

// Page register
const registerFormPage = document.getElementById("registerFormPage");
if (registerFormPage) {
  registerFormPage.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("regNamePage").value;
    const email = document.getElementById("regEmailPage").value;
    const password = document.getElementById("regPasswordPage").value;
    const res = await fetch(API + "/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.user) {
      alert("Registered! Please login");
      window.location = "login.html";
    } else alert(data.error);
  });
}
