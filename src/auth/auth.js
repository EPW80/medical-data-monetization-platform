// src/auth/auth.js
const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Generate JWT token
function generateToken(address) {
  return jwt.sign({ address }, JWT_SECRET, { expiresIn: "24h" });
}

// Verify JWT token middleware
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    logger.error("Token verification failed:", error);
    res.status(403).json({ error: "Invalid token" });
  }
}

module.exports = {
  generateToken,
  authenticateToken,
};
