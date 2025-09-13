const ctx1 = document.getElementById("statusChart").getContext("2d");
new Chart(ctx1, {
  type: "pie",
  data: {
    labels: ["Todo", "In Progress", "Completed"],
    datasets: [{ data: [5, 3, 7], backgroundColor: ["#f00","#0f0","#00f"] }]
  }
});

const ctx2 = document.getElementById("priorityChart").getContext("2d");
new Chart(ctx2, {
  type: "bar",
  data: {
    labels: ["Low", "Medium", "High"],
    datasets: [{ data: [4, 6, 2], backgroundColor: ["#999","#0f0","#f00"] }]
  }
});
