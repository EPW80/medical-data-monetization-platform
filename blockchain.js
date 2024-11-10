// blockchain.js

const { ethers } = require("ethers");
require("dotenv").config();

// Import the contract ABI
const healthDataABI = require("./contracts/HealthDataMonetization.json").abi;

// Environment variables
const infuraApiKey = process.env.INFURA_API_KEY;
const privateKey = process.env.PRIVATE_KEY;

// Network
const network = "sepolia";

// Construct RPC URL
const getRpcUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return `https://${network}.infura.io/v3/${infuraApiKey}`;
  }
  return "http://localhost:8545"; // Local development
};

// Initialize provider
const provider = new ethers.JsonRpcProvider(getRpcUrl());

// Initialize wallet
const wallet = new ethers.Wallet(privateKey, provider);

// Initialize contract
let healthDataContract;

/**
 * Initialize the contract with the deployed address
 * @param {string} contractAddress - The deployed contract address
 */
function initializeContract(contractAddress) {
  healthDataContract = new ethers.Contract(
    contractAddress,
    healthDataABI,
    wallet
  );
}

/**
 * Helper function to handle contract method calls with error handling
 * @param {Function} contractMethod - The contract method to call
 * @param {Array} args - Arguments to pass to the contract method
 * @returns {Promise<any>} - Returns the result of the contract call or logs an error
 */
async function callContractMethod(contractMethod, ...args) {
  try {
    const result = await contractMethod(...args);
    return result;
  } catch (error) {
    console.error("Error calling contract method:", error);
    throw error;
  }
}

module.exports = {
  provider,
  wallet,
  initializeContract,
  callContractMethod,
  getRpcUrl,
};
