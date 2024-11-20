// check-wallet.js
require("dotenv").config();
const { ethers } = require("ethers");

async function checkWallet() {
  try {
    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider(
      `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
    );

    // Create wallet instance
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Get and display address
    console.log("\nWallet Address:", wallet.address);

    // Get and display balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    // Get network info
    const network = await provider.getNetwork();
    console.log("Network:", network.name);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkWallet();
