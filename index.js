// index.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
const { provider, wallet } = require("./blockchain");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Health Data Monetization Backend");
});

app.post("/submit-data", async (req, res) => {
  try {
    const { healthData, consent } = req.body;
    const balance = await wallet.getBalance();
    console.log(`Wallet balance: ${ethers.formatEther(balance)} ETH`);

    res.send("Data submitted successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error processing request");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
