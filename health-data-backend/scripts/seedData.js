// scripts/seedData.js
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// Setup blockchain connection
const provider = new ethers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Load contract ABI and create contract instance
const contractABI = require("../contracts/HealthDataMonetization.json").abi;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const healthDataContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  contractABI,
  wallet
);

// Mock data templates
const healthDataTypes = [
  {
    type: "blood_pressure",
    generateValue: () =>
      `${110 + Math.floor(Math.random() * 40)}/${
        70 + Math.floor(Math.random() * 20)
      }`,
  },
  {
    type: "heart_rate",
    generateValue: () => `${60 + Math.floor(Math.random() * 40)}`,
  },
  {
    type: "glucose_level",
    generateValue: () => `${80 + Math.floor(Math.random() * 120)}`,
  },
  {
    type: "temperature",
    generateValue: () => `${97 + (Math.random() * 4).toFixed(1)}`,
  },
  {
    type: "oxygen_saturation",
    generateValue: () => `${94 + Math.floor(Math.random() * 7)}`,
  },
];

const mockPatients = [
  { id: "P001", age: 45, gender: "F", condition: "Hypertension" },
  { id: "P002", age: 32, gender: "M", condition: "Diabetes" },
  { id: "P003", age: 58, gender: "F", condition: "Heart Disease" },
  { id: "P004", age: 29, gender: "M", condition: "Asthma" },
  { id: "P005", age: 51, gender: "F", condition: "COPD" },
];

function generateMockHealthData() {
  const datasets = [];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 25; i++) {
    const dataType =
      healthDataTypes[Math.floor(Math.random() * healthDataTypes.length)];
    const patient =
      mockPatients[Math.floor(Math.random() * mockPatients.length)];
    const timestamp = new Date(
      now - Math.random() * 30 * dayInMs
    ).toISOString();

    datasets.push({
      healthData: {
        type: dataType.type,
        value: dataType.generateValue(),
        timestamp: timestamp,
        patientId: patient.id,
        patientDetails: {
          age: patient.age,
          gender: patient.gender,
          condition: patient.condition,
        },
        notes: `Routine ${dataType.type} check for ${patient.condition} patient`,
      },
      consent: true,
      price: (0.01 + Math.random() * 0.04).toFixed(3),
    });
  }

  return datasets;
}

async function seedHealthData() {
  try {
    console.log("Starting data seeding...");
    console.log("Contract address:", CONTRACT_ADDRESS);

    // Create data directory if it doesn't exist
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data");
    }

    const datasets = generateMockHealthData();
    const results = [];

    // Get wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

    for (const [index, data] of datasets.entries()) {
      try {
        console.log(`\nProcessing dataset ${index + 1} of 25:`);
        console.log(`Type: ${data.healthData.type}`);
        console.log(`Patient: ${data.healthData.patientId}`);

        // Create data hash
        const dataHash = ethers.keccak256(
          ethers.toUtf8Bytes(JSON.stringify(data.healthData))
        );

        // Convert price to wei
        const priceInWei = ethers.parseEther(data.price.toString());

        // Register on blockchain
        console.log("Registering data on blockchain...");
        const tx = await healthDataContract.registerHealthData(
          dataHash,
          priceInWei
        );

        console.log("Waiting for transaction confirmation...");
        const receipt = await tx.wait();

        results.push({
          dataHash,
          transactionHash: receipt.hash,
          data: data.healthData,
          price: data.price,
        });

        console.log(
          `✅ Successfully registered. Transaction hash: ${receipt.hash}`
        );

        // Wait between transactions
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error processing dataset ${index + 1}:`, error.message);
      }
    }

    // Save results
    fs.writeFileSync(
      "./data/seeded-health-data.json",
      JSON.stringify(results, null, 2)
    );

    console.log("\nSeeding completed!");
    console.log(`Successfully seeded ${results.length} datasets`);
    console.log("Data saved to ./data/seeded-health-data.json");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

// Verify setup before seeding
async function verifySetup() {
  console.log("\nVerifying setup...");

  if (!process.env.INFURA_API_KEY) {
    throw new Error("INFURA_API_KEY not found in environment variables");
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in environment variables");
  }
  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS not found in environment variables");
  }

  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error("Wallet has no ETH. Please fund it first.");
  }

  console.log("Setup verified successfully!\n");
}

// Run verification then seed
verifySetup()
  .then(() => seedHealthData())
  .catch((error) => {
    console.error("Setup verification failed:", error);
  });
