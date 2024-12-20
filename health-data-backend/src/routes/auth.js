// src/routes/auth.js
const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Nonce store
const nonceStore = new Map();

// Generate nonce
const generateNonce = () => {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
};

// Challenge route
router.post("/challenge", async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Invalid address",
      });
    }

    const nonce = generateNonce();
    const message = `Welcome to Health Data Platform!\n\nPlease sign this message to verify your ownership.\n\nNonce: ${nonce}`;

    // Store nonce
    nonceStore.set(address.toLowerCase(), {
      nonce,
      timestamp: Date.now(),
    });

    res.json({ message });
  } catch (error) {
    console.error("Challenge error:", error);
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});

// Verify route
router.post("/verify", async (req, res) => {
  try {
    const { signature, message, address } = req.body;

    console.log("Verify request received:", { address, message, signature });

    // Check all required fields
    if (!signature || !message || !address) {
      return res.status(400).json({
        error: "Missing parameters",
        details: "signature, message, and address are required",
      });
    }

    // Verify address format
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Invalid address format",
      });
    }

    try {
      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({
          error: "Invalid signature",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          address: address.toLowerCase(),
          timestamp: Date.now(),
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Remove nonce
      nonceStore.delete(address.toLowerCase());

      res.json({ token });
    } catch (error) {
      console.error("Signature verification error:", error);
      res.status(401).json({
        error: "Signature verification failed",
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      error: "Server error",
    });
  }
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = { router, authenticateToken };
