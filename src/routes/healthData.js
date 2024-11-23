// src/routes/healthData.js
const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const { logger } = require("../../src/utils/logger");
const {
  healthDataContract,
  provider,
  wallet,
} = require("../../src/blockchain/blockchain");

// Submit health data
router.post("/submit", async (req, res) => {
  try {
    const { healthData, consent } = req.body;

    if (!healthData || !consent) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "Both healthData and consent are required",
      });
    }

    const balance = await provider.getBalance(wallet.address);
    const dataHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(healthData))
    );
    const priceInWei = ethers.parseEther("0.01");

    if (healthDataContract) {
      const tx = await healthDataContract.registerHealthData(
        dataHash,
        priceInWei
      );
      const receipt = await tx.wait();

      res.json({
        message: "Data submitted successfully",
        walletAddress: wallet.address,
        balance: ethers.formatEther(balance),
        dataHash: dataHash,
        transactionHash: receipt.hash,
      });
    } else {
      res.json({
        message: "Data submitted (contract not initialized)",
        walletAddress: wallet.address,
        balance: ethers.formatEther(balance),
        dataHash: dataHash,
      });
    }
  } catch (error) {
    logger.error("Error submitting health data:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});

// Retrieve health data
router.get("/:id", async (req, res) => {
  try {
    if (!healthDataContract) {
      return res.status(500).json({ error: "Contract not initialized" });
    }

    const { id } = req.params;
    const data = await healthDataContract.getDataDetails(id);

    res.json({
      dataHash: data.dataHash,
      owner: data.owner,
      isAvailable: data.isAvailable,
      price: ethers.formatEther(data.price),
    });
  } catch (error) {
    logger.error("Error retrieving health data:", error);
    res.status(500).json({
      error: "Error retrieving data",
      details: error.message,
    });
  }
});

module.exports = router;
