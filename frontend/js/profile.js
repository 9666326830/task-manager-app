const user = JSON.parse(localStorage.getItem("user") || "{}");
document.getElementById("pName").innerText = user.name || "";
document.getElementById("pEmail").innerText = user.email || "";
document.getElementById("pRole").innerText = user.role || "";
