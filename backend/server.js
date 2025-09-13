const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const tasksRoutes = require("./routes/tasks");
const commentsRoutes = require("./routes/comments");
const uploadRoutes = require("./routes/upload");

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tasks", tasksRoutes(io));
app.use("/api/comments", commentsRoutes(io));
app.use("/api/upload", uploadRoutes);

io.on("connection", (socket) => {
  // clients can join task rooms for comments
  socket.on("joinTask", (taskId) => {
    socket.join(`task-${taskId}`);
  });
  socket.on("leaveTask", (taskId) => {
    socket.leave(`task-${taskId}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
