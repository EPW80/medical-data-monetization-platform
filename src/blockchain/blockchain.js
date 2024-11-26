// src/blockchain/blockchain.js
const { ethers } = require("ethers");
require("dotenv").config({ path: "../../.env" });

// Load contract ABI
const healthDataABI =
  require("../../contracts/HealthDataMonetization.json").abi;

// Environment variables
const infuraApiKey = process.env.INFURA_API_KEY;
const privateKey = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Network
const network = "sepolia";

// Function to get RPC URL
const getRpcUrl = () => {
  return `https://${network}.infura.io/v3/${infuraApiKey}`;
};

// Function to get provider
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

// Function to get wallet
const getWallet = () => {
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in environment variables");
  }
  return new ethers.Wallet(privateKey, provider);
};

// Initialize wallet
const wallet = getWallet();

// Initialize contract
let healthDataContract = null;

function initializeContract(contractAddress) {
  try {
    const address = contractAddress || CONTRACT_ADDRESS;
    if (!address) {
      throw new Error("Contract address is required");
    }

    healthDataContract = new ethers.Contract(address, healthDataABI, wallet);

    console.log("Contract initialized at:", address);

    // Test contract connection
    return healthDataContract;
  } catch (error) {
    console.error("Contract initialization failed:", error);
    throw error;
  }
}

async function callContractMethod(methodName, ...args) {
  try {
    if (!healthDataContract) {
      throw new Error("Contract not initialized");
    }

    const method = healthDataContract[methodName];
    if (!method) {
      throw new Error(`Method ${methodName} not found on contract`);
    }

    const result = await method(...args);
    return result;
  } catch (error) {
    console.error(`Error calling contract method ${methodName}:`, error);
    throw error;
  }
}

// Get contract status
function getContractStatus() {
  return {
    isInitialized: !!healthDataContract,
    address: healthDataContract ? healthDataContract.target : null,
    network: network,
    wallet: wallet.address,
  };
}

// Initialize contract if address is available
if (CONTRACT_ADDRESS) {
  try {
    initializeContract(CONTRACT_ADDRESS);
  } catch (error) {
    console.error("Initial contract initialization failed:", error);
  }
}

module.exports = {
  provider,
  wallet,
  initializeContract,
  callContractMethod,
  getRpcUrl,
  healthDataContract,
  getContractStatus,
};
