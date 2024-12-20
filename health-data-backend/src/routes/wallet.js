// src/routes/wallet.js
const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const { logger } = require("../utils/logger");
const { provider, wallet } = require("../blockchain/blockchain");

// Get wallet info
router.get("/info", async (req, res) => {
  try {
    const balance = await provider.getBalance(wallet.address);
    const network = await provider.getNetwork();

    res.json({
      address: wallet.address,
      balance: ethers.formatEther(balance),
      network: network.name,
    });
  } catch (error) {
    logger.error("Error getting wallet info:", error);
    res.status(500).json({
      error: "Error getting wallet info",
      details: error.message,
    });
  }
});

module.exports = router;
