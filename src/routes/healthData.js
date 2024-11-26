// src/routes/healthData.js
const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const { logger } = require("../../src/utils/logger");
const {
  healthDataContract,
  provider,
  wallet,
  callContractMethod,
} = require("../../src/blockchain/blockchain");

// Validation middleware
const validateHealthData = (req, res, next) => {
  const { healthData, consent } = req.body;

  if (!healthData || !consent) {
    return res.status(400).json({
      error: "Missing required fields",
      details: "Both healthData and consent are required",
    });
  }

  // Validate health data structure
  const requiredFields = ["type", "value", "timestamp", "patientId"];
  const missingFields = requiredFields.filter((field) => !healthData[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Invalid health data",
      details: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  // Validate data types
  const validTypes = [
    "blood_pressure",
    "heart_rate",
    "glucose_level",
    "temperature",
    "oxygen_saturation",
  ];
  if (!validTypes.includes(healthData.type)) {
    return res.status(400).json({
      error: "Invalid health data type",
      details: `Type must be one of: ${validTypes.join(", ")}`,
    });
  }

  next();
};

// Submit health data
router.post("/submit", validateHealthData, async (req, res) => {
  try {
    const { healthData } = req.body;

    // Get wallet balance
    const balance = await provider.getBalance(wallet.address);

    // Create data hash
    const dataHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(healthData))
    );

    // Set price (0.01 ETH)
    const priceInWei = ethers.parseEther("0.01");

    if (healthDataContract) {
      try {
        // Check if we have enough balance for gas
        const gasPrice = await provider.getFeeData();
        const estimatedGas =
          await healthDataContract.registerHealthData.estimateGas(
            dataHash,
            priceInWei
          );

        const gasCost = gasPrice.gasPrice * estimatedGas;
        if (balance < gasCost) {
          return res.status(400).json({
            error: "Insufficient balance",
            details: `Need at least ${ethers.formatEther(gasCost)} ETH for gas`,
          });
        }

        // Register data
        const tx = await healthDataContract.registerHealthData(
          dataHash,
          priceInWei
        );

        logger.info("Transaction sent:", tx.hash);

        const receipt = await tx.wait();

        // Get registration event
        const event = receipt.logs.find(
          (log) => log.eventName === "DataRegistered"
        );

        res.json({
          success: true,
          message: "Data submitted successfully",
          walletAddress: wallet.address,
          balance: ethers.formatEther(balance),
          dataHash: dataHash,
          transactionHash: receipt.hash,
          dataId: event ? event.args.dataId.toString() : null,
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: ethers.formatEther(gasPrice.gasPrice),
        });
      } catch (contractError) {
        logger.error("Contract interaction error:", contractError);
        res.status(500).json({
          error: "Contract interaction failed",
          details: contractError.message,
        });
      }
    } else {
      res.status(503).json({
        error: "Service Unavailable",
        message: "Contract not initialized",
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

// Get health data by ID
router.get("/:id", async (req, res) => {
  try {
    if (!healthDataContract) {
      return res.status(503).json({
        error: "Service Unavailable",
        details: "Contract not initialized",
      });
    }

    const { id } = req.params;

    // Validate ID
    if (isNaN(id) || id < 1) {
      return res.status(400).json({
        error: "Invalid ID",
        details: "ID must be a positive number",
      });
    }

    const data = await healthDataContract.getDataDetails(id);

    // Check if data exists (assuming empty dataHash means no data)
    if (!data.dataHash) {
      return res.status(404).json({
        error: "Not Found",
        details: `No health data found for ID: ${id}`,
      });
    }

    res.json({
      dataHash: data.dataHash,
      owner: data.owner,
      isAvailable: data.isAvailable,
      price: ethers.formatEther(data.price),
      id: id,
    });
  } catch (error) {
    logger.error("Error retrieving health data:", error);
    res.status(500).json({
      error: "Error retrieving data",
      details: error.message,
    });
  }
});

// Get all available health data
router.get("/", async (req, res) => {
  try {
    if (!healthDataContract) {
      return res.status(503).json({
        error: "Service Unavailable",
        details: "Contract not initialized",
      });
    }

    const nextId = await healthDataContract.nextDataId();
    const results = [];

    // Fetch all available data
    for (let i = 1; i < nextId; i++) {
      try {
        const data = await healthDataContract.getDataDetails(i);
        if (data.isAvailable) {
          results.push({
            id: i,
            dataHash: data.dataHash,
            owner: data.owner,
            price: ethers.formatEther(data.price),
          });
        }
      } catch (error) {
        logger.error(`Error fetching data ID ${i}:`, error);
      }
    }

    res.json({
      total: results.length,
      data: results,
    });
  } catch (error) {
    logger.error("Error retrieving health data list:", error);
    res.status(500).json({
      error: "Error retrieving data list",
      details: error.message,
    });
  }
});

// Update price
router.put("/:id/price", async (req, res) => {
  try {
    if (!healthDataContract) {
      return res.status(503).json({
        error: "Service Unavailable",
        details: "Contract not initialized",
      });
    }

    const { id } = req.params;
    const { price } = req.body;

    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({
        error: "Invalid price",
        details: "Price must be a positive number",
      });
    }

    const priceInWei = ethers.parseEther(price.toString());
    const tx = await healthDataContract.updatePrice(id, priceInWei);
    const receipt = await tx.wait();

    res.json({
      message: "Price updated successfully",
      id: id,
      newPrice: price,
      transactionHash: receipt.hash,
    });
  } catch (error) {
    logger.error("Error updating price:", error);
    res.status(500).json({
      error: "Error updating price",
      details: error.message,
    });
  }
});

module.exports = router;
