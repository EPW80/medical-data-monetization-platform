// auth.js
const ethers = require("ethers");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

class AuthMiddleware {
  // Verify signature
  async verifySignature(req, res, next) {
    try {
      const { signature, message, address } = req.body;

      // Recover address from signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      // Generate JWT token
      const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: "24h" });
      req.token = token;
      next();
    } catch (error) {
      res.status(401).json({ error: "Authentication failed" });
    }
  }

  // Authenticate token
  async authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ error: "Invalid token" });
    }
  }
}

module.exports = new AuthMiddleware();
