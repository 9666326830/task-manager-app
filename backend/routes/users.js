const express = require("express");
const db = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// List team members
router.get("/", authenticate, (req, res) => {
  db.all("SELECT id, name, email, role, avatar FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get single user profile
router.get("/:id", authenticate, (req, res) => {
  db.get("SELECT id, name, email, role, avatar FROM users WHERE id = ?", [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "User not found" });
    res.json(row);
  });
});

module.exports = router;
