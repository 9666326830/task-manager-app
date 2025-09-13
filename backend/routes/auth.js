const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { SECRET } = require("../middleware/auth");

const router = express.Router();

// Register
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email & password required" });
  const hashed = bcrypt.hashSync(password, 8);
  db.run("INSERT INTO users (name,email,password) VALUES (?,?,?)", [name, email, hashed], function (err) {
    if (err) return res.status(400).json({ error: "Email already in use" });
    const user = { id: this.lastID, name, email };
    res.json({ user });
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: "Invalid credentials" });
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, SECRET, { expiresIn: "12h" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

module.exports = router;
