// src/routes/healthData.js
const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const { logger } = require("../utils/logger");
const {
  healthDataContract,
  provider,
  wallet,
} = require("../blockchain/blockchain");

// Constants
const VALID_HEALTH_DATA_TYPES = [
  "blood_pressure",
  "heart_rate",
  "glucose_level",
  "temperature",
  "oxygen_saturation",
];

const DEFAULT_PRICE = "0.01"; // ETH

// Validation middleware
const validateHealthData = (req, res, next) => {
  try {
    const { healthData, consent } = req.body;

    // Check required fields
    if (!healthData || !consent) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "Both healthData and consent are required",
      });
    }

    // Check consent
    const requiredFields = ["type", "value", "timestamp", "patientId"];
    const missingFields = requiredFields.filter((field) => !healthData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing fields",
        details: `Required fields missing: ${missingFields.join(", ")}`,
      });
    }

    // Check data type
    if (!VALID_HEALTH_DATA_TYPES.includes(healthData.type)) {
      return res.status(400).json({
        error: "Invalid type",
        details: `Type must be one of: ${VALID_HEALTH_DATA_TYPES.join(", ")}`,
      });
    }

    next();
  } catch (error) {
    logger.error("Validation error:", error);
    res.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
  }
};

// Middleware to check contract initialization
const checkContract = (req, res, next) => {
  if (!healthDataContract) {
    return res.status(503).json({
      error: "Service Unavailable",
      details: "Blockchain contract not initialized",
    });
  }
  next();
};

// Route handlers
const submitHealthData = async (req, res) => {
  try {
    const { healthData } = req.body;

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const dataHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(healthData))
    );
    const priceInWei = ethers.parseEther(DEFAULT_PRICE);

    // Check if balance is sufficient
    const tx = await healthDataContract.registerHealthData(
      dataHash,
      priceInWei
    );
    logger.info("Transaction submitted:", tx.hash);

    const receipt = await tx.wait();
    const event = receipt.logs.find(
      (log) => log.eventName === "DataRegistered"
    );

    res.json({
      success: true,
      dataHash,
      transactionHash: receipt.hash,
      dataId: event ? event.args.dataId.toString() : null,
    });
  } catch (error) {
    logger.error("Error submitting health data:", error);
    res.status(500).json({
      error: "Submission failed",
      details: error.message,
    });
  }
};

const getHealthData = async (req, res) => {
  try {
    const nextId = await healthDataContract.nextDataId();
    const results = [];

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
        logger.warn(`Skipping data ID ${i}:`, error.message);
      }
    }

    res.json({
      total: results.length,
      data: results,
    });
  } catch (error) {
    logger.error("Error fetching health data:", error);
    res.status(500).json({
      error: "Fetch failed",
      details: error.message,
    });
  }
};

const getHealthDataById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || id < 1) {
      return res.status(400).json({
        error: "Invalid ID",
        details: "ID must be a positive number",
      });
    }

    const data = await healthDataContract.getDataDetails(id);

    if (!data.dataHash) {
      return res.status(404).json({
        error: "Not found",
        details: `No health data found for ID: ${id}`,
      });
    }

    res.json({
      id,
      dataHash: data.dataHash,
      owner: data.owner,
      isAvailable: data.isAvailable,
      price: ethers.formatEther(data.price),
    });
  } catch (error) {
    logger.error("Error fetching health data by ID:", error);
    res.status(500).json({
      error: "Fetch failed",
      details: error.message,
    });
  }
};

const updateHealthDataPrice = async (req, res) => {
  try {
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
      success: true,
      id,
      newPrice: price,
      transactionHash: receipt.hash,
    });
  } catch (error) {
    logger.error("Error updating price:", error);
    res.status(500).json({
      error: "Update failed",
      details: error.message,
    });
  }
};

// Routes
router.use(checkContract);
router.get("/", getHealthData);
router.get("/:id", getHealthDataById);
router.post("/submit", validateHealthData, submitHealthData);
router.put("/:id/price", updateHealthDataPrice);

module.exports = router;
