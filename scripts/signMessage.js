// scripts/signMessage.js
require("dotenv").config();
const { ethers } = require("ethers");

async function signMessage() {
  try {
    // Get nonce from command line
    const nonce = process.argv[2];
    if (!nonce) {
      console.log("\nUsage: node signMessage.js NONCE_NUMBER");
      console.log("Example: node signMessage.js 293868");
      process.exit(1);
    }

    // Create the exact message
    const message = `Sign this message to authenticate with Health Data Platform\nNonce: ${nonce}`;

    // Create wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

    // Sign message
    const signature = await wallet.signMessage(message);

    // Verify locally
    const recoveredAddress = ethers.verifyMessage(message, signature);

    console.log("\n=== Signing Details ===");
    console.log("Wallet Address:", wallet.address);
    console.log("Message:", message);
    console.log("Signature:", signature);
    console.log("Recovered Address:", recoveredAddress);

    // Create and display the verification payload
    const verifyPayload = {
      address: wallet.address,
      message: message,
      signature: signature,
    };

    console.log("\n=== Verification Payload ===");
    console.log(JSON.stringify(verifyPayload, null, 2));

    // Verify the payload format
    try {
      const testRecovery = ethers.verifyMessage(
        verifyPayload.message,
        verifyPayload.signature
      );
      console.log("\n=== Verification Test ===");
      console.log(
        "Local Verification:",
        testRecovery.toLowerCase() === verifyPayload.address.toLowerCase()
          ? "Success ✅"
          : "Failed ❌"
      );
    } catch (error) {
      console.error("\nVerification Test Failed:", error.message);
    }
  } catch (error) {
    console.error("\nError:", error.message);
  }
}

signMessage();
