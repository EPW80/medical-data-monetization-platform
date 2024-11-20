// index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
const { provider, wallet, initializeContract } = require("./blockchain");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Initialize contract
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
let healthDataContract;

if (CONTRACT_ADDRESS) {
  healthDataContract = initializeContract(CONTRACT_ADDRESS);
  console.log("Contract initialized at:", CONTRACT_ADDRESS);
} else {
  console.warn("Warning: CONTRACT_ADDRESS not set in environment variables");
}

app.get("/", (req, res) => {
  res.send("Welcome to the Health Data Monetization Backend");
});

// Submit health data
app.post("/submit-data", async (req, res) => {
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
      res.status(500).json({
        error: "Contract not initialized",
        details: "Make sure CONTRACT_ADDRESS is set in .env",
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

// Purchase access to health data
app.post("/purchase-access/:id", async (req, res) => {
  try {
    if (!healthDataContract) {
      return res.status(500).json({ error: "Contract not initialized" });
    }

    const { id } = req.params;

    // Get data details to check price
    const data = await healthDataContract.getDataDetails(id);

    try {
      // Purchase access with the required price
      const tx = await healthDataContract.purchaseAccess(id, {
        value: data.price,
      });

      const receipt = await tx.wait();

      res.json({
        message: "Access purchased successfully",
        transactionHash: receipt.hash,
        dataId: id,
        price: ethers.formatEther(data.price),
      });
    } catch (contractError) {
      console.error("Purchase error:", contractError);
      res.status(500).json({
        error: "Purchase failed",
        details: contractError.message,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Error processing purchase",
      details: error.message,
    });
  }
});

// Check access
app.get("/check-access/:id", async (req, res) => {
  try {
    if (!healthDataContract) {
      return res.status(500).json({ error: "Contract not initialized" });
    }

    const { id } = req.params;
    // Get wallet address
    const address = wallet.address;

    const hasAccess = await healthDataContract.hasAccess(id, address);

    res.json({
      dataId: id,
      address: address,
      hasAccess: hasAccess,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Error checking access",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
