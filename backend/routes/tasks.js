const express = require("express");
const db = require("../db");
const { authenticate } = require("../middleware/auth");

function tasksRoutes(io) {
  const router = express.Router();

  // Create task
  router.post("/", authenticate, (req, res) => {
    const { title, description, status, priority, due_date, tags, assignee, attachment } = req.body;
    db.run(`INSERT INTO tasks (title, description, status, priority, due_date, tags, assignee, creator, attachment)
      VALUES (?,?,?,?,?,?,?,?,?)`,
      [title, description, status || "Todo", priority || "Medium", due_date || null, tags || null, assignee || null, req.user.id, attachment || null],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const id = this.lastID;
        db.get("SELECT tasks.*, u.name as assigneeName, cu.name as creatorName FROM tasks LEFT JOIN users u ON tasks.assignee=u.id LEFT JOIN users cu ON tasks.creator=cu.id WHERE tasks.id=?", [id], (err, task) => {
          if (err) return res.status(500).json({ error: err.message });
          io.emit("task:created", task);
          db.run("INSERT INTO activity (text) VALUES (?)", [`${req.user.name || req.user.email} created task "${title}"`]);
          res.json(task);
        });
      });
  });

  // Read tasks (supports filters)
  router.get("/", authenticate, (req, res) => {
    const { status, priority, assignee, search } = req.query;
    let sql = "SELECT tasks.*, u.name as assigneeName, cu.name as creatorName FROM tasks LEFT JOIN users u ON tasks.assignee=u.id LEFT JOIN users cu ON tasks.creator=cu.id";
    const conditions = [];
    const params = [];
    if (status) { conditions.push("tasks.status = ?"); params.push(status); }
    if (priority) { conditions.push("tasks.priority = ?"); params.push(priority); }
    if (assignee) { conditions.push("tasks.assignee = ?"); params.push(assignee); }
    if (search) { conditions.push("(tasks.title LIKE ? OR tasks.description LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }
    if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY tasks.created_at DESC";
    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Get single task
  router.get("/:id", authenticate, (req, res) => {
    db.get("SELECT tasks.*, u.name as assigneeName, cu.name as creatorName FROM tasks LEFT JOIN users u ON tasks.assignee=u.id LEFT JOIN users cu ON tasks.creator=cu.id WHERE tasks.id=?", [req.params.id], (err, row) => {
      if (err || !row) return res.status(404).json({ error: "Task not found" });
      res.json(row);
    });
  });

  // Update task
  router.put("/:id", authenticate, (req, res) => {
    const { title, description, status, priority, due_date, tags, assignee, attachment } = req.body;
    db.run(`UPDATE tasks SET title=?, description=?, status=?, priority=?, due_date=?, tags=?, assignee=?, attachment=?, updated_at = datetime('now') WHERE id=?`,
      [title, description, status, priority, due_date, tags, assignee, attachment, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get("SELECT * FROM tasks WHERE id=?", [req.params.id], (err, task) => {
          io.emit("task:updated", task);
          db.run("INSERT INTO activity (text) VALUES (?)", [`${req.user.name || req.user.email} updated task "${title}"`]);
          res.json({ success: true });
        });
      });
  });

  // Delete task
  router.delete("/:id", authenticate, (req, res) => {
    db.get("SELECT title FROM tasks WHERE id=?", [req.params.id], (err, row) => {
      const title = row ? row.title : "task";
      db.run("DELETE FROM tasks WHERE id=?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        io.emit("task:deleted", { id: req.params.id });
        db.run("INSERT INTO activity (text) VALUES (?)", [`${req.user.name || req.user.email} deleted task "${title}"`]);
        res.json({ success: true });
      });
    });
  });

  return router;
}

module.exports = tasksRoutes;
