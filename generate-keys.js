// Generate keys
const crypto = require("crypto");

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString("hex");
console.log("\nJWT_SECRET=" + jwtSecret);

// Generate Encryption Key
const encryptionKey = crypto.randomBytes(32).toString("hex");
console.log("ENCRYPTION_KEY=" + encryptionKey + "\n");
