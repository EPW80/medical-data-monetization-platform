// deploy.js
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  try {
    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider(
      `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
    );

    // Create wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Deploying contract from address:", wallet.address);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Read the contract ABI and bytecode
    const contractData = require("./contracts/HealthDataMonetization.json");

    // Create contract factory
    const factory = new ethers.ContractFactory(
      contractData.abi,
      contractData.bytecode,
      wallet
    );

    console.log("Deploying contract...");
    const contract = await factory.deploy();

    console.log("Waiting for deployment transaction to be mined...");
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    console.log("\nContract deployed successfully!");
    console.log("Contract address:", contractAddress);
    console.log("\nAdd this to your .env file:");
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);

    // Save deployment info to a file
    const deploymentInfo = {
      contractAddress,
      deploymentTime: new Date().toISOString(),
      network: "sepolia",
      deployer: wallet.address,
    };

    fs.writeFileSync(
      "./deployment-info.json",
      JSON.stringify(deploymentInfo, null, 2)
    );
  } catch (error) {
    console.error("Deployment failed:", error);
  }
}

main();
