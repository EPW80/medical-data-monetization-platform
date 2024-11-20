// compile.js
const fs = require("fs");
const solc = require("solc");

function compileSolidity() {
  // Read the source code
  const sourceCode = fs.readFileSync(
    "./contracts/HealthDataMonetization.sol",
    "utf8"
  );

  // Define the input
  const input = {
    language: "Solidity",
    sources: {
      "HealthDataMonetization.sol": {
        content: sourceCode,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  // Compile the contract
  console.log("Compiling contract...");
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  // Check for errors
  if (output.errors) {
    output.errors.forEach((error) => {
      console.log(error.formattedMessage);
    });
  }

  // Extract ABI and bytecode
  const contract =
    output.contracts["HealthDataMonetization.sol"]["HealthDataMonetization"];

  // Create contract output
  const contractOutput = {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };

  // Write to file
  fs.writeFileSync(
    "./contracts/HealthDataMonetization.json",
    JSON.stringify(contractOutput, null, 2)
  );

  console.log("Contract compiled successfully!");
}

compileSolidity();
