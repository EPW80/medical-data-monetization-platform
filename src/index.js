// src/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const {
  provider,
  wallet,
  initializeContract,
  healthDataContract,
} = require("./blockchain/blockchain");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Initialize contract with deployed address
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
if (CONTRACT_ADDRESS) {
  initializeContract(CONTRACT_ADDRESS);
  console.log("Contract initialized at:", CONTRACT_ADDRESS);
} else {
  console.warn("Warning: CONTRACT_ADDRESS not set in environment variables");
}

app.get("/", (req, res) => {
  res.send("Welcome to the Health Data Monetization Backend");
});

// Route to submit health data
app.post("/submit-data", async (req, res) => {
  try {
    const { healthData, consent } = req.body;

    if (!healthData || !consent) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "Both healthData and consent are required",
      });
    }

    // Get wallet balance
    const balance = await provider.getBalance(wallet.address);

    // Create data hash
    const dataHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(healthData))
    );

    // Set default price (0.01 ETH)
    const priceInWei = ethers.parseEther("0.01");

    // If contract is initialized
    if (healthDataContract) {
      try {
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
      } catch (contractError) {
        console.error("Contract interaction error:", contractError);
        res.status(500).json({
          error: "Contract interaction failed",
          details: contractError.message,
        });
      }
    } else {
      res.json({
        message: "Data submitted (contract not initialized)",
        walletAddress: wallet.address,
        balance: ethers.formatEther(balance),
        dataHash: dataHash,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});

// Get wallet info
app.get("/wallet-info", async (req, res) => {
  try {
    const balance = await provider.getBalance(wallet.address);
    const network = await provider.getNetwork();

    res.json({
      address: wallet.address,
      balance: ethers.formatEther(balance),
      network: network.name,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Error getting wallet info",
      details: error.message,
    });
  }
});

// Get health data details
app.get("/health-data/:id", async (req, res) => {
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
    console.error("Error:", error);
    res.status(500).json({
      error: "Error retrieving data",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
