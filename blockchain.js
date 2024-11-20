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
  // Always use Infura URL since we're not running a local node
  return `https://${network}.infura.io/v3/${infuraApiKey}`;
};

// Initialize provider with proper error handling
const getProvider = () => {
  const url = getRpcUrl();
  if (!infuraApiKey) {
    throw new Error("INFURA_API_KEY not found in environment variables");
  }
  console.log(`Connecting to network: ${network}`);
  return new ethers.JsonRpcProvider(url);
};

// Initialize provider
const provider = getProvider();

// Initialize wallet with error checking
const getWallet = () => {
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in environment variables");
  }
  return new ethers.Wallet(privateKey, provider);
};

// Initialize wallet
const wallet = getWallet();

// Initialize contract
let healthDataContract;

function initializeContract(contractAddress) {
  if (!contractAddress) {
    throw new Error("Contract address is required");
  }
  healthDataContract = new ethers.Contract(
    contractAddress,
    healthDataABI,
    wallet
  );
  return healthDataContract;
}

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
