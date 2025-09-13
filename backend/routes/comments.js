const express = require("express");
const db = require("../db");
const { authenticate } = require("../middleware/auth");

function commentsRoutes(io) {
  const router = express.Router();

  // Add comment to a task
  router.post("/:taskId", authenticate, (req, res) => {
    const { taskId } = req.params;
    const { text } = req.body;
    db.run("INSERT INTO comments (taskId, userId, text) VALUES (?,?,?)", [taskId, req.user.id, text], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT comments.*, u.name as userName FROM comments LEFT JOIN users u ON comments.userId=u.id WHERE comments.id=?", [this.lastID], (err, comment) => {
        io.to(`task-${taskId}`).emit("comment:added", comment);
        db.run("INSERT INTO activity (text) VALUES (?)", [`${req.user.name || req.user.email} commented on task #${taskId}`]);
        res.json(comment);
      });
    });
  });

  // Get comments for a task
  router.get("/:taskId", authenticate, (req, res) => {
    db.all("SELECT comments.*, u.name as userName FROM comments LEFT JOIN users u ON comments.userId=u.id WHERE taskId=? ORDER BY createdAt ASC", [req.params.taskId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  return router;
}

module.exports = commentsRoutes;
