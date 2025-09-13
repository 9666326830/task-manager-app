const jwt = require("jsonwebtoken");
const SECRET = "supersecret_change_in_production";

function authenticate(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(401).json({ error: "Missing auth token" });
  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Invalid auth header" });
  const token = parts[1];
  jwt.verify(token, SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = payload;
    next();
  });
}

module.exports = { authenticate, SECRET };
