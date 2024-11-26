// src/routes/auth.js
const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const auth = require("../auth/auth");
const { logger } = require("../utils/logger");

// Store active nonces
const activeNonces = new Map();

// Generate challenge
router.post("/challenge", async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    // Generate nonce
    const nonce = Math.floor(Math.random() * 1000000).toString();

    // Store nonce with timestamp
    activeNonces.set(address.toLowerCase(), {
      nonce,
      timestamp: Date.now(),
    });

    const message = `Sign this message to authenticate with Health Data Platform\nNonce: ${nonce}`;

    logger.info(`Generated challenge for ${address} with nonce: ${nonce}`);

    res.json({
      message,
      nonce,
    });
  } catch (error) {
    logger.error("Challenge generation error:", error);
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});

// Verify signature
router.post("/verify", async (req, res) => {
  try {
    const { signature, message, address } = req.body;

    logger.info("Verifying signature for:", { address, message });

    if (!signature || !message || !address) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "signature, message, and address are required",
      });
    }

    // Extract nonce from message
    const nonceMatch = message.match(/Nonce: (\d+)/);
    if (!nonceMatch) {
      return res.status(400).json({
        error: "Invalid message format",
        details: "Message must contain 'Nonce: NUMBER'",
      });
    }

    const messageNonce = nonceMatch[1];
    const storedNonceData = activeNonces.get(address.toLowerCase());

    // Verify nonce
    if (!storedNonceData || storedNonceData.nonce !== messageNonce) {
      return res.status(401).json({
        error: "Invalid nonce",
        details: "Nonce is invalid or expired",
      });
    }

    try {
      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      logger.info("Signature verification:", {
        recoveredAddress,
        originalAddress: address,
        matches: recoveredAddress.toLowerCase() === address.toLowerCase(),
      });

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({
          error: "Invalid signature",
          details: "Recovered address doesn't match provided address",
        });
      }

      // Remove used nonce
      activeNonces.delete(address.toLowerCase());

      // Generate token
      const token = auth.generateToken(address);

      res.json({
        token,
        address,
      });
    } catch (sigError) {
      logger.error("Signature verification failed:", sigError);
      return res.status(401).json({
        error: "Invalid signature",
        details: sigError.message,
      });
    }
  } catch (error) {
    logger.error("Verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;
